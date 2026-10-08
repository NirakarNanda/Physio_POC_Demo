# MoveWell Physiotherapy Studio — POC

Full-stack demo POC for a physiotherapy clinic: **Next.js frontend** + **Express/MongoDB backend**,
session-cookie doctor auth, patient CRUD, appointments, revenue, settings.

## Demo credentials

- Email: `doctor@movewell.physio`
- Password: `demo1234`

(Seeded by `npm run seed` in `backend/`. This is a demo-only credential, not a real secret.)

## Quick start (demo runs offline — no Atlas needed)

```bash
# 1. Backend (port 5000)
cd backend
npm install
npm run seed     # creates demo doctor + 12 physio patients (works without MONGODB_URI)
npm run dev

# 2. Frontend (port 3000) — start AFTER the backend
cd ../frontend
npm install
npm run dev
```

Then open http://localhost:3000 — the landing page, log in at **/login** with the demo credentials,
explore **/dashboard**, **/patients**, and **/settings**.

> **Login shows 401?** The demo doctor is missing from the store the server is reading.
> Run `npm run seed` in `backend/`, then restart the server. The server prints
> `[db] doctors=N` at startup — it must say `doctors=1`.

> **Port 5000 already in use?** A stale server is still running. In PowerShell:
> ```powershell
> netstat -ano | findstr :5000
> taskkill /PID <pid> /F
> ```
> Or run the backend on another port: `$env:PORT=5001; npm run dev`
> (then set `$env:NEXT_PUBLIC_API_URL="http://localhost:5001"` before starting the frontend).

## What's inside

- **Landing** — single-viewport editorial hero: oversized Fraunces serif headline
  ("Expert Physio, Crafted Around Your Recovery.") wrapped around a glass bubble
  with a 3D knee-joint render, doctor monogram tile, "2.5K+ pain-free recoveries"
  stat, side notes, orchid + wandering butterflies, Doctor Login CTA.
- **Login** — split screen: editorial physio-clinic photo panel + "Welcome back,
  Doctor" card (demo credentials fill button).
- **Dashboard** — greeting, stat cards (today's appointments, patients, monthly
  revenue, follow-ups), today's appointment list with Complete/Cancel, weekly
  visits chart, upcoming visits strip, book-appointment modal with fee auto-fill.
- **Patients** — search/filter, add/edit modal, delete, CSV export.
- **Settings** — treatment price list, working hours, clinic profile.
- **Theme** — light/dark toggle, persisted in localStorage (dark default).

## Project layout

```
frontend/   Next.js 16 + React 19 + Tailwind v4 + GSAP
  app/      / (landing)  /login  /dashboard  /patients  /settings
  lib/      api.ts (NEXT_PUBLIC_API_URL, default http://localhost:5000), auth hooks,
            fonts.ts, gsap.ts, csv.ts, settings.tsx
  components/ Logo (SVG pulse mark), PotScene (orchid + butterflies), JointBuddy,
              AppShell, BookAppointmentModal, PatientModal, Toast, StatusBadge,
              PasswordField, AmbientBackground, theme/ (ThemeProvider + ThemeToggle)

backend/    Express + TypeScript
  src/      index.ts (EADDRINUSE-friendly), config.ts, types.ts, seed.ts
  src/db/   mongoRepo.ts / jsonRepo.ts  (repository interface, offline-first)
  src/routes/ auth.ts (login/me/logout/change-password), patients.ts, appointments.ts
  data/db.json  offline JSON store (created at runtime when MongoDB is unreachable)

desktop/    Electron shell (optional offline desktop build)
```

## Backend env

```bash
# backend/.env — copy from .env.example
MONGODB_URI=                  # empty = offline JSON-file store at ./data/db.json
ADMIN_EMAIL=doctor@movewell.physio
ADMIN_PASSWORD=<redacted>
SESSION_SECRET=<redacted>
PORT=5000
FRONTEND_URL=                 # production CORS origin; dev reflects any localhost
```

If `MONGODB_URI` is set but unreachable, the server falls back to the JSON store
with a warning — **seed and server must use the same store**, or login 401s.

## API contract

- `POST /api/auth/login {email,password}` → `{ok, user}` (session cookie)
- `GET /api/auth/me` → `{ok, user}` / 401
- `POST /api/auth/logout` · `POST /api/auth/change-password`
- `GET /api/patients?search=&status=` → `{patients:[...]}` (auth required)
- `POST /api/patients` · `PUT /api/patients/:id` · `DELETE /api/patients/:id`
- `GET /api/appointments/today` → `{appointments:[...]}`
- `POST /api/appointments` · `PATCH /api/appointments/:id`
- `GET /api/appointments/revenue?month=YYYY-MM` → `{total, count}`

Patient fields: `name, age, phone, email?, treatment, status (active|completed|follow-up), nextVisit, notes`.

## Rename map (to rebrand this POC for a real clinic)

| Replace | Where |
|---|---|
| `MoveWell` / `movewell` | `frontend/components/Logo.tsx`, `frontend/app/*`, `backend/src/*`, `desktop/*` |
| `doctor-portrait.jpg`, `physio-clinic-editorial.jpg` | `frontend/public/` |
| `doctor@movewell.physio` | `backend/src/seed.ts`, `frontend/app/login/page.tsx`, `backend/.env.example` |
| `TREATMENTS` + `FEE_BY_TREATMENT` | `frontend/lib/api.ts`, `backend/src/routes/patients.ts`, `backend/src/seed.ts` |

## Notes

- CORS in dev reflects any `http://localhost:<port>` / `127.0.0.1` origin with credentials.
- `express-session` uses the default in-memory session store — fine for the demo; swap in a Mongo store for production.
- No real secrets are committed — `.env` is gitignored, only `.env.example` ships.

## License

MIT — see [LICENSE](./LICENSE). © 2026 Nirakar Nanda.
