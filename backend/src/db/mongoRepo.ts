import mongoose, { Schema, model, models } from "mongoose";
import { randomUUID } from "crypto";
import type { Appointment, CreatePatientInput, Db, Doctor, Patient, UpdatePatientInput } from "../types";

// MongoDB-backed implementation. Used when MONGODB_URI is set and reachable.

const doctorSchema = new Schema<Doctor>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { versionKey: false }
);

const patientSchema = new Schema<Patient>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    treatment: { type: String, required: true },
    status: { type: String, enum: ["active", "completed", "follow-up"], required: true },
    nextVisit: { type: String, required: true },
    notes: { type: String, default: "" },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);

const DoctorModel: mongoose.Model<Doctor> =
  (models.Doctor as mongoose.Model<Doctor> | undefined) ?? model<Doctor>("Doctor", doctorSchema);
const PatientModel: mongoose.Model<Patient> =
  (models.Patient as mongoose.Model<Patient> | undefined) ?? model<Patient>("Patient", patientSchema);

const appointmentSchema = new Schema<Appointment>(
  {
    id: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    treatment: { type: String, required: true },
    fee: { type: Number, required: true },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], required: true },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);

const AppointmentModel: mongoose.Model<Appointment> =
  (models.Appointment as mongoose.Model<Appointment> | undefined) ??
  model<Appointment>("Appointment", appointmentSchema);

function toAppointment(doc: unknown): Appointment {
  const d = doc as Record<string, unknown>;
  const status =
    d.status === "completed" || d.status === "cancelled" ? d.status : "scheduled";
  return {
    id: String(d.id),
    patientId: String(d.patientId),
    patientName: String(d.patientName),
    date: String(d.date),
    time: String(d.time),
    treatment: String(d.treatment ?? "General Checkup"),
    fee: Number(d.fee ?? 0),
    status,
    createdAt: String(d.createdAt),
  };
}

function toPatient(doc: unknown): Patient {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d.id),
    name: String(d.name),
    age: Number(d.age),
    phone: String(d.phone),
    email: d.email ? String(d.email) : undefined,
    treatment: String(d.treatment),
    status: (d.status as Patient["status"]) ?? "active",
    nextVisit: String(d.nextVisit),
    notes: String(d.notes ?? ""),
    createdAt: String(d.createdAt),
  };
}

export class MongoDb implements Db {
  readonly mode = "mongo" as const;

  constructor(private uri: string) {}

  async connect(): Promise<void> {
    await mongoose.connect(this.uri, { serverSelectionTimeoutMS: 5000 });
  }

  async getDoctorByEmail(email: string): Promise<Doctor | null> {
    const doc = await DoctorModel.findOne({ email: email.toLowerCase() }).lean();
    if (!doc) return null;
    return { email: doc.email, name: doc.name, passwordHash: doc.passwordHash };
  }

  async upsertDoctor(doctor: Doctor): Promise<Doctor> {
    await DoctorModel.updateOne(
      { email: doctor.email.toLowerCase() },
      { $set: { email: doctor.email.toLowerCase(), name: doctor.name, passwordHash: doctor.passwordHash } },
      { upsert: true }
    );
    return doctor;
  }

  async getPatients(): Promise<Patient[]> {
    const docs = await PatientModel.find({}).lean();
    return docs.map(toPatient).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const doc = await PatientModel.findOne({ id }).lean();
    return doc ? toPatient(doc) : null;
  }

  async createPatient(input: CreatePatientInput): Promise<Patient> {
    const doc = new PatientModel({
      id: randomUUID(),
      name: input.name,
      age: input.age,
      phone: input.phone,
      email: input.email || undefined,
      treatment: input.treatment,
      status: input.status,
      nextVisit: input.nextVisit,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    });
    await doc.save();
    return toPatient(doc.toObject());
  }

  async updatePatient(id: string, patch: UpdatePatientInput): Promise<Patient | null> {
    const doc = await PatientModel.findOneAndUpdate({ id }, { $set: { ...patch } }, { new: true }).lean();
    return doc ? toPatient(doc) : null;
  }

  async deletePatient(id: string): Promise<boolean> {
    const res = await PatientModel.deleteOne({ id });
    return res.deletedCount > 0;
  }

  async getAppointments(): Promise<Appointment[]> {
    const docs = await AppointmentModel.find({}).lean();
    return docs
      .map(toAppointment)
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }

  async addAppointment(a: Omit<Appointment, "id" | "createdAt">): Promise<Appointment> {
    const doc = new AppointmentModel({
      ...a,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    });
    await doc.save();
    return toAppointment(doc.toObject());
  }

  async updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment | null> {
    const doc = await AppointmentModel.findOneAndUpdate(
      { id },
      { $set: { ...patch } },
      { new: true }
    ).lean();
    return doc ? toAppointment(doc) : null;
  }

  async getCounts(): Promise<{ doctors: number; patients: number }> {
    const [doctors, patients] = await Promise.all([
      DoctorModel.countDocuments(),
      PatientModel.countDocuments(),
    ]);
    return { doctors, patients };
  }

  async close(): Promise<void> {
    await mongoose.disconnect();
  }
}
