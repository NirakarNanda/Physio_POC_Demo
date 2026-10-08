import { Fraunces } from "next/font/google";

/**
 * Shared editorial serif used across the POC (landing, login, dashboard,
 * patients). Fraunces light with optical sizing — the "premium" voice of
 * the product.
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});
