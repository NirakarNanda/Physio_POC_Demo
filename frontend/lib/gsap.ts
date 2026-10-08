"use client";

/**
 * Central GSAP setup: registers ScrollTrigger (and the useGSAP hook) exactly
 * once. Import { gsap, ScrollTrigger, useGSAP } from here anywhere in the app.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
