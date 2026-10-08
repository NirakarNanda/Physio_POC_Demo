"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeCtx {
  dark: boolean;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ dark: true, toggle: () => {} });

export const useTheme = () => useContext(Ctx);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      setDark(localStorage.getItem("movewell-theme") === "dark");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("movewell-theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  return (
    <Ctx.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </Ctx.Provider>
  );
}
