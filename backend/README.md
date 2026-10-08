# MoveWell Physiotherapy Studio — Backend (POC demo)

Express + TypeScript API for the MoveWell clinic demo app.

## Quick start

```powershell
cd backend
npm install
npm run seed      # creates demo doctor (doctor@movewell.physio / demo1234) + 12 demo patients
npm run dev       # http://localhost:5000
```

## Data storage

- If `MONGODB_URI` is set and reachable → MongoDB.
- Otherwise → offline JSON-file store at `./data/db.json` (created automatically).

No database setup is needed to run the demo.

## Env (see `.env.example`)

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — demo doctor login (defaults: `doctor@movewell.physio` / `demo1234`)
- `SESSION_SECRET` — change in production
- `PORT` — default 5000
- `FRONTEND_URL` — production CORS origin (dev allows any localhost origin)

## Scripts

- `npm run dev` — watch mode via tsx
- `npm run build` / `npm start` — compile to `dist/` and run
- `npm run seed` — seed demo data (idempotent)
- `npm run typecheck` — `tsc --noEmit`
