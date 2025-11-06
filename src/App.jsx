import { useEffect, useMemo, useRef, useState } from "react";
import { initialLessons, lessonTypeMap, statusMap } from "./data/lessons.js";

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

function Tag({ label, value }) {
  return (
    <span className="tag">
      <strong>{label}</strong> {value}
    </span>
  );
}

function LessonCard({ lesson, onOpen, onStatusChange }) {
  const {
    id,
    title,
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

  return (
    <article className="lesson-card" data-lesson-id={id}>
      <header>
        <h2 className="lesson-title">{title}</h2>
        <span className={`lesson-status status-${status}`}>
          {statusMap[status] ?? status}
        </span>
      </header>

      <div className="lesson-meta">
        <span>레슨 타입: {lessonTypeMap[lessonType] ?? "N/A"}</span>
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
              CEFR {lesson.tags.CEFR_LEVEL} · {lessonTypeMap[lesson.lessonType]}{" "}
              · {statusMap[lesson.status] ?? lesson.status} ·{" "}
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
          <span className="pill">AI 수업 생성</span>
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
    </div>
  );
}
