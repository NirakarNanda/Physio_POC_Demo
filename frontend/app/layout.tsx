import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import SettingsProvider from "@/lib/settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoveWell Physiotherapy Studio — Modern Physio Care",
  description:
    "MoveWell Physiotherapy Studio: expert physiotherapy, sports rehab and pain relief. Move better, live stronger.",
};

/**
 * Blocking inline script: reads the persisted theme before first paint and
 * applies .dark to <html> so there is no light-flash on reload. Dark is the
 * default — the class is only skipped when the user explicitly chose light.
 * The class is applied imperatively (React never renders it), and
 * suppressHydrationWarning covers the attribute diff at hydration.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('movewell-theme');if(t!=='light'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-white text-slate-900 dark:bg-abyss-950 dark:text-mint-50">
        <ThemeProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
