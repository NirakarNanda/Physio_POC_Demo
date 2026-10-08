"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "@/components/app/AppShell";
import PatientModal from "@/components/app/PatientModal";
import StatusBadge from "@/components/app/StatusBadge";
import { api, formatDate, type Patient } from "@/lib/api";

const FILTERS = ["all", "active", "follow-up", "completed"] as const;

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [modal, setModal] = useState<{ open: boolean; patient: Patient | null }>({
    open: false,
    patient: null,
  });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await api.listPatients();
      setPatients(r.patients);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.treatment.toLowerCase().includes(q)
      );
    });
  }, [patients, search, filter]);

  const remove = async (p: Patient) => {
    if (!window.confirm(`Remove ${p.name} from the records?`)) return;
    try {
      await api.deletePatient(p.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium sm:text-4xl">Patients</h1>
          <p className="mt-1 text-sm text-sage-500 dark:text-sage-400">
            {patients.length} on record · search, filter, manage
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, patient: null })}
          className="rounded-full bg-volt-400 px-6 py-3 text-sm font-semibold text-ink-950 shadow-[0_0_28px_-6px_rgba(200,245,66,0.7)] transition-transform hover:scale-105"
        >
          + Add patient
        </button>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-500 ring-1 ring-red-400/30 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, treatment…"
          className="min-w-[220px] flex-1 rounded-xl border border-ink-950/10 bg-white px-4 py-2.5 text-sm text-ink-950 outline-none transition-colors focus:border-volt-500 sm:max-w-xs dark:border-white/10 dark:bg-ink-900 dark:text-cream-50"
        />
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? "bg-volt-400 text-ink-950"
                  : "border border-ink-950/10 text-sage-500 hover:border-volt-500 dark:border-white/10 dark:text-sage-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-ink-950/8 bg-white dark:border-white/8 dark:bg-ink-900">
        {loading ? (
          <p className="py-10 text-center text-sm text-sage-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-sage-500 dark:text-sage-400">
            No patients match. Add one to get started.
          </p>
        ) : (
          <ul className="divide-y divide-ink-950/5 dark:divide-white/5">
            {filtered.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-volt-400/15 font-mono text-xs font-bold text-volt-600 ring-1 ring-volt-400/30 dark:text-volt-300">
                  {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {p.name} <span className="font-normal text-sage-500">· {p.age} yrs</span>
                  </p>
                  <p className="truncate text-xs text-sage-500 dark:text-sage-400">
                    {p.treatment} · {p.phone} · next visit {formatDate(p.nextVisit)}
                  </p>
                  {p.notes && (
                    <p className="mt-0.5 truncate text-xs italic text-sage-400 dark:text-sage-500">
                      {p.notes}
                    </p>
                  )}
                </div>
                <StatusBadge status={p.status} />
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal({ open: true, patient: p })}
                    className="rounded-lg border border-ink-950/10 px-3 py-1.5 text-xs font-semibold transition-colors hover:border-volt-500 dark:border-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="rounded-lg bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-500 ring-1 ring-red-400/30 transition-transform hover:scale-105 dark:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal.open && (
        <PatientModal
          patient={modal.patient}
          onClose={() => setModal({ open: false, patient: null })}
          onSaved={async (payload) => {
            if (modal.patient) await api.updatePatient(modal.patient.id, payload);
            else await api.createPatient(payload);
            await load();
          }}
        />
      )}
    </AppShell>
  );
}
