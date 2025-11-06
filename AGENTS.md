# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vite-powered React dashboard. Source files live under `src/`:
- `src/main.jsx` mounts the app with React StrictMode.
- `src/App.jsx` defines the dashboard UI, dialog flow, and filter/state management.
- `src/data/lessons.js` houses `initialLessons`, `lessonTypeMap`, and `statusMap`; extend schemas here.
- `src/styles.css` provides global tokens and component styles; keep selectors stable to avoid regressions.
- Root-level `index.html` and `vite.config.js` stay close to Vite defaults—touch only when changing the build.

## Build, Test, and Development Commands
- `npm install` — install React, Vite, and plugin dependencies.
- `npm run dev` — launch the Vite dev server on `http://localhost:5173`.
- `npm run build` — emit a production build to `dist/`.
- `npm run preview` — serve the production build locally for smoke testing.
- Run `npx eslint src --ext .jsx` if you introduce an ESLint config; add a dedicated npm script when tooling lands.

## Coding Style & Naming Conventions
Use 2-space indentation and modern React with functional components and hooks. Prefer `camelCase` for state setters (`setDialogNotes`) and data keys; keep exported maps such as `lessonTypeMap` in SCREAMING_SNAKE_CASE only when they represent constants. Co-locate helper components (e.g., `LessonDialog`, `LessonCard`) inside `App.jsx` unless shared elsewhere. Maintain the BEM-style class naming already in `src/styles.css` (`pill`, `pill--interactive`) and avoid inline styles except for dynamic visibility toggles already present.

## Testing Guidelines
Automated tests are not yet implemented. When adding logic, prefer Vitest with React Testing Library: create specs alongside source files (e.g., `src/App.spec.jsx`) and cover filter behaviour, status transitions, and dialog interactions. Aim for smoke coverage on new helper hooks or utilities in `src/data/`. Until tests exist, manually verify by running `npm run dev`, exercising each status tab, adjusting filters, and confirming dialog submissions update state and counts.

## Commit & Pull Request Guidelines
Recent history (`tooltip`, `Initial project setup and dashboard component`) shows concise, present-tense subjects. Keep summaries under 50 characters where practical, and add detail in the body if needed. For pull requests, provide: 1) a short problem statement, 2) screenshots or GIFs of UI changes, and 3) references to relevant issues or lesson IDs. Request review before merging, and confirm manual QA steps in the description.
