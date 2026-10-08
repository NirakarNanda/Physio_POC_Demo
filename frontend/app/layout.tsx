import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MoveWell Physiotherapy Studio — Move better. Live pain-free.",
  description:
    "Evidence-based physiotherapy, sports rehab and post-surgical recovery. Book your movement assessment at MoveWell Physiotherapy Studio.",
};

/**
 * Blocking inline script: reads the persisted theme before first paint.
 * Light is the default — .dark is only added when the user explicitly chose
 * dark. suppressHydrationWarning covers the attribute diff.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('movewell-theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-cream-100 text-ink-950 dark:bg-ink-950 dark:text-cream-50">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
