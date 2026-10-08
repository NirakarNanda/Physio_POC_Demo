export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type PatientStatus = "active" | "completed" | "follow-up";

export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email?: string;
  treatment: string;
  status: PatientStatus;
  nextVisit: string;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  time: string;
  treatment: string;
  status: string;
  fee: number;
}

export interface NewAppointment {
  patientId?: string;
  patientName?: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  treatment?: string;
  fee?: number;
}

export interface RevenueSummary {
  total: number;
  count: number;
}

export interface User {
  name: string;
  email: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (res.status === 204) return {} as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string }).message ??
      `Request failed (${res.status})`;
    const err = new Error(msg) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ ok: boolean; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ ok: boolean; user: User }>("/api/auth/me"),
  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  listPatients: (search = "", status = "") => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (status) q.set("status", status);
    const qs = q.toString();
    return request<{ patients: Patient[] }>(
      `/api/patients${qs ? `?${qs}` : ""}`,
    );
  },
  createPatient: (payload: Partial<Patient>) =>
    request<{ patient: Patient }>("/api/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updatePatient: (id: string, payload: Partial<Patient>) =>
    request<{ patient: Patient }>(`/api/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deletePatient: (id: string) =>
    request<{ ok: boolean }>(`/api/patients/${id}`, { method: "DELETE" }),

  todayAppointments: () =>
    request<{ appointments: Appointment[] }>("/api/appointments/today"),
  listAppointments: (from = "", to = "") => {
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    const qs = q.toString();
    return request<{ appointments: Appointment[] }>(
      `/api/appointments${qs ? `?${qs}` : ""}`,
    );
  },
  createAppointment: (payload: NewAppointment) =>
    request<{ appointment: Appointment }>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateAppointment: (id: string, payload: { status: string }) =>
    request<{ appointment: Appointment }>(`/api/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  monthRevenue: (month = "") =>
    request<RevenueSummary>(
      `/api/appointments/revenue${month ? `?month=${encodeURIComponent(month)}` : ""}`,
    ),
};

export const TREATMENTS = [
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
];

export const STATUSES: PatientStatus[] = ["active", "completed", "follow-up"];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
