"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

const ToastCtx = createContext<(message: string, kind?: ToastKind) => void>(
  () => {},
);

export const useToast = () => useContext(ToastCtx);

const KIND_STYLES: Record<ToastKind, string> = {
  success: "border-ink/20 bg-ink text-ivory dark:border-white/15 dark:bg-mint-300 dark:text-abyss-950",
  error: "border-red-900/20 bg-red-800 text-white dark:border-red-400/25 dark:bg-red-700",
  info: "glass-deep text-ink dark:text-[#edf7f5]",
};

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3600);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-5">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-fade-up pointer-events-auto w-full rounded-2xl border px-5 py-3.5 text-sm font-semibold shadow-lift ${KIND_STYLES[t.kind]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
