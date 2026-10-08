"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ClinicSettings {
  /** Pre-filled fee (₹) when booking an appointment. */
  defaultFee: number;
}

const STORAGE_KEY = "movewell-settings";

const DEFAULTS: ClinicSettings = {
  defaultFee: 500,
};

interface SettingsState extends ClinicSettings {
  loaded: boolean;
  update: (patch: Partial<ClinicSettings>) => void;
}

const SettingsCtx = createContext<SettingsState>({
  ...DEFAULTS,
  loaded: false,
  update: () => {},
});

export const useSettings = () => useContext(SettingsCtx);

function readStored(): ClinicSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ClinicSettings>;
    return {
      defaultFee:
        typeof parsed.defaultFee === "number" &&
        Number.isFinite(parsed.defaultFee) &&
        parsed.defaultFee >= 0
          ? Math.round(parsed.defaultFee)
          : DEFAULTS.defaultFee,
    };
  } catch {
    return DEFAULTS;
  }
}

export default function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(readStored());
    setLoaded(true);
  }, []);

  const update = useCallback((patch: Partial<ClinicSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — settings just won't persist */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ ...settings, loaded, update }),
    [settings, loaded, update],
  );

  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}
