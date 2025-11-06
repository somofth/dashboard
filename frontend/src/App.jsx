import { useEffect, useId, useMemo, useRef, useState } from "react";
import { initialLessons, lessonTypeMap, statusMap } from "./data/lessons.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const LESSON_TYPE_OPTIONS = [
  { value: "개념 설명", label: "개념 설명" },
  { value: "롤 플레이", label: "롤 플레이" },
];

const CEFR_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const THEME_SUGGESTIONS = [
  "비즈니스",
  "여행",
  "기술",
  "일상적 대화",
  "교육",
  "문화",
];

const LANGUAGE_OPTIONS = [
  {
    value: "en",
    label: "영어 (English)",
    emoji: "🇺🇸",
    imageSrc: "/us_flag.png",
  },
  {
    value: "ja",
    label: "일본어 (日本語)",
    emoji: "🇯🇵",
    imageSrc: "/japan_flag.png",
  },
  {
    value: "zh",
    label: "중국어 (中文)",
    emoji: "🇨🇳",
    imageSrc: "/china_flag.png",
  },
];

const LANGUAGE_MAP = LANGUAGE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {});

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function HumanReviewPill() {
  const [isOpen, setIsOpen] = useState(false);
  const show = () => setIsOpen(true);
  const hide = () => setIsOpen(false);

  return (
    <div
      className="pill-with-modal"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span
        className="pill pill--interactive"
        id="human-review-pill"
        tabIndex={0}
      >
        인간 검증 필수
      </span>
      <div
        className="hover-modal"
        id="human-review-modal"
        role="tooltip"
        aria-hidden={(!isOpen).toString()}
      >
        <h3>왜 인간 검증이 필요할까요?</h3>
        <p>
          AI는 RAG 기반으로 답변하지만, 학습 철학과 맞지 않는 콘텐츠나 문법
          오류를 만들어낼 수 있습니다.
        </p>
        <ul>
          <li>환각(Hallucination)으로 인한 허위 정보 차단</li>
          <li>PATHFLOW 커리큘럼 톤 &amp; 룰 준수 여부 확인</li>
          <li>규정과 실제 서비스 정책의 일치성 보장</li>
        </ul>
      </div>
    </div>
  );
}

function StatusTabs({ activeStatus, onChange, counts }) {
  const tabs = [
    { key: "pending", label: "검토 대기" },
    { key: "approved", label: "승인 완료" },
    { key: "revision_requested", label: "수정 요청됨" },
    { key: "rejected", label: "거부됨" },
  ];

  return (
    <nav className="status-tabs" aria-label="검수 상태 선택">
      {tabs.map(({ key, label }) => {
        const isActive = key === activeStatus;
        const classes = ["status-tab"];
        if (isActive) {
          classes.push("status-tab--active");
        }

        return (
          <button
            key={key}
            type="button"
            className={classes.join(" ")}
            data-status={key}
            onClick={() => onChange(key)}
          >
            {label}
            <span className="status-count" data-count-status={key}>
              {counts[key] ?? 0}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function FiltersPanel({ filters, onFilterChange, onReset }) {
  return (
    <aside className="filters-panel">
      <section className="filters">
        <div className="filter-group">
          <label htmlFor="filter-cefr">CEFR 수준</label>
          <select
            id="filter-cefr"
            value={filters.cefr}
            onChange={(event) => onFilterChange("cefr", event.target.value)}
          >
            <option value="all">전체</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-theme">테마</label>
          <select
            id="filter-theme"
            value={filters.theme}
            onChange={(event) => onFilterChange("theme", event.target.value)}
          >
            <option value="all">전체</option>
            <option value="business">Business</option>
            <option value="tech_Coding">Tech &amp; Coding</option>
            <option value="everyday_life">Everyday Life</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-lesson-type">레슨 타입</label>
          <select
            id="filter-lesson-type"
            value={filters.lessonType}
            onChange={(event) =>
              onFilterChange("lessonType", event.target.value)
            }
          >
            <option value="all">전체</option>
            <option value="1">1 - 개념 설명</option>
            <option value="2">2 - 롤 플레이</option>
            <option value="3">3 - 기타</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-grammar">문법 포커스</label>
          <input
            type="search"
            id="filter-grammar"
            placeholder="예: conditional, tense"
            value={filters.grammar}
            onChange={(event) => onFilterChange("grammar", event.target.value)}
          />
        </div>
        <button
          className="reset-btn"
          id="filters-reset"
          type="button"
          onClick={onReset}
        >
          필터 초기화
        </button>
      </section>
    </aside>
  );
}

function LessonCreationDialog({
  open,
  form,
  onChange,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}) {
  const dialogRef = useRef(null);
  const themeListId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  if (!open) {
    return null;
  }

  return (
    <dialog ref={dialogRef} id="lesson-creation-dialog">
      <form
        method="dialog"
        className="dialog-content lesson-creation-dialog"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <header className="dialog-header">
          <div>
            <h2>AI 레슨 생성</h2>
            <p>입력값을 바탕으로 Gemini가 신규 레슨을 제안합니다.</p>
          </div>
          <button
            className="dialog-close"
            type="button"
            aria-label="닫기"
            onClick={() => {
              const dialog = dialogRef.current;
              if (dialog?.open) {
                dialog.close();
              } else {
                onClose();
              }
            }}
          >
            ×
          </button>
        </header>

        <section className="dialog-body">
          <div className="dialog-section">
            <h3>필수 입력</h3>
            <div className="filter-group">
              <label htmlFor="creation-lesson-type">레슨 타입</label>
              <select
                id="creation-lesson-type"
                value={form.lessonType}
                onChange={(event) => onChange("lessonType", event.target.value)}
                required
              >
                {LESSON_TYPE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="creation-language">수업 대상 언어</label>
              <select
                id="creation-language"
                value={form.targetLanguage}
                onChange={(event) =>
                  onChange("targetLanguage", event.target.value)
                }
                required
              >
                {LANGUAGE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                안내 문구는 한국어로 제공되며, 연습 표현은 선택한 언어에 맞춰
                생성됩니다.
              </p>
            </div>
            <div className="filter-group">
              <label htmlFor="creation-cefr">CEFR 레벨</label>
              <select
                id="creation-cefr"
                value={form.cefrLevel}
                onChange={(event) => onChange("cefrLevel", event.target.value)}
                required
              >
                {CEFR_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="creation-theme">
                THEME_CATEGORY
                <span
                  style={{ color: "var(--text-muted)", marginLeft: "0.35rem" }}
                >
                  (선택 또는 직접 입력)
                </span>
              </label>
              <input
                id="creation-theme"
                list={themeListId}
                value={form.themeCategory}
                onChange={(event) =>
                  onChange("themeCategory", event.target.value)
                }
                placeholder="예: 비즈니스"
                required
              />
              <datalist id={themeListId}>
                {THEME_SUGGESTIONS.map((theme) => (
                  <option key={theme} value={theme} />
                ))}
              </datalist>
            </div>
            {form.lessonType === "롤 플레이" && (
              <div className="filter-group">
                <label htmlFor="creation-scenario">SCENARIO_TIME</label>
                <input
                  id="creation-scenario"
                  value={form.scenarioTime}
                  onChange={(event) =>
                    onChange("scenarioTime", event.target.value)
                  }
                  placeholder="예: 오전 러시아워"
                  required
                />
              </div>
            )}
          </div>

          <div className="dialog-section">
            <h3>선택 입력</h3>
            <div className="filter-group">
              <label htmlFor="creation-grammar">GRAMMER_FOCUS</label>
              <input
                id="creation-grammar"
                value={form.grammarFocus}
                onChange={(event) =>
                  onChange("grammarFocus", event.target.value)
                }
                placeholder="입력하지 않으면 AI가 추천합니다."
              />
            </div>
            {form.lessonType === "롤 플레이" && (
              <div className="filter-group">
                <label htmlFor="creation-goal">학습자 목표 (선택 사항)</label>
                <input
                  id="creation-goal"
                  value={form.targetGoal}
                  onChange={(event) =>
                    onChange("targetGoal", event.target.value)
                  }
                  placeholder="예: 고객 불만을 정중히 완화하기"
                />
              </div>
            )}
            <div className="filter-group">
              <label htmlFor="creation-notes">세부 설명 메모</label>
              <textarea
                id="creation-notes"
                rows={4}
                value={form.notes}
                onChange={(event) => onChange("notes", event.target.value)}
                placeholder="검수자의 의도나 톤 지침을 적어주세요. (선택)"
              />
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(255, 92, 92, 0.12)",
                color: "var(--danger)",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
              }}
              role="alert"
            >
              {error}
            </div>
          )}
        </section>

        <footer className="dialog-footer">
          <button
            type="button"
            className="btn-neutral"
            onClick={() => {
              const dialog = dialogRef.current;
              if (dialog?.open) {
                dialog.close();
              } else {
                onClose();
              }
            }}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "생성 중..." : "AI에게 생성 요청"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

function Tag({ label, value }) {
  return (
    <span className="tag">
      <strong>{label}</strong> {value}
    </span>
  );
}

function LanguageFlag({ code }) {
  const normalizedCode = (code || "en").toLowerCase();
  const metadata = LANGUAGE_MAP[normalizedCode] ?? {
    emoji: "🏳️",
    label: "미정",
    imageSrc: undefined,
  };
  return (
    <span
      className="language-flag"
      role="img"
      aria-label={`${metadata.label} 레슨`}
      title={`${metadata.label} 레슨`}
    >
      {metadata.imageSrc ? (
        <img
          src={metadata.imageSrc}
          alt={`${metadata.label} 국기`}
          className="language-flag__img"
        />
      ) : (
        metadata.emoji
      )}
    </span>
  );
}

function LessonCard({ lesson, onOpen, onStatusChange }) {
  const {
    id,
    title,
    targetLanguage: lessonTargetLanguage,
    lessonType,
    summary,
    updatedAt,
    submittedBy,
    status,
    tags,
    extraTags = [],
    reviewerNotes,
    riskFlags = [],
  } = lesson;

  const targetLanguage = (
    lessonTargetLanguage ??
    lesson.tags?.TARGET_LANGUAGE ??
    "en"
  ).toLowerCase();

  const languageMeta = LANGUAGE_MAP[targetLanguage] ?? {
    emoji: "🏳️",
    label: "미정",
  };

  return (
    <article className="lesson-card" data-lesson-id={id}>
      <header>
        <div className="lesson-title-wrapper">
          <LanguageFlag code={targetLanguage} />
          <h2 className="lesson-title">{title}</h2>
        </div>
        <span className={`lesson-status status-${status}`}>
          {statusMap[status] ?? status}
        </span>
      </header>

      <div className="lesson-meta">
        <span>레슨 타입: {lessonTypeMap[lessonType] ?? "N/A"}</span>
        <span>대상 언어: {languageMeta.label}</span>
        <span>업데이트: {formatDate(updatedAt)}</span>
        <span>생성: {submittedBy}</span>
      </div>

      <p className="lesson-summary">{summary}</p>

      <div className="tag-group">
        {Object.entries(tags).map(([key, value]) => (
          <Tag key={key} label={key} value={value} />
        ))}
        {extraTags.map(({ key, value }) => (
          <Tag key={`${key}-${value}`} label={key} value={value} />
        ))}
      </div>

      {riskFlags.length > 0 && (
        <ul className="lesson-flags">
          {riskFlags.map((flag) => (
            <li key={flag}>{flag}</li>
          ))}
        </ul>
      )}

      <div className="card-footer">
        <p className="card-notes">
          {reviewerNotes?.trim()
            ? `최근 메모: ${reviewerNotes}`
            : "검수 메모가 아직 없습니다."}
        </p>
        <div className="action-group">
          <button
            className="btn-neutral"
            type="button"
            onClick={() => onOpen(id)}
          >
            자세히 보기
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={() =>
              onStatusChange(
                id,
                "approved",
                "대시보드에서 빠른 승인 처리되었습니다."
              )
            }
          >
            빠른 승인
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() =>
              onStatusChange(
                id,
                "revision_requested",
                "추가 검수를 위해 수정 요청으로 보류되었습니다."
              )
            }
          >
            수정 요청
          </button>
          <button
            className="btn-danger"
            type="button"
            onClick={() =>
              onStatusChange(
                id,
                "rejected",
                "대시보드에서 반려 처리되었습니다."
              )
            }
          >
            반려
          </button>
        </div>
      </div>
    </article>
  );
}

function LessonList({ lessons, onOpenLesson, onStatusChange }) {
  if (lessons.length === 0) {
    return (
      <section className="lesson-list" id="lesson-list" aria-live="polite">
        <div className="lesson-card">
          <header>
            <h2 className="lesson-title">검색 결과가 없습니다</h2>
          </header>
          <p className="lesson-summary">
            선택한 필터에 해당하는 수업이 없습니다. 필터를 조정하거나 초기화해
            주세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="lesson-list" id="lesson-list" aria-live="polite">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          onOpen={onOpenLesson}
          onStatusChange={onStatusChange}
        />
      ))}
    </section>
  );
}

function LessonDialog({ lesson, notes, onNotesChange, onClose, onSubmit }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (lesson && !dialog.open) {
      dialog.showModal();
    }
    if (!lesson && dialog.open) {
      dialog.close();
    }
  }, [lesson]);

  if (!lesson) {
    return null;
  }

  const languageMeta = LANGUAGE_MAP[
    (
      lesson.targetLanguage ??
      lesson.tags?.TARGET_LANGUAGE ??
      "en"
    ).toLowerCase()
  ] ?? { label: "미정" };

  return (
    <dialog id="lesson-dialog" ref={dialogRef}>
      <form
        method="dialog"
        className="dialog-content"
        onSubmit={(event) => {
          event.preventDefault();
          const submitter = event.nativeEvent.submitter;
          if (!submitter) return;
          onSubmit(submitter.value);
        }}
      >
        <header className="dialog-header">
          <div>
            <h2 id="dialog-title">{lesson.title}</h2>
            <p id="dialog-subtitle">
              CEFR {lesson.tags.CEFR_LEVEL} · {languageMeta.label} ·{" "}
              {lessonTypeMap[lesson.lessonType]} ·{" "}
              {statusMap[lesson.status] ?? lesson.status} ·{" "}
              {formatDate(lesson.updatedAt)}
            </p>
          </div>
          <button
            className="dialog-close"
            value="close"
            aria-label="닫기"
            type="button"
            onClick={() => {
              const dialog = dialogRef.current;
              if (dialog?.open) {
                dialog.close("close");
              } else {
                onClose();
              }
            }}
          >
            ×
          </button>
        </header>

        <section className="dialog-body">
          <div className="dialog-section">
            <h3>핵심 태그</h3>
            <div className="tag-grid" id="dialog-tags">
              {Object.entries(lesson.tags).map(([key, value]) => (
                <Tag key={key} label={key} value={value} />
              ))}
              {(lesson.extraTags ?? []).map(({ key, value }) => (
                <Tag key={`${key}-${value}`} label={key} value={value} />
              ))}
            </div>
          </div>
          <div className="dialog-section">
            <h3>수업 개요</h3>
            <p id="dialog-summary">{lesson.summary}</p>
          </div>
          <div className="dialog-section">
            <h3>AI 제안 콘텐츠</h3>
            <div className="dialog-content-block" id="dialog-content">
              {(lesson.content ?? []).map(({ heading, body = [] }) => (
                <section
                  className="lesson-preview-section"
                  key={heading ?? body.join("-")}
                >
                  {heading && (
                    <>
                      <h4 className="lesson-preview-title">{heading}</h4>
                      <hr className="lesson-preview-divider" />
                    </>
                  )}
                  {body.map((paragraph, index) => (
                    <p key={`${heading ?? "paragraph"}-${index}`}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </div>
          <div
            className="dialog-section"
            id="dialog-flags-wrapper"
            style={{
              display: (lesson.riskFlags?.length ?? 0) > 0 ? "block" : "none",
            }}
          >
            <h3>리스크 신호</h3>
            <ul id="dialog-flags">
              {(lesson.riskFlags ?? []).map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>
          <div className="dialog-section">
            <h3>검수 메모</h3>
            <textarea
              id="dialog-notes"
              rows={4}
              placeholder="승인/반려 사유 또는 수정 요청사항을 남겨주세요."
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
            />
          </div>
        </section>

        <footer className="dialog-footer">
          <button
            type="submit"
            className="btn-secondary"
            value="revision_requested"
          >
            수정 요청
          </button>
          <button type="submit" className="btn-danger" value="rejected">
            반려
          </button>
          <button type="submit" className="btn-primary" value="approved">
            승인
          </button>
        </footer>
      </form>
    </dialog>
  );
}

export default function App() {
  const [lessons, setLessons] = useState(() =>
    JSON.parse(JSON.stringify(initialLessons))
  );
  const [activeStatus, setActiveStatus] = useState("pending");
  const [filters, setFilters] = useState({
    cefr: "all",
    theme: "all",
    lessonType: "all",
    grammar: "",
  });
  const [dialogLessonId, setDialogLessonId] = useState(null);
  const [dialogNotes, setDialogNotes] = useState("");
  const [isCreationOpen, setCreationOpen] = useState(false);
  const [creationForm, setCreationForm] = useState({
    lessonType: LESSON_TYPE_OPTIONS[0].value,
    targetLanguage: LANGUAGE_OPTIONS[0].value,
    cefrLevel: CEFR_OPTIONS[1],
    themeCategory: THEME_SUGGESTIONS[0],
    grammarFocus: "",
    notes: "",
    scenarioTime: "",
    targetGoal: "",
  });
  const [creationError, setCreationError] = useState("");
  const [isSubmittingCreation, setSubmittingCreation] = useState(false);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === dialogLessonId) ?? null,
    [lessons, dialogLessonId]
  );

  useEffect(() => {
    if (activeLesson) {
      setDialogNotes(activeLesson.reviewerNotes ?? "");
    } else {
      setDialogNotes("");
    }
  }, [activeLesson]);

  const statusCounts = useMemo(() => {
    return lessons.reduce(
      (acc, lesson) => {
        if (acc[lesson.status] !== undefined) {
          acc[lesson.status] += 1;
        }
        return acc;
      },
      {
        pending: 0,
        approved: 0,
        revision_requested: 0,
        rejected: 0,
      }
    );
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    const grammarTerm = filters.grammar.trim().toLowerCase();

    return lessons
      .filter((lesson) => {
        const matchesStatus =
          activeStatus === "all" || lesson.status === activeStatus;
        const matchesCefr =
          filters.cefr === "all" || lesson.tags.CEFR_LEVEL === filters.cefr;
        const matchesTheme =
          filters.theme === "all" ||
          lesson.tags.theme_category === filters.theme;
        const matchesLessonType =
          filters.lessonType === "all" ||
          lesson.tags.lesson_type === filters.lessonType;
        const matchesGrammar =
          grammarTerm === "" ||
          (lesson.tags.grammer_focus ?? "").toLowerCase().includes(grammarTerm);

        return (
          matchesStatus &&
          matchesCefr &&
          matchesTheme &&
          matchesLessonType &&
          matchesGrammar
        );
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [lessons, activeStatus, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () =>
    setFilters({
      cefr: "all",
      theme: "all",
      lessonType: "all",
      grammar: "",
    });

  const handleStatusChange = (lessonId, nextStatus, notes = "") => {
    const trimmedNotes = notes.trim();
    setLessons((current) =>
      current.map((lesson) => {
        if (lesson.id !== lessonId) return lesson;
        return {
          ...lesson,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          reviewerNotes:
            trimmedNotes !== "" ? trimmedNotes : lesson.reviewerNotes,
        };
      })
    );
  };

  const openLessonDialog = (lessonId) => {
    setDialogLessonId(lessonId);
  };

  const closeLessonDialog = () => {
    setDialogLessonId(null);
  };

  const handleDialogSubmit = (nextStatus) => {
    if (nextStatus === "close") {
      closeLessonDialog();
      return;
    }
    if (!activeLesson) return;
    handleStatusChange(activeLesson.id, nextStatus, dialogNotes);
    closeLessonDialog();
  };

  const openCreationDialog = () => {
    setCreationError("");
    setCreationOpen(true);
  };

  const closeCreationDialog = () => {
    setCreationOpen(false);
  };

  const updateCreationForm = (key, value) => {
    setCreationError("");
    setCreationForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "lessonType" && value !== "롤 플레이"
        ? { scenarioTime: "", targetGoal: "" }
        : {}),
    }));
  };

  const resetCreationForm = () => {
    setCreationForm({
      lessonType: LESSON_TYPE_OPTIONS[0].value,
      targetLanguage: LANGUAGE_OPTIONS[0].value,
      cefrLevel: CEFR_OPTIONS[1],
      themeCategory: THEME_SUGGESTIONS[0],
      grammarFocus: "",
      notes: "",
      scenarioTime: "",
      targetGoal: "",
    });
  };

  const submitCreationRequest = async () => {
    if (
      creationForm.lessonType === "롤 플레이" &&
      creationForm.scenarioTime.trim() === ""
    ) {
      setCreationError("SCENARIO_TIME 값을 입력해 주세요.");
      return;
    }

    setSubmittingCreation(true);
    setCreationError("");

    try {
      const response = await fetch(`${API_BASE_URL}/lessons/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonType: creationForm.lessonType,
          targetLanguage: creationForm.targetLanguage,
          cefrLevel: creationForm.cefrLevel,
          themeCategory: creationForm.themeCategory,
          grammarFocus: creationForm.grammarFocus || null,
          notes: creationForm.notes || null,
          scenarioTime:
            creationForm.lessonType === "롤 플레이"
              ? creationForm.scenarioTime.trim()
              : null,
          targetGoal:
            creationForm.lessonType === "롤 플레이"
              ? creationForm.targetGoal.trim() || null
              : null,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || "AI 레슨 생성에 실패했습니다.");
      }

      const lesson = await response.json();
      if (!lesson.targetLanguage) {
        lesson.targetLanguage = creationForm.targetLanguage;
      }
      setLessons((current) => [lesson, ...current]);
      setActiveStatus("pending");
      resetCreationForm();
      closeCreationDialog();
    } catch (error) {
      setCreationError(
        error instanceof Error
          ? error.message
          : "AI 레슨 생성 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setSubmittingCreation(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>PATHFLOW 콘텐츠 검수</h1>
          <p className="subtitle">
            AI가 생성한 수업을 검토하고 승인하여 학습 경험의 신뢰도를
            유지하세요.
          </p>
        </div>
        <div className="header-meta">
          <span
            className="pill pill--interactive"
            role="button"
            tabIndex={0}
            onClick={openCreationDialog}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openCreationDialog();
              }
            }}
          >
            AI 레슨 생성
          </span>
          <HumanReviewPill />
        </div>
      </header>

      <StatusTabs
        activeStatus={activeStatus}
        onChange={setActiveStatus}
        counts={statusCounts}
      />

      <main className="main-content">
        <FiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
        <section className="lesson-area">
          <LessonList
            lessons={filteredLessons}
            onOpenLesson={openLessonDialog}
            onStatusChange={handleStatusChange}
          />
        </section>
      </main>

      <LessonDialog
        lesson={activeLesson}
        notes={dialogNotes}
        onNotesChange={setDialogNotes}
        onClose={closeLessonDialog}
        onSubmit={handleDialogSubmit}
      />
      <LessonCreationDialog
        open={isCreationOpen}
        form={creationForm}
        onChange={updateCreationForm}
        onClose={closeCreationDialog}
        onSubmit={submitCreationRequest}
        isSubmitting={isSubmittingCreation}
        error={creationError}
      />
    </div>
  );
}
