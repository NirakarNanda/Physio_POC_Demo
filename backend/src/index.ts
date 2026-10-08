import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import { SESSION_COOKIE_NAME } from "./config";
import { getDb, getDbMode, initDb } from "./db";
import { requireAuth } from "./middleware/auth";
import { appointmentsRouter } from "./routes/appointments";
import { authRouter } from "./routes/auth";
import { patientsRouter } from "./routes/patients";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// CORS: in dev, reflect any localhost/127.0.0.1 origin with credentials.
// In production (NODE_ENV=production), restrict to FRONTEND_URL.
// (Lesson learned from the HealingHere POC: allow any localhost port in dev.)
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / server-to-server
      const frontendUrl = (process.env.FRONTEND_URL ?? "").trim();
      if (process.env.NODE_ENV === "production" && frontendUrl) {
        return callback(null, origin === frontendUrl);
      }
      if (LOCALHOST_ORIGIN.test(origin)) return callback(null, origin);
      if (frontendUrl && origin === frontendUrl) return callback(null, origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: SESSION_COOKIE_NAME,
    secret: process.env.SESSION_SECRET || "movewell-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 12, // 12h
    },
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mode: getDbModeSafe(), ts: new Date().toISOString() });
});

function getDbModeSafe(): string {
  try {
    return getDb().mode;
  } catch {
    return "uninitialized";
  }
}

app.use("/api/auth", authRouter);
app.use("/api/patients", requireAuth, patientsRouter);
app.use("/api/appointments", requireAuth, appointmentsRouter);

// 404 for unknown API routes
app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, message: "Not found" });
});

// Desktop mode: the Electron shell points MOVEWELL_STATIC_DIR at the
// exported Next.js frontend, and this server delivers the whole app from one
// origin (http://127.0.0.1:<port>) — no CORS, no network, fully offline.
const STATIC_DIR = (process.env.MOVEWELL_STATIC_DIR ?? "").trim();
if (STATIC_DIR) {
  app.use(express.static(STATIC_DIR));
  // The static export emits login.html, dashboard.html, ... — map /login to it.
  app.get(/^(?!\/api).*/, (req, res) => {
    const rel = req.path === "/" ? "index.html" : `${req.path.replace(/^\//, "")}.html`;
    const file = path.join(STATIC_DIR, rel);
    if (fs.existsSync(file)) return res.sendFile(file);
    return res.sendFile(path.join(STATIC_DIR, "index.html"));
  });
  console.log(`[server] serving desktop frontend from ${STATIC_DIR}`);
}

// Default credentials for a brand-new desktop install (empty clinic — no
// demo patients). Same as the dev seed defaults; changeable later.
const DESKTOP_DOCTOR_EMAIL = "doctor@movewell.physio";
const DESKTOP_DOCTOR_PASSWORD = "demo1234";

async function main(): Promise<void> {
  const db = await initDb();
  const mode = getDbMode();
  const desktopDataDir = (process.env.MOVEWELL_DATA_DIR ?? "").trim();
  let { doctors, patients } = await db.getCounts();
  console.log(`[db] mode=${mode}`);
  console.log(`[db] doctors=${doctors} patients=${patients}`);
  if (desktopDataDir && doctors === 0) {
    // First launch of the desktop app: empty clinic, just a doctor account
    // so login works out of the box.
    const passwordHash = await bcrypt.hash(DESKTOP_DOCTOR_PASSWORD, 10);
    await db.upsertDoctor({
      email: DESKTOP_DOCTOR_EMAIL,
      name: "Dr. Ananya Sharma",
      passwordHash,
    });
    ({ doctors, patients } = await db.getCounts());
    console.log(
      `[db] desktop first launch: created default doctor account (${DESKTOP_DOCTOR_EMAIL}) — empty clinic, no demo patients.`
    );
  }
  if (doctors === 0) {
    console.warn(
      "[db] ⚠️  WARNING: No doctor accounts found — login will fail with 401.\n" +
        "[db] ⚠️  Run `npm run seed` from the backend folder, then restart the server."
    );
  }
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT} (db mode: ${db.mode})`);
  });

  const shutdown = async () => {
    try {
      await getDb().close();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
