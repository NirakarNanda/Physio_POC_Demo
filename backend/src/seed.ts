import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { getDb, getDbMode, initDb } from "./db";
import { JSON_DB_FILE_PATH } from "./db/jsonRepo";
import type { CreatePatientInput, PatientStatus } from "./types";

dotenv.config();

// Seed script: creates the demo doctor account and ~12 realistic physio
// patients. Works in BOTH modes (Atlas and offline JSON-file fallback).

const DOCTOR_EMAIL = (process.env.ADMIN_EMAIL ?? "doctor@movewell.physio").trim() || "doctor@movewell.physio";
const DOCTOR_PASSWORD = (process.env.ADMIN_PASSWORD ?? "demo1234").trim() || "demo1234";
const DOCTOR_NAME = "Dr. Arjun Rao";

// Demo consultation fees (₹) by treatment — used for seeded appointments
// and shown on the dashboard's revenue card.
const FEE_BY_TREATMENT: Record<string, number> = {
  "Back & Spine Care": 600,
  "Sports Injury Rehab": 800,
  "Neck & Shoulder Pain": 600,
  "Post-Surgical Rehab": 900,
  "Neurological Rehab": 1000,
  "Geriatric Mobility Care": 700,
  "General Physiotherapy": 500,
  "Joint Mobilization": 550,
  "Dry Needling": 750,
  "Posture Correction": 500,
};

function localDateKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function localTimeKey(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

interface SeedPatient extends Omit<CreatePatientInput, "status"> {
  status: PatientStatus;
}

function isoOffset(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const PATIENTS: SeedPatient[] = [
  {
    name: "Rohan Mehta",
    age: 34,
    phone: "+91 98110 23456",
    email: "rohan.mehta@example.com",
    treatment: "Back & Spine Care",
    status: "active",
    nextVisit: isoOffset(0, 9, 30),
    notes: "L4-L5 disc bulge; core strengthening, 6 of 12 sessions done.",
  },
  {
    name: "Priya Iyer",
    age: 28,
    phone: "+91 98840 11223",
    treatment: "Neck & Shoulder Pain",
    status: "active",
    nextVisit: isoOffset(0, 11, 0),
    notes: "Cervical spondylosis; posture correction + TENS, session 4 of 8.",
  },
  {
    name: "Arjun Nair",
    age: 24,
    phone: "+91 97420 55667",
    treatment: "Sports Injury Rehab",
    status: "active",
    nextVisit: isoOffset(0, 15, 30),
    notes: "ACL sprain (grade 2); closed-chain rehab, week 5.",
  },
  {
    name: "Kavya Reddy",
    age: 45,
    phone: "+91 90000 77889",
    email: "kavya.r@example.com",
    treatment: "Joint Mobilization",
    status: "active",
    nextVisit: isoOffset(0, 17, 0),
    notes: "Frozen shoulder (right); Maitland mobilization, improving ROM.",
  },
  {
    name: "Aditya Sharma",
    age: 31,
    phone: "+91 99870 44332",
    treatment: "Dry Needling",
    status: "active",
    nextVisit: isoOffset(1, 10, 0),
    notes: "Chronic trapezius trigger points; needling + stretch protocol.",
  },
  {
    name: "Sunita Desai",
    age: 58,
    phone: "+91 98200 66778",
    email: "sunita.desai@example.com",
    treatment: "Geriatric Mobility Care",
    status: "active",
    nextVisit: isoOffset(2, 12, 30),
    notes: "Knee osteoarthritis; gait training + quadriceps strengthening.",
  },
  {
    name: "Vikram Malhotra",
    age: 41,
    phone: "+91 98111 90909",
    treatment: "Back & Spine Care",
    status: "follow-up",
    nextVisit: isoOffset(3, 9, 0),
    notes: "Follow-up after 8 sessions; reassess lumbar flexion.",
  },
  {
    name: "Neha Kulkarni",
    age: 23,
    phone: "+91 97654 32109",
    email: "neha.k@example.com",
    treatment: "Posture Correction",
    status: "active",
    nextVisit: isoOffset(4, 16, 0),
    notes: "Forward head posture; workstation ergonomics advised.",
  },
  {
    name: "Suresh Patil",
    age: 52,
    phone: "+91 94220 12345",
    treatment: "Post-Surgical Rehab",
    status: "completed",
    nextVisit: isoOffset(5, 11, 30),
    notes: "Completed post-TKR rehab; recall review scheduled.",
  },
  {
    name: "Anjali Gupta",
    age: 31,
    phone: "+91 99580 67890",
    email: "anjali.g@example.com",
    treatment: "Sports Injury Rehab",
    status: "completed",
    nextVisit: isoOffset(6, 14, 0),
    notes: "Completed ankle sprain rehab; return-to-sport cleared.",
  },
  {
    name: "Ravi Menon",
    age: 60,
    phone: "+91 98470 24680",
    treatment: "Neurological Rehab",
    status: "follow-up",
    nextVisit: isoOffset(0, 13, 0),
    notes: "Post-stroke hemiparesis; balance training, caregiver briefed.",
  },
  {
    name: "Divya Bhatt",
    age: 29,
    phone: "+91 98765 13579",
    treatment: "General Physiotherapy",
    status: "active",
    nextVisit: isoOffset(7, 10, 30),
    notes: "Plantar fasciitis; eccentric loading + night splint.",
  },
];

async function main(): Promise<void> {
  const db = await initDb();
  const mode = getDbMode();
  console.log(`[seed] db mode: ${mode}`);
  if (mode === "json") {
    // Make mongo/JSON splits visible: seed and server must write the same file.
    console.log(`[seed] JSON store file: ${JSON_DB_FILE_PATH}`);
  }

  // Seed the demo doctor.
  const passwordHash = await bcrypt.hash(DOCTOR_PASSWORD, 10);
  const doctor = await db.upsertDoctor({ email: DOCTOR_EMAIL, name: DOCTOR_NAME, passwordHash });
  console.log(`[seed] doctor upserted: ${doctor.email} (${doctor.name})`);

  // Seed patients only when the store is empty (idempotent, safe to rerun).
  const existing = await db.getPatients();
  if (existing.length > 0) {
    console.log(`[seed] ${existing.length} patient(s) already present, skipping patient seed.`);
  } else {
    for (const p of PATIENTS) {
      await db.createPatient(p);
    }
    console.log(`[seed] created ${PATIENTS.length} patients.`);
  }

  // Seed appointments from each patient's nextVisit (idempotent: skip when
  // appointments already exist). Past-dated ones are marked completed so the
  // demo has real revenue; today's are scheduled so the dashboard has rows.
  const existingAppts = await db.getAppointments();
  if (existingAppts.length > 0) {
    console.log(`[seed] ${existingAppts.length} appointment(s) already present, skipping appointment seed.`);
  } else {
    const patients = await db.getPatients();
    const today = localDateKey(new Date());
    let created = 0;
    for (const p of patients) {
      const d = new Date(p.nextVisit);
      if (Number.isNaN(d.getTime())) continue;
      const date = localDateKey(d);
      await db.addAppointment({
        patientId: p.id,
        patientName: p.name,
        date,
        time: localTimeKey(d),
        treatment: p.treatment,
        fee: FEE_BY_TREATMENT[p.treatment] ?? 500,
        status: date < today ? "completed" : "scheduled",
      });
      created++;
    }
    console.log(`[seed] created ${created} appointments.`);
  }

  await db.close();
  if (mode === "json") {
    console.log(`[seed] JSON store written to: ${JSON_DB_FILE_PATH}`);
  }
  console.log("[seed] done.");
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
