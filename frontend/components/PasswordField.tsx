"use client";

import { useState } from "react";

export const fieldLabelCls =
  "mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/50 dark:text-white/45";

export const fieldInputCls =
  "w-full rounded-xl border border-white/60 bg-white/55 px-4 py-3 text-[15px] text-ink backdrop-blur-md placeholder:text-ink/35 outline-none transition-all focus:border-ink/40 focus:bg-white/85 focus:ring-4 focus:ring-ink/5 dark:border-white/10 dark:bg-white/[0.06] dark:text-[#edf7f5] dark:placeholder:text-white/30 dark:focus:border-white/40 dark:focus:bg-white/[0.09] dark:focus:ring-white/5";

const eyeIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const eyeOffIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

/** Password input with a show/hide toggle — the "make password visible" option. */
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required = true,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={fieldLabelCls}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${fieldInputCls} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={show}
          title={show ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
        >
          {show ? eyeOffIcon : eyeIcon}
        </button>
      </div>
    </div>
  );
}
