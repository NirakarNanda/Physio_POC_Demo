import type { PatientStatus } from "@/lib/api";

/** Glassy status pills — translucent, blurred, light-catching borders. */
const STYLES: Record<PatientStatus | "all", string> = {
  all: "glass-pill bg-white/50 text-ink/60 dark:bg-white/[0.08] dark:text-white/60",
  active: "glass-pill bg-[#dcebe8]/60 text-[#2f5d55] dark:bg-mint-500/15 dark:text-mint-200",
  completed: "glass-pill bg-[#e9e2d6]/60 text-[#6d5a3e] dark:bg-white/[0.08] dark:text-white/65",
  "follow-up": "glass-pill bg-[#f3e8c8]/60 text-[#8a6d1f] dark:bg-amber-400/15 dark:text-amber-200",
};

export default function StatusBadge({ status }: { status: PatientStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}
