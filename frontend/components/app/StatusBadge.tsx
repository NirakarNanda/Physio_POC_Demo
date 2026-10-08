export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-volt-400/15 text-volt-600 ring-volt-400/40 dark:text-volt-300",
    scheduled: "bg-sky-400/15 text-sky-600 ring-sky-400/40 dark:text-sky-300",
    completed: "bg-emerald-400/15 text-emerald-600 ring-emerald-400/40 dark:text-emerald-300",
    cancelled: "bg-red-400/15 text-red-600 ring-red-400/40 dark:text-red-300",
    "follow-up": "bg-amber-400/15 text-amber-600 ring-amber-400/40 dark:text-amber-300",
  };
  const cls = map[status] ?? "bg-ink-950/5 text-sage-500 ring-ink-950/10 dark:bg-white/5 dark:text-sage-300 dark:ring-white/10";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${cls}`}>
      {status}
    </span>
  );
}
