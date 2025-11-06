# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vite-powered React dashboard paired with a FastAPI backend. Key files:
- `src/main.jsx` bootstraps React; `src/App.jsx` renders the dashboard, reviewer dialog, and AI lesson modal.
- `src/data/lessons.js` stores seeded lessons and lesson-type metadata; `src/styles.css` centralises tokens and layout.
- Root utilities: `index.html`, `vite.config.js`, plus backend assets—`main.py` (Gemini `/lessons/generate` endpoint), `.env` for `GEMINI_API_KEY`, and `requirements.txt`.

## Build, Test, and Development Commands
- `npm install`, then `npm run dev` for local React development.
- `npm run build` (create `dist/`) and `npm run preview` for production checks.
- Backend: create a virtualenv, `pip install -r requirements.txt`, set `GEMINI_API_KEY` in `.env`, and run `uvicorn main:app --reload --port 8000`.
- Add ESLint/Vitest when needed; until then run `npx eslint src --ext .jsx` manually.

## Coding Style & Naming Conventions
Use 2-space indentation and functional React. Keep state/setter names in `camelCase`, reserve SCREAMING_SNAKE_CASE for constant maps (`lessonTypeMap`). House UI helpers (`LessonDialog`, `LessonCreationDialog`) alongside their consumers unless reused, and update `main.py`'s `LESSON_TYPE_CONFIG` and headings when lesson families evolve. Stick to the existing BEM-ish classes in `src/styles.css`; reach for inline styles only when dynamically toggling visibility.

## Testing Guidelines
No automated tests ship today. Add Vitest + React Testing Library near the code under test (`src/App.spec.jsx`) to cover filters, status transitions, and the `.AI 수업 생성` modal—including validation for role-play fields. For FastAPI, use pytest + HTTPX to assert `/lessons/generate` handles missing keys, scenario-time requirements, and Gemini failures. Until suites exist, manually run both servers, flip every filter/tab, exercise dialog actions, and attempt AI generation with/without optional inputs.

## Commit & Pull Request Guidelines
Git history favours short, present-tense subjects (`tooltip`). Keep titles under ~50 characters, elaborating in the body if scope demands it. For pull requests, supply a brief problem summary, screenshots/GIFs for UI tweaks, linked issues, and the manual QA you ran (dev server, uvicorn, AI generation happy/failure paths).
