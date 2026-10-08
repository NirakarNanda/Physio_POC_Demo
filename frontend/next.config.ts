import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desktop builds (see ../desktop) use `output: "export"` + empty
  // NEXT_PUBLIC_API_URL so the app is a static bundle served by the local
  // backend on one origin. Regular web dev (`next dev` / `next build`
  // without those flags) is unaffected.
  ...(process.env.MOVEWELL_STATIC_EXPORT === "1"
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
