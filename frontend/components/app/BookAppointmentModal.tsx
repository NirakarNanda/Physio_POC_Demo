"use client";

import { useMemo, useState } from "react";
import { FEE_BY_TREATMENT, TREATMENTS, type Patient } from "@/lib/api";

const SLOTS = ["09:00", "09:45", "10:30", "11:15", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function BookAppointmentModal({
  patients,
  onClose,
  onBooked,
}: {
  patients: Patient[];
  onClose: () => void;
  onBooked: (payload: { patientId?: string; patientName?: string; date: string; time: string; treatment: string; fee: number }) => Promise<void>;
}) {
  const [patientId, setPatientId] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState("10:30");
  const [treatment, setTreatment] = useState(TREATMENTS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fee = useMemo(() => FEE_BY_TREATMENT[treatment] ?? 600, [treatment]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const patient = patients.find((p) => p.id === patientId);
    const patientName = patient?.name ?? walkInName.trim();
    if (!patientName) {
      setError("Pick a patient or enter a walk-in name.");
      return;
    }
    setSaving(true);
    try {
      await onBooked({
        patientId: patient?.id,
        patientName,
        date,
        time,
        treatment,
        fee,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setSaving(false);
    }
  };

  const input =
    "rounded-xl border border-ink-950/10 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none transition-colors focus:border-volt-500 dark:border-white/10 dark:bg-ink-950/60 dark:text-cream-50";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-ink-950/10 bg-cream-50 p-7 shadow-2xl dark:border-white/10 dark:bg-ink-900"
      >
        <h2 className="font-display text-2xl font-medium">Book appointment</h2>
        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-sage-500 dark:text-sage-300">Patient</span>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className={input}>
              <option value="">— Walk-in (enter name below) —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.phone}
                </option>
              ))}
            </select>
          </label>
          {!patientId && (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-sage-500 dark:text-sage-300">Walk-in name</span>
              <input value={walkInName} onChange={(e) => setWalkInName(e.target.value)} placeholder="Patient name" className={input} />
            </label>
          )}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-sage-500 dark:text-sage-300">Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-sage-500 dark:text-sage-300">Time</span>
              <select value={time} onChange={(e) => setTime(e.target.value)} className={input}>
                {SLOTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-sage-500 dark:text-sage-300">Treatment</span>
            <select value={treatment} onChange={(e) => setTreatment(e.target.value)} className={input}>
              {TREATMENTS.map((t) => (
                <option key={t} value={t}>
                  {t} · ₹{FEE_BY_TREATMENT[t]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center justify-between rounded-xl bg-volt-400/10 px-4 py-3 ring-1 ring-volt-400/30">
            <span className="text-sm font-medium text-sage-500 dark:text-sage-300">Session fee</span>
            <span className="font-display text-xl font-semibold text-volt-600 dark:text-volt-300">₹{fee}</span>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-ink-950/10 px-4 py-3 text-sm font-medium dark:border-white/10">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-volt-400 px-4 py-3 text-sm font-semibold text-ink-950 disabled:opacity-60">
              {saving ? "Booking…" : "Book session"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
