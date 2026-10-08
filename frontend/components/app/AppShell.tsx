"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { useTheme } from "@/components/theme/ThemeProvider";
import { api, type User } from "@/lib/api";

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "M4 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 4h6M14 8h6M14 12v8M4 16h6" },
  { label: "Patients", href: "/patients", icon: "M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1M9 10a4 4 0 100-8 4 4 0 000 8zM22 19v-1a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { dark, toggle } = useTheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => router.replace("/login"));
  }, [router]);

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      router.replace("/login");
    }
  };

  return (
    <div className="flex min-h-screen bg-cream-50 text-ink-950 dark:bg-ink-950 dark:text-cream-50">
      {/* sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-950/8 bg-white/70 px-5 py-6 backdrop-blur-xl lg:flex dark:border-white/8 dark:bg-ink-900/60">
        <Link href="/" aria-label="Back to website">
          <Logo />
        </Link>
        <nav className="mt-10 flex flex-col gap-1.5">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-volt-400 text-ink-950"
                    : "text-sage-500 hover:bg-ink-950/5 hover:text-ink-950 dark:text-sage-300 dark:hover:bg-white/5 dark:hover:text-cream-50"
                }`}
              >
                <NavIcon d={n.icon} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sage-500 transition-colors hover:bg-ink-950/5 dark:text-sage-300 dark:hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 8v4l2.5 2.5" />
            </svg>
            View website
          </Link>
          <div className="rounded-2xl border border-ink-950/8 bg-cream-100/60 p-4 dark:border-white/8 dark:bg-white/5">
            <p className="text-xs text-sage-500">Signed in as</p>
            <p className="mt-0.5 truncate text-sm font-semibold">{user?.name ?? "…"}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={toggle}
                className="flex-1 rounded-lg border border-ink-950/10 px-3 py-2 text-xs font-medium transition-colors hover:border-volt-500 dark:border-white/10"
              >
                {dark ? "Light mode" : "Dark mode"}
              </button>
              <button
                onClick={logout}
                className="flex-1 rounded-lg bg-ink-950 px-3 py-2 text-xs font-semibold text-cream-50 transition-transform hover:scale-[1.03] dark:bg-volt-400 dark:text-ink-950"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile topbar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-ink-950/8 bg-cream-50/85 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-white/8 dark:bg-ink-950/85">
          <Link href="/dashboard">
            <Logo compact />
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    active ? "bg-volt-400 text-ink-950" : "text-sage-500 dark:text-sage-300"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-sage-500 dark:text-sage-300"
            >
              Log out
            </button>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
