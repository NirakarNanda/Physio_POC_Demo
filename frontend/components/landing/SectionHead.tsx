import Reveal from "./Reveal";

export default function SectionHead({
  eyebrow,
  title,
  copy,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Reveal className={`flex flex-col gap-4 ${alignCls}`}>
      <p className="font-mono text-[11px] font-semibold tracking-[0.28em] text-volt-600 dark:text-volt-300">
        {eyebrow}
      </p>
      <h2 className="font-display max-w-3xl text-4xl font-medium tracking-tight text-ink-950 dark:text-cream-50 sm:text-5xl">
        {title}
      </h2>
      {copy && <p className="max-w-2xl text-lg leading-relaxed text-sage-500 dark:text-sage-300">{copy}</p>}
    </Reveal>
  );
}
