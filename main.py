import json
import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from uuid import uuid4

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover - optional dependency
    genai = None

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if genai and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

LESSON_TYPE_CONFIG = {
    "개념 설명": {
        "code": 1,
        "headings": [
            {"match": "기본 학습", "label": "기본 학습"},
            {"match": "추가 예시와 비교", "label": "추가 예시와 비교"},
            {"match": "간단한 퀴즈", "label": "간단한 퀴즈"},
        ],
        "prompt": (
            "Structure sections as precisely three blocks titled "
            "'기본 학습', '추가 예시와 비교', and '간단한 퀴즈'. "
            "Each body array should include 3-4 Korean bullet sentences."
        ),
    },
    "롤 플레이": {
        "code": 2,
        "headings": [
            {"match": "role a", "label": "Role A (Learner)"},
            {"match": "role b", "label": "Role B (Counterpart)"},
            {"match": "coaching notes", "label": "Coaching Notes"},
        ],
        "prompt": (
            "Produce a scenario-driven role play. Include three sections: "
            "'Role A (Learner)', 'Role B (... counterpart ...)', and 'Coaching Notes'. "
            "Incorporate the SCENARIO_TIME context and, when provided, the learner goal. "
            "Role sections should contain actionable prompts; coaching notes should guide reviewers."
        ),
    },
    "기타 실전": {
        "code": 3,
        "headings": [
            {"match": "opening statement", "label": "Opening Statement"},
            {"match": "conditional projections", "label": "Conditional Projections"},
            {"match": "closing", "label": "Closing Ask"},
        ],
        "prompt": (
            "Deliver a practical briefing with three sections titled "
            "'Opening Statement', 'Conditional Projections', and 'Closing Ask'. "
            "Ensure numbers and conditional language suit the scenario."
        ),
    },
}


class LessonGenerationRequest(BaseModel):
    lesson_type: str = Field(..., alias="lessonType", description="레슨 타입")
    cefr_level: str = Field(..., alias="cefrLevel", description="CEFR 레벨")
    theme_category: str = Field(..., alias="themeCategory", description="주제 범주")
    grammar_focus: Optional[str] = Field(
        None,
        alias="grammarFocus",
        description="선택적 문법 포커스",
    )
    notes: Optional[str] = Field(
        None,
        description="선택적 세부 설명 메모",
    )
    scenario_time: Optional[str] = Field(
        None,
        alias="scenarioTime",
        description="롤 플레이 시나리오 시간/상황",
    )
    target_goal: Optional[str] = Field(
        None,
        alias="targetGoal",
        description="롤 플레이에서 학습자가 달성해야 할 목표",
    )

    class Config:
        allow_population_by_field_name = True


class Lesson(BaseModel):
    id: str
    title: str
    summary: str
    lessonType: int
    status: str = "pending"
    createdAt: str
    updatedAt: str
    reviewerNotes: str = ""
    submittedBy: str = "AI Lesson Generator"
    tags: Dict[str, Any]
    extraTags: Optional[Any] = None
    content: Any
    riskFlags: Optional[Any] = None


app = FastAPI(title="AI Lesson Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_prompt(payload: LessonGenerationRequest) -> str:
    config = LESSON_TYPE_CONFIG.get(payload.lesson_type)
    instructions = [
        "You are an instructional designer for PATHFLOW.",
        "Generate a rich ESL lesson in Korean for adult learners based on the inputs.",
        "Return JSON with keys: title, summary, sections (array of {heading, body list}), and risk_flags (array).",
        "Body arrays should contain bullet-sized Korean sentences aimed at reviewers.",
        "Keep tone professional and review-focused.",
        "Honor the CEFR level and theme. If grammar focus is missing, select one that matches.",
    ]
    if config:
        instructions.append(config["prompt"])
        required_headings = [item["label"] for item in config["headings"]]
        instructions.append(
            f"Ensure the sections array aligns with these headings in order: {required_headings}."
        )
    else:
        instructions.append(
            "Mirror the heading structure used across existing PATHFLOW lessons (three ordered sections)."
        )
    context: Dict[str, Any] = {
        "lesson_type": payload.lesson_type,
        "cefr_level": payload.cefr_level,
        "theme_category": payload.theme_category,
        "grammar_focus": payload.grammar_focus or "모델이 문맥상 적절하게 선택",
        "notes": payload.notes or "추가 지시 없음",
    }
    scenario_time_value = (payload.scenario_time or "").strip()
    target_goal_value = (payload.target_goal or "").strip()
    if scenario_time_value:
        context["scenario_time"] = scenario_time_value
    if target_goal_value:
        context["target_goal"] = target_goal_value
    if config:
        context["required_headings"] = [item["label"] for item in config["headings"]]

    return "\n".join(instructions) + "\nINPUT:\n" + json.dumps(context, ensure_ascii=False)


def _call_gemini(prompt: str) -> Dict[str, Any]:
    if not genai:
        raise RuntimeError("google-generativeai 패키지가 설치되지 않았습니다.")
    if not GEMINI_API_KEY:
        raise RuntimeError("Gemini API 키가 구성되지 않았습니다.")

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    return _parse_json_response(response.text)


def _parse_json_response(raw_text: str) -> Dict[str, Any]:
    if not raw_text:
        raise RuntimeError("Gemini 응답이 비어 있습니다.")

    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        segments = cleaned.split("```")
        for segment in segments:
            segment_clean = segment.strip()
            if not segment_clean:
                continue
            if segment_clean.lower().startswith("json"):
                segment_clean = segment_clean[4:].strip()
            if segment_clean:
                cleaned = segment_clean
                break

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Gemini 응답을 JSON으로 변환하지 못했습니다.") from exc


def _normalize_sections(content_blocks: Any, lesson_type_code: int) -> Any:
    template = None
    for config in LESSON_TYPE_CONFIG.values():
        if config["code"] == lesson_type_code:
            template = config["headings"]
            break

    if not template:
        return [
            {
                "heading": (block.get("heading") or "").strip(),
                "body": block.get("body", []),
            }
            for block in content_blocks
        ]

    normalized = []
    used_indices = set()
    fallback_line = "AI 생성 내용이 누락되어 추가 보완이 필요합니다."

    for template_item in template:
        match_phrase = template_item["match"]
        label = template_item["label"]
        matched_block = None
        for idx, block in enumerate(content_blocks):
            if idx in used_indices:
                continue
            heading = (block.get("heading") or "").strip()
            if heading and heading.lower().startswith(match_phrase):
                matched_block = block
                used_indices.add(idx)
                break

        heading_text = label
        body = []
        if matched_block:
            heading_text = (matched_block.get("heading") or label).strip() or label
            body = matched_block.get("body") or []

        normalized.append(
            {
                "heading": heading_text,
                "body": body if body else [fallback_line],
            }
        )

    extras = []
    for idx, block in enumerate(content_blocks):
        if idx in used_indices:
            continue
        heading = (block.get("heading") or "").strip() or "추가 섹션"
        body = block.get("body") or [fallback_line]
        extras.append({"heading": heading, "body": body})

    normalized.extend(extras)
    return normalized


def _lesson_type_to_code(lesson_type: str) -> int:
    config = LESSON_TYPE_CONFIG.get(lesson_type)
    if config:
        return config["code"]
    return LESSON_TYPE_CONFIG["개념 설명"]["code"]


def _format_lesson(data: Dict[str, Any], payload: LessonGenerationRequest) -> Lesson:
    now_iso = os.environ.get("GENERATOR_TIMESTAMP_OVERRIDE")
    if not now_iso:
        from datetime import datetime, timezone

        now_iso = datetime.now(timezone.utc).isoformat()

    content_blocks_raw = data.get("sections") or []
    if not isinstance(content_blocks_raw, list):
        content_blocks_raw = []
    lesson_type_code = _lesson_type_to_code(payload.lesson_type)
    content_blocks = _normalize_sections(content_blocks_raw, lesson_type_code)
    risk_flags = data.get("risk_flags") or []
    if not isinstance(risk_flags, list):
        risk_flags = [str(risk_flags)]
    extra_tags = []
    notes_value = (payload.notes or "").strip()
    if notes_value:
        extra_tags.append({"key": "planner_notes", "value": notes_value})
    scenario_time_value = (payload.scenario_time or "").strip()
    if scenario_time_value:
        extra_tags.append({"key": "scenario_time", "value": scenario_time_value})
    target_goal_value = (payload.target_goal or "").strip()
    if target_goal_value:
        extra_tags.append({"key": "learner_goal", "value": target_goal_value})

    return Lesson(
        id=str(uuid4()),
        title=data.get("title", "AI 생성 레슨"),
        summary=data.get("summary", "AI가 생성한 레슨 요약"),
        lessonType=lesson_type_code,
        createdAt=now_iso,
        updatedAt=now_iso,
        tags={
            "CEFR_LEVEL": payload.cefr_level,
            "lesson_type": str(lesson_type_code),
            "theme_category": payload.theme_category,
            "grammer_focus": data.get(
                "grammar_focus", payload.grammar_focus or "Auto-selected"
            ),
        },
        extraTags=extra_tags or None,
        content=[
            {
                "heading": section.get("heading"),
                "body": section.get("body", []),
            }
            for section in content_blocks
        ],
        riskFlags=risk_flags,
    )


@app.post("/lessons/generate", response_model=Lesson)
async def generate_lesson(payload: LessonGenerationRequest):
    try:
        if payload.lesson_type == "롤 플레이" and not (
            payload.scenario_time and payload.scenario_time.strip()
        ):
            raise HTTPException(
                status_code=422, detail="SCENARIO_TIME 값이 필요합니다."
            )

        prompt = _build_prompt(payload)
        raw = _call_gemini(prompt)
        lesson = _format_lesson(raw, payload)
        return lesson
    except HTTPException:
        raise
    except Exception as exc:  # pylint: disable=broad-except
        raise HTTPException(status_code=500, detail=str(exc)) from exc
