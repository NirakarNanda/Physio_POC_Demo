# MoveWell Studio — Desktop App

Offline-first Electron wrapper around the PhysioCare POC. The Express backend
runs hidden inside the app on `127.0.0.1`, the Next.js frontend is served from
the same origin, and clinic data lives in a local JSON file. **No internet
required at runtime.**

## Build the Windows installer (on a Windows PC, PowerShell)

```powershell
# 1 — backend (compiled server bundle)
cd ..\backend
npm install
npm run build

# 2 — frontend (static export; empty API url = same-origin fetch)
cd ..\frontend
npm install
$env:NEXT_PUBLIC_API_URL = ""
$env:MOVEWELL_STATIC_EXPORT = "1"
npm run build

# 3 — desktop shell → installer
cd ..\desktop
npm install
npm run dist
```

(Before step 3, trim the backend to production deps so the installer stays
lean: `cd ..\backend; npm prune --omit=dev; cd ..\desktop` — reinstall dev
deps later with plain `npm install`.)

The installer lands at `desktop\release\MoveWell Studio Setup 0.1.0.exe`.
Run it on the clinic's PC — nothing else to install.

## Where things live on the clinic PC

| What | Location |
|---|---|
| Patient database | `%APPDATA%\MoveWell Studio\db.json` |
| Daily backups (last 7) | `%APPDATA%\MoveWell Studio\backups\db-YYYY-MM-DD.json` |
| Default login | `doctor@movewell.physio` / `demo1234` |

First launch creates an **empty clinic** (no demo patients) with just the
doctor account above, so sign-in works out of the box.

## Dev mode (no packaging)

```powershell
# build backend + frontend once, then:
cd desktop
npm install
npm run dev     # opens the app against local backend/dist + frontend/out
```

Web development is unchanged: `npm run dev` in `backend/` and `frontend/`
works exactly as before.

## Notes / v1 limitations

- One clinic per install (single local database, one doctor login).
- Changing the default doctor password needs a small follow-up (no UI yet).
- MongoDB stays optional: set `MONGODB_URI` before launch if a clinic wants it.
- Auto-updates are not wired yet — ship a new installer per release.
