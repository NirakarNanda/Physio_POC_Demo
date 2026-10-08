"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import PasswordField from "@/components/PasswordField";
import { useToast } from "@/components/Toast";
import { api, type Appointment, type Patient } from "@/lib/api";
import { downloadCSV, toCSV } from "@/lib/csv";
import { fraunces } from "@/lib/fonts";
import { useRequireAuth } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import { useTheme, type ThemeMode } from "@/components/theme/ThemeProvider";
import { SETTINGS_SECTIONS as SECTIONS } from "@/lib/settings-sections";

const inputCls =
  "w-full rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 outline-none transition focus:border-mint-500 focus:ring-2 focus:ring-mint-500/25 dark:border-white/10 dark:bg-white/[0.06] dark:text-[#edf7f5] dark:placeholder:text-white/25";
const labelCls =
  "mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.14em] text-ink/50 dark:text-white/45";

function Section({
  kicker,
  title,
  blurb,
  children,
}: {
  kicker: string;
  title: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass-deep rounded-[1.75rem] p-8 sm:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-ink/45 dark:text-white/40">
        {kicker}
      </p>
      <h2 className={`${fraunces.className} mt-2 text-[1.9rem] font-light leading-tight tracking-tight`}>
        {title}
      </h2>
      {blurb && (
        <p className="mt-2 text-sm leading-relaxed text-ink/55 dark:text-white/50">{blurb}</p>
      )}
      <div className="mt-7">{children}</div>
    </section>
  );
}

function AppointmentDefaults() {
  const { defaultFee, update } = useSettings();
  const toast = useToast();
  const [fee, setFee] = useState(String(defaultFee));

  useEffect(() => {
    setFee(String(defaultFee));
  }, [defaultFee]);

  const save = () => {
    const n = parseInt(fee, 10);
    if (!Number.isFinite(n) || n < 0) {
      toast("Enter a valid fee — 0 or more.", "error");
      return;
    }
    update({ defaultFee: n });
    toast(`Default fee set to ₹${n} — pre-filled on every new booking.`, "success");
  };

  return (
    <Section
      kicker="Appointments"
      title="Booking defaults"
      blurb="Your standard consultation fee, pre-filled whenever you book an appointment. You can still change it per booking."
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-44">
          <label className={labelCls} htmlFor="default-fee">Default fee (₹)</label>
          <input
            id="default-fee"
            className={inputCls}
            value={fee}
            onChange={(e) => setFee(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="500"
          />
        </div>
        <button
          type="button"
          onClick={save}
          className="rounded-full bg-ink px-7 py-3 text-[15px] font-semibold tracking-wide text-ivory shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift dark:bg-mint-300 dark:text-abyss-950"
        >
          Save
        </button>
      </div>
    </Section>
  );
}

function Appearance() {
  const { mode, setMode } = useTheme();
  const toast = useToast();
  const options: { value: ThemeMode; label: string; hint: string }[] = [
    { value: "light", label: "Light", hint: "Bright clinic look" },
    { value: "dark", label: "Dark", hint: "Easy on the eyes" },
    { value: "system", label: "System", hint: "Follow this device" },
  ];
  return (
    <Section
      kicker="Appearance"
      title="Theme"
      blurb="Pick how the app looks. System follows your device's light/dark setting automatically."
    >
      <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
        {options.map((o) => {
          const active = mode === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setMode(o.value);
                toast(`Theme set to ${o.label.toLowerCase()}.`, "success");
              }}
              className={`rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                active
                  ? "border-ink/70 bg-ink/[0.04] shadow-soft dark:border-mint-300/60 dark:bg-mint-300/10"
                  : "border-ink/10 bg-white/40 hover:border-ink/25 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/25"
              }`}
            >
              <span className="block text-[15px] font-semibold">{o.label}</span>
              <span className="mt-1 block text-[12px] text-ink/50 dark:text-white/45">{o.hint}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function dateStamp(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}${m}${day}`;
}

const PATIENT_COLS = [
  { key: "name", header: "Name" },
  { key: "age", header: "Age" },
  { key: "phone", header: "Phone" },
  { key: "email", header: "Email" },
  { key: "treatment", header: "Treatment" },
  { key: "status", header: "Status" },
  { key: "nextVisit", header: "Next visit" },
  { key: "notes", header: "Notes" },
  { key: "createdAt", header: "Added on" },
];

const APPT_COLS = [
  { key: "date", header: "Date" },
  { key: "time", header: "Time" },
  { key: "patientName", header: "Patient" },
  { key: "treatment", header: "Treatment" },
  { key: "fee", header: "Fee (₹)" },
  { key: "status", header: "Status" },
];

function DataExport() {
  const toast = useToast();
  const [busy, setBusy] = useState<"patients" | "appointments" | null>(null);

  const exportPatients = async () => {
    setBusy("patients");
    try {
      const { patients }: { patients: Patient[] } = await api.listPatients();
      downloadCSV(
        `movewell-patients-${dateStamp()}.csv`,
        toCSV(PATIENT_COLS, patients as unknown as Record<string, unknown>[]),
      );
      toast(`Exported ${patients.length} patient${patients.length === 1 ? "" : "s"}.`, "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Export failed — please try again.", "error");
    } finally {
      setBusy(null);
    }
  };

  const exportAppointments = async () => {
    setBusy("appointments");
    try {
      const { appointments }: { appointments: Appointment[] } = await api.listAppointments();
      downloadCSV(
        `movewell-appointments-${dateStamp()}.csv`,
        toCSV(APPT_COLS, appointments as unknown as Record<string, unknown>[]),
      );
      toast(
        `Exported ${appointments.length} appointment${appointments.length === 1 ? "" : "s"}.`,
        "success",
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Export failed — please try again.", "error");
    } finally {
      setBusy(null);
    }
  };

  const btnCls =
    "flex flex-1 items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white/50 px-5 py-4 text-[15px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-soft disabled:translate-y-0 disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25";

  return (
    <Section
      kicker="Data"
      title="Export your records"
      blurb="Download everything as a spreadsheet-friendly CSV — handy for accounts, audits, or a personal backup. Exports include all records, not just today's."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={exportPatients} disabled={busy !== null} className={btnCls}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
          </svg>
          {busy === "patients" ? "Exporting…" : "Patients CSV"}
        </button>
        <button type="button" onClick={exportAppointments} disabled={busy !== null} className={btnCls}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
          </svg>
          {busy === "appointments" ? "Exporting…" : "Appointments CSV"}
        </button>
      </div>
    </Section>
  );
}

function ChangePassword() {
  const { user } = useRequireAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords don't match — check and try again.");
      return;
    }
    if (next === current) {
      setError("New password must be different from the current one.");
      return;
    }
    setBusy(true);
    try {
      await api.changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setSuccess("Password updated. Use it next time you sign in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the password. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section
      kicker="Security"
      title="Change password"
      blurb={
        `Signed in as ${user?.name ?? ""} (${user?.email ?? ""}). Pick something memorable — at least 8 characters.`
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <PasswordField
          id="current-password"
          label="Current password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <PasswordField
          id="new-password"
          label="New password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        {error && (
          <div
            className="rounded-xl border border-red-900/15 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-400/20 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="rounded-xl border border-emerald-900/15 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-950/40 dark:text-emerald-200"
            role="status"
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-ink py-3.5 text-[15px] font-semibold tracking-wide text-ivory shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift disabled:translate-y-0 disabled:opacity-60 dark:bg-mint-300 dark:text-abyss-950"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </Section>
  );
}

function SettingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const param = searchParams.get("section");
  const validParam =
    param && SECTIONS.some((s) => s.value === param) ? param : null;
  const [section, setSection] = useState(validParam ?? SECTIONS[0].value);
  const active = SECTIONS.find((s) => s.value === section) ?? SECTIONS[0];

  // Deep links (e.g. from the sidebar) switch the visible section.
  useEffect(() => {
    if (validParam) setSection(validParam);
  }, [validParam]);

  const pickSection = (value: string) => {
    setSection(value);
    router.replace(`/settings?section=${encodeURIComponent(value)}`, {
      scroll: false,
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <label className={labelCls} htmlFor="settings-section">
          Settings section
        </label>
        <div className="relative">
          <select
            id="settings-section"
            value={section}
            onChange={(e) => pickSection(e.target.value)}
            className={`${inputCls} cursor-pointer appearance-none pr-11 font-medium dark:[color-scheme:dark]`}
          >
            {SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 dark:text-white/40"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <p className="mt-2 text-[13px] text-ink/50 dark:text-white/45">{active.hint}</p>
      </div>

      <div key={section} className="settings-enter">
        {section === "appointments" && <AppointmentDefaults />}
        {section === "appearance" && <Appearance />}
        {section === "data" && <DataExport />}
        {section === "security" && <ChangePassword />}
      </div>

      <p className="mt-6 pb-2 text-center text-[12px] leading-relaxed text-ink/40 dark:text-white/35">
        Booking defaults are saved on this device. Password changes apply to your account everywhere.
      </p>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-2xl">
            <div className="glass-deep h-64 animate-pulse rounded-[1.75rem]" />
          </div>
        }
      >
        <SettingsInner />
      </Suspense>
    </AppShell>
  );
}
