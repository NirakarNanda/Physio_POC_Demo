import { Router } from "express";
import { getDb } from "../db";
import { isAppointmentStatus } from "../types";

export const appointmentsRouter = Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function localDateKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function isRealDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

// GET /api/appointments/today -> 200 {appointments:[{id, patientName, time, treatment, status, fee}]}
appointmentsRouter.get("/today", async (req, res) => {
  const today = localDateKey();
  const all = await getDb().getAppointments();
  const appointments = all
    .filter((a) => a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((a) => ({
      id: a.id,
      patientName: a.patientName,
      time: a.time,
      treatment: a.treatment,
      status: a.status,
      fee: a.fee,
    }));
  res.json({ appointments });
});

// POST /api/appointments -> 201 {appointment}
// Body: { patientId?, patientName?, date (yyyy-mm-dd), time (HH:MM), treatment?, fee? }
appointmentsRouter.post("/", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const date = typeof body.date === "string" ? body.date : "";
  const time = typeof body.time === "string" ? body.time : "";

  if (!isRealDate(date)) {
    res.status(400).json({ ok: false, message: "date must be a real calendar date (yyyy-mm-dd)" });
    return;
  }
  if (!TIME_RE.test(time)) {
    res.status(400).json({ ok: false, message: "time must be HH:MM (24h)" });
    return;
  }

  const db = getDb();
  let patientId = typeof body.patientId === "string" ? body.patientId : "";
  let patientName = typeof body.patientName === "string" ? body.patientName.trim() : "";

  if (patientId) {
    const patient = await db.getPatientById(patientId);
    if (!patient) {
      res.status(400).json({ ok: false, message: "patientId does not match any patient" });
      return;
    }
    patientName = patient.name;
  }
  if (!patientName) {
    res.status(400).json({ ok: false, message: "patientId or patientName is required" });
    return;
  }

  const treatment =
    typeof body.treatment === "string" && body.treatment.trim()
      ? body.treatment.trim()
      : "General Checkup";
  const feeRaw = body.fee === undefined || body.fee === "" ? 500 : Number(body.fee);
  if (!Number.isFinite(feeRaw) || feeRaw < 0) {
    res.status(400).json({ ok: false, message: "fee must be a non-negative number" });
    return;
  }

  const appointment = await db.addAppointment({
    patientId,
    patientName,
    date,
    time,
    treatment,
    fee: Math.round(feeRaw),
    status: "scheduled",
  });
  res.status(201).json({ appointment });
});

// PATCH /api/appointments/:id -> 200 {appointment}; body {status}
appointmentsRouter.patch("/:id", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  if (!isAppointmentStatus(body.status)) {
    res.status(400).json({ ok: false, message: "status must be scheduled|completed|cancelled" });
    return;
  }
  const updated = await getDb().updateAppointment(req.params.id, { status: body.status });
  if (!updated) {
    res.status(404).json({ ok: false, message: "appointment not found" });
    return;
  }
  res.json({ appointment: updated });
});

// GET /api/appointments?from=yyyy-MM-dd&to=yyyy-MM-dd -> 200 {appointments}
// Full appointment list (for exports); optional inclusive date range.
appointmentsRouter.get("/", async (req, res) => {
  const from = typeof req.query.from === "string" ? req.query.from.trim() : "";
  const to = typeof req.query.to === "string" ? req.query.to.trim() : "";
  if (from && !isRealDate(from)) {
    res.status(400).json({ ok: false, message: "from must be a real calendar date (yyyy-mm-dd)" });
    return;
  }
  if (to && !isRealDate(to)) {
    res.status(400).json({ ok: false, message: "to must be a real calendar date (yyyy-mm-dd)" });
    return;
  }
  const all = await getDb().getAppointments();
  const appointments = all.filter(
    (a) => (!from || a.date >= from) && (!to || a.date <= to),
  );
  res.json({ appointments });
});

// GET /api/appointments/revenue?month=yyyy-MM -> 200 {total, count}
// Total ₹ collected in the month: sum of fees for non-cancelled appointments.
appointmentsRouter.get("/revenue", async (req, res) => {
  const raw = typeof req.query.month === "string" ? req.query.month.trim() : "";
  const month = raw || localDateKey().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ ok: false, message: "month must be yyyy-MM" });
    return;
  }
  const all = await getDb().getAppointments();
  const inMonth = all.filter((a) => a.date.startsWith(month) && a.status !== "cancelled");
  const total = inMonth.reduce((sum, a) => sum + (Number.isFinite(a.fee) ? a.fee : 0), 0);
  res.json({ total, count: inMonth.length });
});
