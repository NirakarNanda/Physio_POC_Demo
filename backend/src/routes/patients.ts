import { Router } from "express";
import { getDb } from "../db";
import { isPatientStatus, type CreatePatientInput, type UpdatePatientInput } from "../types";

export const patientsRouter = Router();

const TREATMENTS = new Set([
  "Back & Spine Care",
  "Sports Injury Rehab",
  "Neck & Shoulder Pain",
  "Post-Surgical Rehab",
  "Neurological Rehab",
  "Geriatric Mobility Care",
  "General Physiotherapy",
  "Joint Mobilization",
  "Dry Needling",
  "Posture Correction",
]);

function validate(input: Record<string, unknown>, partial: boolean): string | null {
  const check = (field: string, pred: (v: unknown) => boolean, msg: string) => {
    if (partial && input[field] === undefined) return null;
    if (!pred(input[field])) return msg;
    return null;
  };
  return (
    check("name", (v) => typeof v === "string" && v.trim().length > 0, "name is required") ??
    check("age", (v) => typeof v === "number" && v >= 0 && v <= 120, "age must be a number 0-120") ??
    check("phone", (v) => typeof v === "string" && v.trim().length > 0, "phone is required") ??
    check("treatment", (v) => typeof v === "string" && v.trim().length > 0, "treatment is required") ??
    check("status", (v) => isPatientStatus(v), "status must be active|completed|follow-up") ??
    check("nextVisit", (v) => typeof v === "string" && !Number.isNaN(Date.parse(v)), "nextVisit must be an ISO date string") ??
    (input.email !== undefined && input.email !== "" && typeof input.email !== "string"
      ? "email must be a string"
      : null)
  );
}

// GET /api/patients?search=&status= -> 200 {patients:[...]}
patientsRouter.get("/", async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : "";
  const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
  let patients = await getDb().getPatients();
  if (status && isPatientStatus(status)) {
    patients = patients.filter((p) => p.status === status);
  }
  if (search) {
    patients = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.phone.toLowerCase().includes(search) ||
        p.treatment.toLowerCase().includes(search)
    );
  }
  res.json({ patients });
});

// POST /api/patients -> 201 {patient}
patientsRouter.post("/", async (req, res) => {
  const err = validate(req.body ?? {}, false);
  if (err) {
    res.status(400).json({ ok: false, message: err });
    return;
  }
  const body = req.body as Record<string, unknown>;
  const input: CreatePatientInput = {
    name: String(body.name).trim(),
    age: Number(body.age),
    phone: String(body.phone).trim(),
    email: body.email ? String(body.email).trim() : undefined,
    treatment: String(body.treatment).trim(),
    status: body.status as CreatePatientInput["status"],
    nextVisit: new Date(String(body.nextVisit)).toISOString(),
    notes: body.notes ? String(body.notes) : "",
  };
  const patient = await getDb().createPatient(input);
  res.status(201).json({ patient });
});

// PUT /api/patients/:id -> 200 {patient}
patientsRouter.put("/:id", async (req, res) => {
  const err = validate(req.body ?? {}, true);
  if (err) {
    res.status(400).json({ ok: false, message: err });
    return;
  }
  const body = req.body as Record<string, unknown>;
  const patch: UpdatePatientInput = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.age !== undefined) patch.age = Number(body.age);
  if (body.phone !== undefined) patch.phone = String(body.phone).trim();
  if (body.email !== undefined) patch.email = String(body.email).trim() || undefined;
  if (body.treatment !== undefined) patch.treatment = String(body.treatment).trim();
  if (body.status !== undefined) patch.status = body.status as UpdatePatientInput["status"];
  if (body.nextVisit !== undefined) patch.nextVisit = new Date(String(body.nextVisit)).toISOString();
  if (body.notes !== undefined) patch.notes = String(body.notes);

  const patient = await getDb().updatePatient(req.params.id, patch);
  if (!patient) {
    res.status(404).json({ ok: false, message: "Patient not found" });
    return;
  }
  res.json({ patient });
});

// DELETE /api/patients/:id -> 200 {ok:true}
patientsRouter.delete("/:id", async (req, res) => {
  const deleted = await getDb().deletePatient(req.params.id);
  if (!deleted) {
    res.status(404).json({ ok: false, message: "Patient not found" });
    return;
  }
  res.json({ ok: true });
});

export { TREATMENTS };
