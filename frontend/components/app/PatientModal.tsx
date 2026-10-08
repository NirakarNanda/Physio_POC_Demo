"use client";

import { useState } from "react";
import { STATUSES, TREATMENTS, toDateInput, type Patient } from "@/lib/api";

export default function PatientModal({
  patient,
  onClose,
  onSaved,
}: {
  patient: Patient | null; // null = create
  onClose: () => void;
  onSaved: (payload: Partial<Patient>) => Promise<void>;
}) {
  const [name, setName] = useState(patient?.name ?? "");
  const [age, setAge] = useState(patient ? String(patient.age) : "");
  const [phone, setPhone] = useState(patient?.phone ?? "");
  const [email, setEmail] = useState(patient?.email ?? "");
  const [treatment, setTreatment] = useState(patient?.treatment ?? TREATMENTS[0]);
  const [status, setStatus] = useState(patient?.status ?? "active");
  const [nextVisit, setNextVisit] = useState(patient ? toDateInput(patient.nextVisit) : "");
  const [notes, setNotes] = useState(patient?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) {
      setError("Enter a valid age (0–120).");
      return;
    }
    setSaving(true);
    try {
      await onSaved({
        name: name.trim(),
        age: ageNum,
        phone: phone.trim(),
        email: email.trim() || undefined,
        treatment,
        status,
        nextVisit: nextVisit ? new Date(`${nextVisit}T10:00:00`).toISOString() : new Date().toISOString(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const input =
    "rounded-xl border border-ink-950/10 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none transition-colors focus:border-volt-500 dark:border-white/10 dark:bg-ink-950/60 dark:text-cream-50";
  const label = "flex flex-col gap-1.5 text-sm";
  const labelText = "font-medium text-sage-500 dark:text-sage-300";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-ink-950/10 bg-cream-50 p-7 shadow-2xl slim-scroll dark:border-white/10 dark:bg-ink-900"
      >
        <h2 className="font-display text-2xl font-medium">{patient ? "Edit patient" : "Add patient"}</h2>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <label className={label}>
            <span className={labelText}>Full name *</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rohan Mehta" className={input} />
          </label>
          <label className={label}>
            <span className={labelText}>Age *</span>
            <input value={age} onChange={(e) => setAge(e.target.value)} inputMode="numeric" placeholder="34" className={input} />
          </label>
          <label className={label}>
            <span className={labelText}>Phone *</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" className={input} />
          </label>
          <label className={label}>
            <span className={labelText}>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="optional" className={input} />
          </label>
          <label className={label}>
            <span className={labelText}>Treatment</span>
            <select value={treatment} onChange={(e) => setTreatment(e.target.value)} className={input}>
              {TREATMENTS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className={label}>
            <span className={labelText}>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as Patient["status"])} className={input}>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className={`${label} col-span-2`}>
            <span className={labelText}>Next visit</span>
            <input type="date" value={nextVisit} onChange={(e) => setNextVisit(e.target.value)} className={input} />
          </label>
          <label className={`${label} col-span-2`}>
            <span className={labelText}>Clinical notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Assessment, protocol, progress…" className={input} />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-ink-950/10 px-4 py-3 text-sm font-medium dark:border-white/10">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-volt-400 px-4 py-3 text-sm font-semibold text-ink-950 disabled:opacity-60">
            {saving ? "Saving…" : patient ? "Save changes" : "Add patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
