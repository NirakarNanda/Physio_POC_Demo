"use client";

import { useCallback, useEffect, useState } from "react";
import AppShell from "@/components/app/AppShell";
import BookAppointmentModal from "@/components/app/BookAppointmentModal";
import StatusBadge from "@/components/app/StatusBadge";
import { api, formatDate, type Appointment, type Patient, type RevenueSummary } from "@/lib/api";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary>({ total: 0, count: 0 });
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [t, p, r] = await Promise.all([
        api.todayAppointments(),
        api.listPatients(),
        api.monthRevenue(),
      ]);
      setToday(t.appointments);
      setPatients(p.patients);
      setRevenue(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    try {
      await api.updateAppointment(id, { status });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const activePatients = patients.filter((p) => p.status === "active").length;
  const followUps = patients.filter((p) => p.status === "follow-up").length;

  const cards = [
    { label: "Today's sessions", value: String(today.length), sub: `${today.filter((a) => a.status === "scheduled").length} upcoming` },
    { label: "Active patients", value: String(activePatients), sub: `${patients.length} total on record` },
    { label: "Revenue this month", value: `₹${revenue.total.toLocaleString("en-IN")}`, sub: `from ${revenue.count} sessions` },
    { label: "Follow-ups due", value: String(followUps), sub: "patients waiting on review" },
  ];

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium sm:text-4xl">Good day, Doctor</h1>
          <p className="mt-1 text-sm text-sage-500 dark:text-sage-400">
            {formatDate(new Date().toISOString())} · here’s your clinic at a glance
          </p>
        </div>
        <button
          onClick={() => setBooking(true)}
          className="rounded-full bg-volt-400 px-6 py-3 text-sm font-semibold text-ink-950 shadow-[0_0_28px_-6px_rgba(200,245,66,0.7)] transition-transform hover:scale-105"
        >
          + Book appointment
        </button>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-500 ring-1 ring-red-400/30 dark:text-red-300">
          {error}
        </p>
      )}

      {/* stat cards */}
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-ink-950/8 bg-white p-5 dark:border-white/8 dark:bg-ink-900"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-sage-500 dark:text-sage-400">
              {c.label}
            </p>
            <p className="font-display mt-2 text-3xl font-semibold text-ink-950 dark:text-cream-50">
              {loading ? "…" : c.value}
            </p>
            <p className="mt-1 text-xs text-sage-500 dark:text-sage-400">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* today's appointments */}
      <div className="mt-8 rounded-2xl border border-ink-950/8 bg-white p-5 sm:p-6 dark:border-white/8 dark:bg-ink-900">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-medium">Today’s sessions</h2>
          <span className="text-xs text-sage-500 dark:text-sage-400">{today.length} booked</span>
        </div>
        {loading ? (
          <p className="py-8 text-center text-sm text-sage-500">Loading…</p>
        ) : today.length === 0 ? (
          <p className="py-8 text-center text-sm text-sage-500 dark:text-sage-400">
            No sessions today. Book one to get the day moving.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-950/5 dark:divide-white/5">
            {today.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3.5">
                <span className="w-14 font-mono text-sm font-semibold text-volt-600 dark:text-volt-300">
                  {a.time}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.patientName}</p>
                  <p className="truncate text-xs text-sage-500 dark:text-sage-400">
                    {a.treatment} · ₹{a.fee.toLocaleString("en-IN")}
                  </p>
                </div>
                <StatusBadge status={a.status} />
                {a.status === "scheduled" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStatus(a.id, "completed")}
                      className="rounded-lg bg-volt-400/15 px-3 py-1.5 text-xs font-semibold text-volt-600 ring-1 ring-volt-400/40 transition-transform hover:scale-105 dark:text-volt-300"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => setStatus(a.id, "cancelled")}
                      className="rounded-lg bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-500 ring-1 ring-red-400/30 transition-transform hover:scale-105 dark:text-red-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {booking && (
        <BookAppointmentModal
          patients={patients}
          onClose={() => setBooking(false)}
          onBooked={async (payload) => {
            await api.createAppointment(payload);
            await load();
          }}
        />
      )}
    </AppShell>
  );
}
