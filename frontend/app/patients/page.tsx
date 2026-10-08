"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import PatientModal from "@/components/PatientModal";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import { fraunces } from "@/lib/fonts";
import { gsap, useGSAP } from "@/lib/gsap";
import { api, formatDate, type Patient, type PatientStatus } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

type StatusFilter = "all" | PatientStatus;
type SortKey = "name" | "nextVisit" | "createdAt";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "follow-up", label: "Follow-up" },
];

function ConfirmDialog({
  name,
  onCancel,
  onConfirm,
  busy,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm dark:bg-black/60"
      onClick={onCancel}
      role="alertdialog"
      aria-label="Confirm delete"
    >
      <div
        className="glass-deep w-full max-w-sm rounded-3xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`${fraunces.className} text-[1.4rem] font-light tracking-tight`}>
          Delete patient?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-white/55">
          <span className="font-semibold text-ink dark:text-white">{name}</span> will be
          removed from the clinic records. This cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-ink/15 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:border-ink/40 hover:text-ink dark:border-white/15 dark:text-white/60 dark:hover:border-white/40 dark:hover:text-white"
          >
            Keep
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-full bg-red-800 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-900 disabled:opacity-60 dark:bg-red-700 dark:hover:bg-red-600"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PatientsContent() {
  useRequireAuth();
  const toast = useToast();
  const searchParams = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("nextVisit");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const [deleting, setDeleting] = useState<Patient | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await api.listPatients();
      setPatients(r.patients);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  // Deep links: ?add=1 opens the create modal, ?status=follow-up pre-filters
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setEditing(null);
      setModalError("");
      setModalOpen(true);
    }
    const st = searchParams.get("status");
    if (st === "active" || st === "completed" || st === "follow-up") {
      setFilter(st);
    }
  }, [searchParams]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = patients.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.treatment.toLowerCase().includes(q)
      );
    });
    out.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else cmp = +new Date(a[sortKey]) - +new Date(b[sortKey]);
      return cmp * sortDir;
    });
    return out;
  }, [patients, search, filter, sortKey, sortDir]);

  const openAdd = () => {
    setEditing(null);
    setModalError("");
    setModalOpen(true);
  };
  const openEdit = (p: Patient) => {
    setEditing(p);
    setModalError("");
    setModalOpen(true);
  };

  const save = async (payload: Partial<Patient>) => {
    setSaving(true);
    setModalError("");
    try {
      if (editing) {
        const r = await api.updatePatient(editing.id, payload);
        setPatients((ps) => ps.map((p) => (p.id === editing.id ? r.patient : p)));
        toast("Patient updated", "success");
      } else {
        const r = await api.createPatient(payload);
        setPatients((ps) => [r.patient, ...ps]);
        toast("Patient added", "success");
      }
      setModalOpen(false);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await api.deletePatient(deleting.id);
      setPatients((ps) => ps.filter((p) => p.id !== deleting.id));
      toast("Patient deleted", "success");
      setDeleting(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setDeleteBusy(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 1 ? " ↑" : " ↓") : "";

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: patients.length,
      active: 0,
      completed: 0,
      "follow-up": 0,
    };
    for (const p of patients) c[p.status] += 1;
    return c;
  }, [patients]);

  return (
    <AppShell>
      <div ref={rootRef}>
        {/* header */}
        <div data-reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-ink/45 dark:text-white/40">
              Clinic records
            </p>
            <h1 className={`${fraunces.className} mt-2 text-[2.5rem] font-light leading-tight tracking-tight`}>
              Patients
            </h1>
            <p className="mt-1.5 text-sm text-ink/55 dark:text-white/50">
              {loading ? "Loading records…" : `${visible.length} of ${patients.length} patients`}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ivory shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift dark:bg-mint-300 dark:text-abyss-950 sm:self-auto"
          >
            + Add patient
          </button>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-red-900/15 bg-red-50 px-5 py-4 text-sm font-medium text-red-800 dark:border-red-400/20 dark:bg-red-950/40 dark:text-red-200" role="alert">
            <span>{error}</span>
            <button onClick={load} className="shrink-0 font-semibold underline underline-offset-4">Retry</button>
          </div>
        )}

        {/* toolbar */}
        <div data-reveal className="glass mt-8 rounded-3xl p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35 dark:text-white/30">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone or treatment…"
                className="w-full rounded-xl border border-white/60 bg-white/40 py-3 pl-11 pr-4 text-sm backdrop-blur-xl outline-none transition-all placeholder:text-ink/35 focus:border-ink/35 focus:bg-white/70 focus:ring-4 focus:ring-ink/5 dark:border-white/10 dark:bg-white/[0.05] dark:placeholder:text-white/30 dark:focus:border-white/35 dark:focus:bg-white/[0.08] dark:focus:ring-white/5"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`glass-pill rounded-full px-4 py-2 text-xs font-semibold capitalize transition-all ${
                    filter === f.key
                      ? "bg-ink text-ivory dark:bg-mint-300 dark:text-abyss-950"
                      : "bg-white/40 text-ink/60 hover:bg-white/70 hover:text-ink dark:bg-white/[0.05] dark:text-white/55 dark:hover:bg-white/[0.1] dark:hover:text-white"
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 ${filter === f.key ? "opacity-70" : "text-ink/40 dark:text-white/35"}`}>
                    {counts[f.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* desktop table */}
        <div data-reveal className="glass mt-6 hidden overflow-hidden rounded-3xl md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[0.18em] text-ink/45 dark:border-white/10 dark:text-white/40">
                <th className="px-7 py-4">
                  <button onClick={() => toggleSort("name")} className="font-semibold transition-colors hover:text-ink dark:hover:text-white">
                    Patient{sortArrow("name")}
                  </button>
                </th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Treatment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4">
                  <button onClick={() => toggleSort("nextVisit")} className="font-semibold transition-colors hover:text-ink dark:hover:text-white">
                    Next visit{sortArrow("nextVisit")}
                  </button>
                </th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-ink/[0.06] dark:border-white/[0.06]">
                    <td className="px-7 py-5"><div className="skeleton h-4 w-36 rounded" /></td>
                    <td className="px-6 py-5"><div className="skeleton h-4 w-28 rounded" /></td>
                    <td className="px-6 py-5"><div className="skeleton h-4 w-32 rounded" /></td>
                    <td className="px-6 py-5"><div className="skeleton h-6 w-20 rounded-full" /></td>
                    <td className="px-6 py-5"><div className="skeleton h-4 w-24 rounded" /></td>
                    <td className="px-6 py-5"><div className="skeleton ml-auto h-8 w-24 rounded-xl" /></td>
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <p className={`${fraunces.className} text-xl font-light`}>No patients found</p>
                    <p className="mt-1.5 text-sm text-ink/55 dark:text-white/50">
                      {patients.length === 0
                        ? "Your clinic records are empty — add your first patient to get started."
                        : "Try a different search or filter."}
                    </p>
                    {patients.length === 0 && (
                      <button
                        onClick={openAdd}
                        className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory transition-all hover:-translate-y-0.5 dark:bg-mint-300 dark:text-abyss-950"
                      >
                        + Add first patient
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                visible.map((p) => (
                  <tr key={p.id} className="border-b border-ink/[0.06] transition-colors last:border-0 hover:bg-ink/[0.025] dark:border-white/[0.06] dark:hover:bg-white/[0.025]">
                    <td className="px-7 py-5">
                      <p className="font-semibold">{p.name}</p>
                      <p className="mt-0.5 text-xs text-ink/50 dark:text-white/45">Age {p.age}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-ink/80 dark:text-white/75">{p.phone}</p>
                      {p.email && <p className="mt-0.5 text-xs text-ink/50 dark:text-white/45">{p.email}</p>}
                    </td>
                    <td className="px-6 py-5 text-ink/80 dark:text-white/75">{p.treatment}</td>
                    <td className="px-6 py-5"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-5 font-medium text-ink/80 dark:text-white/75">{formatDate(p.nextVisit)}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:border-ink/45 hover:text-ink dark:border-white/15 dark:text-white/60 dark:hover:border-white/45 dark:hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleting(p)}
                          className="rounded-full border border-red-900/15 px-4 py-1.5 text-xs font-semibold text-red-800/80 transition-colors hover:border-red-900/50 hover:text-red-900 dark:border-red-400/20 dark:text-red-200/80 dark:hover:border-red-400/50 dark:hover:text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* mobile cards */}
        <div className="mt-6 space-y-4 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl p-5">
                <div className="skeleton h-5 w-40 rounded" />
                <div className="skeleton mt-3 h-4 w-56 rounded" />
                <div className="skeleton mt-2 h-4 w-32 rounded" />
              </div>
            ))
          ) : visible.length === 0 ? (
            <div className="glass rounded-3xl border border-dashed border-ink/15 p-10 text-center dark:border-white/15">
              <p className={`${fraunces.className} text-xl font-light`}>No patients found</p>
              <p className="mt-1.5 text-sm text-ink/55 dark:text-white/50">
                {patients.length === 0
                  ? "Add your first patient to get started."
                  : "Try a different search or filter."}
              </p>
              {patients.length === 0 && (
                <button
                  onClick={openAdd}
                  className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-ivory dark:bg-mint-300 dark:text-abyss-950"
                >
                  + Add first patient
                </button>
              )}
            </div>
          ) : (
            visible.map((p) => (
              <div
                key={p.id}
                data-reveal
                className="glass rounded-3xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="mt-0.5 text-xs text-ink/50 dark:text-white/45">Age {p.age} · {p.phone}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-ink/[0.07] pt-4 dark:border-white/[0.07]">
                  <div>
                    <p className="text-sm text-ink/80 dark:text-white/75">{p.treatment}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55 dark:text-white/50">
                      Next visit · {formatDate(p.nextVisit)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink/70 dark:border-white/15 dark:text-white/60"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleting(p)}
                      className="rounded-full border border-red-900/15 px-4 py-1.5 text-xs font-semibold text-red-800/80 dark:border-red-400/20 dark:text-red-200/80"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <PatientModal
          open={modalOpen}
          patient={editing}
          saving={saving}
          error={modalError}
          onClose={() => setModalOpen(false)}
          onSave={save}
        />

        {deleting && (
          <ConfirmDialog
            name={deleting.name}
            busy={deleteBusy}
            onCancel={() => setDeleting(null)}
            onConfirm={confirmDelete}
          />
        )}
      </div>
    </AppShell>
  );
}

export default function PatientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ivory dark:bg-abyss-950">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/45 dark:text-white/40">
            Loading patients
          </p>
        </div>
      }
    >
      <PatientsContent />
    </Suspense>
  );
}
