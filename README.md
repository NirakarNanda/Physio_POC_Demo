# MoveWell Physiotherapy Studio — POC Demo

A complete, working **full-stack demo** for a physiotherapy clinic — built to
showcase and sell. Dark, premium, motion-rich marketing landing page plus a
real working clinic app (doctor login, dashboard, patients, appointments,
revenue).

- `frontend/` — Next.js 16 + Tailwind CSS v4 + GSAP. Marketing site (`/`) with
  an animated motion-capture hero, plus the clinic app (`/login`, `/dashboard`,
  `/patients`).
- `backend/` — Express + TypeScript API. Uses MongoDB when `MONGODB_URI` is set,
  otherwise an offline JSON-file store — **no database setup needed** for the demo.

## Quick start

**1. Backend**

```powershell
cd backend
npm install
npm run seed   # demo doctor: doctor@movewell.physio / demo1234 (+ 12 demo patients)
npm run dev    # http://localhost:5000
```

**2. Frontend** (new terminal)

```powershell
cd frontend
npm install
npm run dev    # http://localhost:3000
```

Open http://localhost:3000 for the landing page, then **Doctor login** (top
right) with the pre-filled demo credentials.

> If port 3000 is busy, Next.js will offer the next free port automatically.

## Renaming for a real client

Everything brand-related lives in a few places:

- `frontend/lib/clinic.ts` — clinic name, doctor, phone, address, hours
- `frontend/public/doctor-portrait.jpg` — swap for the real doctor's photo
- `backend/src/seed.ts` — demo doctor + patients (`ADMIN_EMAIL` / `ADMIN_PASSWORD` env)
- `frontend/lib/api.ts` — `TREATMENTS` + `FEE_BY_TREATMENT`
- `backend/src/routes/patients.ts` — `TREATMENTS` set (server-side validation)

## Scripts

Backend: `npm run dev` (watch) · `npm run build` + `npm start` (prod) ·
`npm run seed` (idempotent demo data) · `npm run typecheck`

Frontend: `npm run dev` · `npm run build` · `npm start`

## Notes

- Session-cookie auth; dev CORS allows any `http://localhost:<port>` origin.
- `NEXT_PUBLIC_API_URL` env overrides the API base (default `http://localhost:5000`).
- Set `MONGODB_URI` in `backend/.env` (see `.env.example`) to use MongoDB
  instead of the JSON-file store.
