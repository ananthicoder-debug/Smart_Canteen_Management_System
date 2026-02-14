# Food Management Monorepo

This repository contains:

- `backend` — Node/Express API (run `cd backend && npm install && npm run dev`).
- `my-react-app` — small Vite + Vue demo app (run `cd my-react-app && npm install && npm run dev`).
- `app` / `components` — Next.js frontend.

Notes
- Each subproject has its own `package.json` and must have dependencies installed separately.
- Development: run `npm run dev:all` from the repo root to start backend + Next frontend (requires `concurrently`).
- Logs from the backend are written to `backend/logs/backend.log`.

Commands

```bash
# install and run backend
cd backend
npm install
npm run dev

# install and run Vue demo app
cd ../my-react-app
npm install
npm run dev
```
