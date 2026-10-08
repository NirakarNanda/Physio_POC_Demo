"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import { api } from "@/lib/api";
import { CLINIC } from "@/lib/clinic";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("doctor@movewell.physio");
  const [password, setPassword] = useState("demo1234");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-ink-950 text-cream-50 lg:grid-cols-2">
      {/* left: brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/doctor-portrait.jpg"
          alt={`${CLINIC.doctor} at ${CLINIC.fullName}`}
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-ink-950/10" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-8">
          <Logo />
          <Link href="/" className="text-sm font-medium text-cream-50/80 transition-colors hover:text-volt-300">
            ← Back to website
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="font-display text-4xl font-medium leading-tight">
            “A calm clinic,
            <br />
            a stronger body.”
          </p>
          <p className="mt-3 text-sm tracking-wide text-cream-50/70">
            {CLINIC.fullName} · staff sign-in
          </p>
        </div>
      </div>

      {/* right: the login card */}
      <div className="relative flex items-center justify-center px-6 py-12">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,245,66,0.08), transparent 70%)",
          }}
        />
        <div className="relative w-full max-w-md">
          <Link href="/" className="mb-8 inline-block lg:hidden">
            <Logo />
          </Link>
          <div className="glass rounded-3xl p-8 sm:p-10">
            <h1 className="font-display text-3xl font-medium">Welcome back, Doctor</h1>
            <p className="mt-2 text-sm text-sage-300">
              Sign in to manage patients, sessions and revenue.
            </p>
            <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-sage-300">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-cream-50 outline-none transition-colors focus:border-volt-400/60"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-sage-300">Password</span>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 pr-16 text-cream-50 outline-none transition-colors focus:border-volt-400/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sage-400 hover:text-volt-300"
                  >
                    {show ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </label>
              {error && (
                <p className="rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-400/30">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="mt-1 rounded-xl bg-volt-400 py-3.5 font-semibold text-ink-950 shadow-[0_0_36px_-8px_rgba(200,245,66,0.8)] transition-transform duration-300 hover:scale-[1.02] disabled:opacity-60"
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <p className="text-center text-xs text-sage-500">
                Demo credentials are pre-filled — just hit sign in.
              </p>
            </form>
          </div>
          <p className="mt-6 text-center text-xs text-sage-500">
            {CLINIC.fullName} · demo build
          </p>
        </div>
      </div>
    </div>
  );
}
