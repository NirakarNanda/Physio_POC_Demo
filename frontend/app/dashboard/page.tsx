"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AppShell from "@/components/AppShell";
import BookAppointmentModal from "@/components/BookAppointmentModal";
import { useTheme } from "@/components/theme/ThemeProvider";
import { fraunces } from "@/lib/fonts";
import { gsap, useGSAP } from "@/lib/gsap";
import { api, formatDate, type Appointment, type NewAppointment, type Patient, type RevenueSummary } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

function StatSkeleton() {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="skeleton mt-4 h-8 w-20 rounded-lg" />
      <div className="skeleton mt-2 h-4 w-28 rounded-lg" />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  hint,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <div
      data-reveal
      className="glass rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="glass-pill flex h-11 w-11 items-center justify-center rounded-xl bg-white/50 text-ink/70 dark:bg-white/[0.07] dark:text-mint-200">
        {icon}
      </div>
      <p className={`${fraunces.className} mt-4 text-[2rem] font-light leading-none tracking-tight`}>
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs text-ink/50 dark:text-white/45">{hint}</p>
    </div>
  );
}

const ICONS = {
  calendar: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M8 2v4M16 2v4M3 9h18" />
    </svg>
  ),
  patients: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  revenue: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 2v20M17 7H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  followup: (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 109-9 9.7 9.7 0 00-6.7 2.8L3 8" />
      <path d="M3 3v5h5M12 7v5l3.5 2" />
    </svg>
  ),
};

function apptChip(status: string) {
  const s = status.toLowerCase();
  const base = "glass-pill ";
  if (s.includes("confirm"))
    return base + "bg-[#dcebe8]/70 text-[#2f5d55] dark:bg-mint-500/15 dark:text-mint-200";
  if (s.includes("complete") || s.includes("done"))
    return base + "bg-[#e9e2d6]/70 text-[#6d5a3e] dark:bg-white/[0.08] dark:text-white/70";
  if (s.includes("cancel"))
    return base + "bg-red-100/70 text-red-800 dark:bg-red-500/15 dark:text-red-200";
  return base + "bg-[#f3e8c8]/70 text-[#8a6d1f] dark:bg-amber-400/15 dark:text-amber-200";
}

export default function DashboardPage() {
  const { user } = useRequireAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const rootRef = useRef<HTMLDivElement>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary>({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookOpen, setBookOpen] = useState(false);
  const [bookSaving, setBookSaving] = useState(false);
  const [bookError, setBookError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async (alive: () => boolean) => {
    try {
      const [a, p, r] = await Promise.all([
        api.todayAppointments(),
        api.listPatients(),
        api.monthRevenue(),
      ]);
      if (!alive()) return;
      setAppointments(a.appointments);
      setPatients(p.patients);
      setRevenue(r);
      setLoading(false);
    } catch (e) {
      if (!alive()) return;
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    load(() => alive);
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => {
    load(() => true);
  };

  const openBooking = () => {
    setBookError("");
    setBookOpen(true);
  };

  const saveBooking = async (payload: NewAppointment) => {
    setBookSaving(true);
    setBookError("");
    try {
      await api.createAppointment(payload);
      setBookOpen(false);
      refresh();
    } catch (e) {
      setBookError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBookSaving(false);
    }
  };

  const setStatus = async (id: string, status: "completed" | "cancelled") => {
    setUpdatingId(id);
    try {
      await api.updateAppointment(id, { status });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  // Calm staggered entrance once data is in
  useGSAP(
    () => {
      if (loading) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-reveal]", { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        "[data-reveal]",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
        },
      );
    },
    { scope: rootRef, dependencies: [loading] },
  );

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const followUps = patients.filter((p) => p.status === "follow-up").length;

  // Weekly chart: distribute today's appointments + upcoming nextVisit across the week
  const weekly = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const buckets = days.map((d) => ({ day: d, visits: 0 }));
    const now = new Date();
    const monday = new Date(now);
    const dow = (now.getDay() + 6) % 7; // Monday = 0
    monday.setDate(now.getDate() - dow);
    monday.setHours(0, 0, 0, 0);
    for (const p of patients) {
      const d = new Date(p.nextVisit);
      if (Number.isNaN(d.getTime())) continue;
      const diff = Math.floor((d.getTime() - monday.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) buckets[diff].visits += 1;
    }
    if (buckets.every((b) => b.visits === 0) && appointments.length > 0) {
      buckets[dow].visits = appointments.length;
    }
    return buckets;
  }, [patients, appointments]);

  // Theme-aware recharts palette
  const chart = {
    grid: isDark ? "rgba(255,255,255,0.08)" : "rgba(14,42,40,0.08)",
    tick: isDark ? "rgba(255,255,255,0.45)" : "rgba(14,42,40,0.5)",
    bar: isDark ? "#5eead4" : "#3d7a70",
    cursor: isDark ? "rgba(255,255,255,0.05)" : "rgba(14,42,40,0.04)",
    tooltipBg: isDark ? "#062b29" : "#ffffff",
    tooltipBorder: isDark ? "rgba(255,255,255,0.12)" : "rgba(14,42,40,0.12)",
    tooltipText: isDark ? "#edf7f5" : "#0e2a28",
  };

  const hour = new Date().getHours();
  const daypart = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  // "Dr. Arjun Rao" -> "Arjun" (strip honorific for a natural greeting)
  const firstName = user?.name.replace(/^(Dr|Mr|Mrs|Ms)\.\s*/i, "").split(" ")[0];

  return (
    <AppShell>
      <div ref={rootRef}>
        {/* header */}
        <div data-reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-ink/45 dark:text-white/40">
              {today}
            </p>
            <h1 className={`${fraunces.className} mt-2 text-[2.5rem] font-light leading-tight tracking-tight`}>
              Good {daypart}
              {firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-1.5 text-sm text-ink/55 dark:text-white/50">
              Here is what is happening at MoveWell Physiotherapy Studio today.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Link
              href="/patients?add=1"
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift dark:bg-mint-300 dark:text-abyss-950"
            >
              + Add patient
            </Link>
            <button
              onClick={openBooking}
              className="rounded-full border border-ink/15 bg-white/70 px-6 py-2.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/30 dark:border-white/15 dark:bg-white/[0.05] dark:text-white dark:hover:border-white/30"
            >
              Book appointment
            </button>
          </div>
        </div>

        {error && (
          <div
            className="mt-6 rounded-2xl border border-red-900/15 bg-red-50 px-5 py-4 text-sm font-medium text-red-800 dark:border-red-400/20 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* stats */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard icon={ICONS.calendar} value={String(appointments.length)} label="Today's appointments" hint="Scheduled for today" />
              <StatCard icon={ICONS.patients} value={String(patients.length)} label="Total patients" hint="In the clinic records" />
              <StatCard icon={ICONS.revenue} value={`₹${revenue.total.toLocaleString("en-IN")}`} label="Revenue this month" hint={revenue.count > 0 ? `From ${revenue.count} appointment${revenue.count === 1 ? "" : "s"}` : "No revenue recorded yet"} />
              <StatCard icon={ICONS.followup} value={String(followUps)} label="Pending follow-ups" hint="Need a callback" />
            </>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          {/* today's appointments */}
          <div data-reveal className="glass rounded-3xl p-6 sm:p-7 lg:col-span-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className={`${fraunces.className} text-[1.45rem] font-light tracking-tight`}>
                  Today&apos;s appointments
                </h2>
                <p className="mt-0.5 text-xs text-ink/50 dark:text-white/45">
                  {appointments.length} scheduled
                </p>
              </div>
              <Link
                href="/patients"
                className="shrink-0 text-[13px] font-semibold text-ink/60 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink/50 dark:text-white/55 dark:decoration-white/20 dark:hover:text-white"
              >
                View all patients →
              </Link>
            </div>
            <div className="slim-scroll mt-5 max-h-[380px] space-y-1 overflow-y-auto pr-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl p-4">
                    <div className="skeleton h-11 w-14 rounded-xl" />
                    <div className="flex-1">
                      <div className="skeleton h-4 w-32 rounded" />
                      <div className="skeleton mt-2 h-3 w-48 rounded" />
                    </div>
                  </div>
                ))
              ) : appointments.length === 0 ? (
                <div className="glass rounded-2xl border border-dashed border-ink/15 p-10 text-center dark:border-white/15">
                  <p className={`${fraunces.className} text-lg font-light`}>No appointments today</p>
                  <p className="mt-1 text-xs text-ink/50 dark:text-white/45">
                    Enjoy the calm — or add a patient to fill the day.
                  </p>
                </div>
              ) : (
                appointments.map((a) => {
                  const cancelled = a.status === "cancelled";
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center gap-4 border-b border-ink/[0.07] py-4 transition-colors last:border-0 hover:bg-ink/[0.02] dark:border-white/[0.07] dark:hover:bg-white/[0.02] ${cancelled ? "opacity-50" : ""}`}
                    >
                      <div className="flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-ink/[0.05] dark:bg-white/[0.06]">
                        <span className="text-sm font-bold leading-none">{a.time}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-semibold ${cancelled ? "line-through" : ""}`}>
                          {a.patientName}
                        </p>
                        <p className="truncate text-xs text-ink/50 dark:text-white/45">
                          {a.treatment} · ₹{Number(a.fee).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${apptChip(a.status)}`}>
                        {a.status}
                      </span>
                      {a.status === "scheduled" && (
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            onClick={() => setStatus(a.id, "completed")}
                            disabled={updatingId === a.id}
                            title="Mark completed"
                            className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink/70 transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-50 dark:border-white/15 dark:text-white/60 dark:hover:border-white/40 dark:hover:text-white"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => setStatus(a.id, "cancelled")}
                            disabled={updatingId === a.id}
                            title="Cancel appointment"
                            className="rounded-full border border-red-900/20 px-3 py-1 text-xs font-semibold text-red-800/80 transition-colors hover:border-red-900/50 hover:text-red-800 disabled:opacity-50 dark:border-red-400/25 dark:text-red-200/80 dark:hover:border-red-400/60 dark:hover:text-red-200"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* chart + quick actions */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div data-reveal className="glass rounded-3xl p-6 sm:p-7">
              <h2 className={`${fraunces.className} text-[1.45rem] font-light tracking-tight`}>
                Visits this week
              </h2>
              <p className="mt-0.5 text-xs text-ink/50 dark:text-white/45">Scheduled visits per day</p>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: chart.tick }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chart.tick }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: chart.cursor }}
                      contentStyle={{
                        borderRadius: 12,
                        border: `1px solid ${chart.tooltipBorder}`,
                        fontSize: 12,
                        background: chart.tooltipBg,
                        color: chart.tooltipText,
                      }}
                    />
                    <Bar dataKey="visits" fill={chart.bar} radius={[6, 6, 3, 3]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div data-reveal className="rounded-3xl border border-white/50 bg-ink/70 p-6 text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(255,255,255,0.08),0_24px_55px_-18px_rgba(4,47,46,0.5)] backdrop-blur-[30px] saturate-[1.6] dark:border-white/15 dark:bg-white/[0.06] dark:text-[#edf7f5] sm:p-7">
              <h2 className={`${fraunces.className} text-[1.45rem] font-light tracking-tight`}>
                Quick actions
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-2">
                <Link href="/patients?add=1" className="rounded-xl border border-ivory/15 bg-white/[0.06] px-4 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-white/[0.12] dark:border-white/15 dark:hover:bg-white/10">
                  Add a new patient
                </Link>
                <button onClick={openBooking} className="rounded-xl border border-ivory/15 bg-white/[0.06] px-4 py-3 text-left text-sm font-medium backdrop-blur transition-colors hover:bg-white/[0.12] dark:border-white/15 dark:hover:bg-white/10">
                  Book an appointment
                </button>
                <Link href="/patients?status=follow-up" className="rounded-xl border border-ivory/15 bg-white/[0.06] px-4 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-white/[0.12] dark:border-white/15 dark:hover:bg-white/10">
                  View pending follow-ups
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* upcoming visits strip */}
        {!loading && patients.length > 0 && (
          <div data-reveal className="glass mt-6 rounded-3xl p-6 sm:p-7">
            <h2 className={`${fraunces.className} text-[1.45rem] font-light tracking-tight`}>
              Upcoming visits
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {patients
                .filter((p) => new Date(p.nextVisit).getTime() >= Date.now() - 86400000)
                .sort((a, b) => +new Date(a.nextVisit) - +new Date(b.nextVisit))
                .slice(0, 6)
                .map((p) => (
                  <div key={p.id} className="glass-pill rounded-2xl bg-white/40 p-4 transition-all hover:-translate-y-0.5 dark:bg-white/[0.05]">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="mt-0.5 text-xs text-ink/50 dark:text-white/45">{p.treatment}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/60 dark:text-mint-200/80">
                      {formatDate(p.nextVisit)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <BookAppointmentModal
        open={bookOpen}
        patients={patients}
        saving={bookSaving}
        error={bookError}
        onClose={() => setBookOpen(false)}
        onSave={saveBooking}
      />
    </AppShell>
  );
}
