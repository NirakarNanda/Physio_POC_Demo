// Shared shapes between the repository implementations and the API.

export type PatientStatus = "active" | "completed" | "follow-up";

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email?: string;
  treatment: string;
  status: PatientStatus;
  nextVisit: string; // ISO date string
  notes: string;
  createdAt: string; // ISO date string
}

export interface Doctor {
  email: string;
  name: string;
  passwordHash: string;
}

export interface CreatePatientInput {
  name: string;
  age: number;
  phone: string;
  email?: string;
  treatment: string;
  status: PatientStatus;
  nextVisit: string;
  notes: string;
}

export type UpdatePatientInput = Partial<Omit<CreatePatientInput, never>>;

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // ISO yyyy-mm-dd (server-local calendar date)
  time: string; // "HH:MM" 24h
  treatment: string;
  fee: number; // ₹
  status: AppointmentStatus;
  createdAt: string; // ISO date string
}

export interface CreateAppointmentInput {
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  treatment: string;
  fee: number;
  status: AppointmentStatus;
}

// Minimal repository interface. Two implementations exist:
//  - mongoose  (MongoDB Atlas when MONGODB_URI is set and reachable)
//  - json-file (offline fallback, persisted to <backend-root>/data/db.json)
export interface Db {
  mode: "mongo" | "json";
  getDoctorByEmail(email: string): Promise<Doctor | null>;
  upsertDoctor(doctor: Doctor): Promise<Doctor>;
  getPatients(): Promise<Patient[]>;
  getPatientById(id: string): Promise<Patient | null>;
  createPatient(input: CreatePatientInput): Promise<Patient>;
  updatePatient(id: string, patch: UpdatePatientInput): Promise<Patient | null>;
  deletePatient(id: string): Promise<boolean>;
  getAppointments(): Promise<Appointment[]>;
  addAppointment(a: Omit<Appointment, "id" | "createdAt">): Promise<Appointment>;
  updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment | null>;
  close(): Promise<void>;
  /** Quick summary used for startup diagnostics (doctor/patient counts). */
  getCounts(): Promise<{ doctors: number; patients: number }>;
}

export function isPatientStatus(v: unknown): v is PatientStatus {
  return v === "active" || v === "completed" || v === "follow-up";
}

export function isAppointmentStatus(v: unknown): v is AppointmentStatus {
  return v === "scheduled" || v === "completed" || v === "cancelled";
}
