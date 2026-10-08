import bcrypt from "bcrypt";
import { Router } from "express";
import { SESSION_COOKIE_NAME } from "../config";
import { getDb } from "../db";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

// Non-sensitive troubleshooting hint included in login 401s outside
// production. Never leaks credentials — just points at the seed step.
function loginHint(): { hint?: string } {
  if (process.env.NODE_ENV === "production") return {};
  return { hint: "seed the demo account with `npm run seed` (from the backend folder) and restart the server" };
}

// POST /api/auth/login {email, password} -> 200 {ok:true, user} or 401
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ ok: false, message: "email and password are required" });
    return;
  }
  const db = getDb();
  // Trim the email: protects against copy-paste trailing-space typos.
  const doctor = await db.getDoctorByEmail(email.trim());
  if (!doctor) {
    res.status(401).json({ ok: false, message: "Invalid email or password", ...loginHint() });
    return;
  }
  const match = await bcrypt.compare(password, doctor.passwordHash);
  if (!match) {
    res.status(401).json({ ok: false, message: "Invalid email or password", ...loginHint() });
    return;
  }
  req.session.user = { name: doctor.name, email: doctor.email };
  res.json({ ok: true, user: { name: doctor.name, email: doctor.email } });
});

// GET /api/auth/me -> 200 {ok:true, user} when session valid, 401 otherwise
authRouter.get("/me", (req, res) => {
  const user = req.session.user;
  if (user?.email) {
    res.json({ ok: true, user: { name: user.name, email: user.email } });
    return;
  }
  res.status(401).json({ ok: false, message: "Not authenticated" });
});

// POST /api/auth/change-password {currentPassword, newPassword} -> 200 {ok:true}
// Requires a valid session. Verifies the current password before replacing it.
authRouter.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    res.status(400).json({ ok: false, message: "currentPassword and newPassword are required" });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ ok: false, message: "New password must be at least 8 characters" });
    return;
  }
  if (newPassword === currentPassword) {
    res.status(400).json({ ok: false, message: "New password must be different from the current one" });
    return;
  }
  const email = (req.session as unknown as { user?: { email?: string } }).user?.email;
  const db = getDb();
  const doctor = email ? await db.getDoctorByEmail(email) : null;
  if (!doctor) {
    res.status(401).json({ ok: false, message: "Not authenticated" });
    return;
  }
  const match = await bcrypt.compare(currentPassword, doctor.passwordHash);
  if (!match) {
    res.status(401).json({ ok: false, message: "Current password is incorrect" });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.upsertDoctor({ ...doctor, passwordHash });
  res.json({ ok: true });
});

// POST /api/auth/logout -> 200 {ok:true} (destroys session)
authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ ok: false, message: "Failed to log out" });
      return;
    }
    res.clearCookie(SESSION_COOKIE_NAME);
    res.json({ ok: true });
  });
});
