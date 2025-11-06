# Repository Guidelines

## Project Structure & Module Organization
This repository splits the React frontend and FastAPI backend:
- Frontend (`frontend/`): `frontend/src/main.jsx` bootstraps React; `frontend/src/App.jsx` renders the dashboard, reviewer dialog, AI lesson modal, and language flag UI. Shared data lives in `frontend/src/data/lessons.js`, styling in `frontend/src/styles.css`, and static assets in `frontend/public/`.
- Backend (`backend/`): `backend/main.py` exposes the Gemini-powered `/lessons/generate` endpoint. Environment variables live in `backend/.env`, with dependencies listed in `backend/requirements.txt`.

## Build, Test, and Development Commands
- Frontend: `cd frontend && npm install`, then `npm run dev` on `http://localhost:5173`. Use `npm run build` (emits `frontend/dist/`) and `npm run preview` for production checks.
- Backend: `cd backend`, create a virtualenv, `pip install -r requirements.txt`, set `GEMINI_API_KEY` in `.env`, then run `uvicorn main:app --reload --port 8000`. Requests require `targetLanguage` (`en`, `ja`, or `zh`); FastAPI validates these before contacting Gemini.
- Add ESLint/Vitest when needed; until then run `npx eslint src --ext .jsx` from `frontend/`.

## Coding Style & Naming Conventions
Use 2-space indentation and functional React. Keep state/setter names in `camelCase`, reserve SCREAMING_SNAKE_CASE for constant maps (`lessonTypeMap`). House UI helpers (`LessonDialog`, `LessonCreationDialog`, `LanguageFlag`) alongside their consumers unless reused, and update `main.py`'s `LESSON_TYPE_CONFIG` / language maps when lesson families evolve. Stick to the existing BEM-ish classes in `src/styles.css`; reach for inline styles only when dynamically toggling visibility.

## Testing Guidelines
No automated tests ship today. Add Vitest + React Testing Library near the code under test (`src/App.spec.jsx`) to cover filters, status transitions, language-flag rendering, and the `.AI 수업 생성` modal—including role-play validation, target-language selection, and successful lesson insertion. For FastAPI, use pytest + HTTPX to assert `/lessons/generate` enforces `targetLanguage`, role-play requirements, and Gemini failures; mock Gemini via dependency injection. Until suites exist, manually run both servers, flip every filter/tab, open the reviewer dialog, and exercise the AI generation flow for each language (including backend-down error cases).

## Commit & Pull Request Guidelines
Git history favours short, present-tense subjects (`tooltip`). Keep titles under ~50 characters, elaborating in the body if scope demands it. For pull requests, supply a brief problem summary, screenshots/GIFs for UI tweaks, linked issues, and the manual QA you ran (dev server, uvicorn, AI generation happy/failure paths).
