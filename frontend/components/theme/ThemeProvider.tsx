"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";

const STORAGE_KEY = "movewell-theme";

interface ThemeState {
  /** The user's chosen mode. */
  mode: ThemeMode;
  /** The resolved theme actually applied ("system" resolves via the OS). */
  theme: EffectiveTheme;
  /** True only after the client has mounted and the stored theme applied. */
  mounted: boolean;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
}

const ThemeCtx = createContext<ThemeState>({
  mode: "dark",
  theme: "dark",
  mounted: false,
  toggle: () => {},
  setMode: () => {},
});

export const useTheme = () => useContext(ThemeCtx);

function systemTheme(): EffectiveTheme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "dark";
  }
}

function resolveMode(mode: ThemeMode): EffectiveTheme {
  return mode === "system" ? systemTheme() : mode;
}

function applyMode(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", resolveMode(mode) === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* storage unavailable — theme just won't persist */
  }
}

function readStoredMode(): ThemeMode {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    if (t === "dark" || t === "light" || t === "system") return t;
  } catch {
    /* ignore */
  }
  return "dark";
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mount-gated: first render is always dark on both server and client,
  // so SSR markup and hydration match (the blocking inline script in <head>
  // pre-applies .dark before first paint to avoid a flash). The stored
  // preference is applied in an effect after mount.
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = readStoredMode();
    setModeState(initial);
    applyMode(initial);
    setMounted(true);
  }, []);

  // Follow the OS while in system mode.
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyMode("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    applyMode(m);
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      // From system mode, toggling pins the opposite of what's showing.
      const next: ThemeMode =
        prev === "system"
          ? systemTheme() === "dark"
            ? "light"
            : "dark"
          : prev === "dark"
            ? "light"
            : "dark";
      applyMode(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ mode, theme: resolveMode(mode), mounted, toggle, setMode }),
    [mode, mounted, toggle, setMode],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
