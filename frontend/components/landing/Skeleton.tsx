"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const BONE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * Stylized front-view human skeleton, drawn as elegant line-art.
 * Every bone carries data-draw (hero draw-in) and lives in a data-bone
 * group (skull, neck, spine, ribs, shoulder, arm, hip, leg, knee, ankle)
 * so the landing page can spotlight the bones each practice treats.
 */
export default function Skeleton({
  active = [],
  className = "",
}: {
  active?: string[];
  className?: string;
}) {
  const rootRef = useRef<SVGSVGElement>(null);
  const drawn = useRef(false);

  // Hero draw-in: each bone strokes itself into existence, staggered.
  useEffect(() => {
    if (drawn.current) return;
    drawn.current = true;
    const svg = rootRef.current;
    if (!svg) return;
    const els = Array.from(
      svg.querySelectorAll<SVGGeometryElement>("[data-draw]"),
    );
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    els.forEach((el) => {
      try {
        const len = el.getTotalLength();
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = reduced ? "0" : `${len}`;
      } catch {
        /* ignore */
      }
    });
    if (reduced) return;
    gsap.to(els, {
      strokeDashoffset: 0,
      duration: 1.15,
      stagger: 0.038,
      ease: "power2.inOut",
      delay: 0.35,
    });
    // Gentle idle float once drawn.
    gsap.to(svg, {
      y: -9,
      duration: 5.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: 3.2,
    });
  }, []);

  // Spotlight: dim the bones that aren't being treated right now.
  useEffect(() => {
    const svg = rootRef.current;
    if (!svg) return;
    const all = active.includes("all");
    svg.classList.toggle("has-active", active.length > 0);
    svg.querySelectorAll("[data-bone]").forEach((g) => {
      const name = g.getAttribute("data-bone") || "";
      g.classList.toggle("is-active", all || active.includes(name));
    });
  }, [active]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 400 920"
      className={`skel ${className}`}
      role="img"
      aria-label="Stylized human skeleton"
      {...BONE}
    >
      {/* ── skull ── */}
      <g data-bone="skull">
        <path
          data-draw
          d="M200 26 C174 26 160 48 160 74 C160 94 170 106 182 110 L182 120 L218 120 L218 110 C230 106 240 94 240 74 C240 48 226 26 200 26 Z"
        />
        <ellipse data-draw cx="184" cy="72" rx="9" ry="11" />
        <ellipse data-draw cx="216" cy="72" rx="9" ry="11" />
        <path data-draw d="M200 88 L194 100 L206 100 Z" />
        <path data-draw d="M182 120 L218 120 L212 144 Q200 150 188 144 Z" />
        <g strokeWidth={4}>
          <path data-draw d="M192 122 L192 140" />
          <path data-draw d="M200 122 L200 142" />
          <path data-draw d="M208 122 L208 140" />
        </g>
      </g>

      {/* ── neck (cervical spine) ── */}
      <g data-bone="neck">
        <rect data-draw x="192" y="152" width="16" height="8" rx="4" />
        <rect data-draw x="192" y="163" width="16" height="8" rx="4" />
        <rect data-draw x="192" y="174" width="16" height="8" rx="4" />
      </g>

      {/* ── spine (thoracic + lumbar) ── */}
      <g data-bone="spine">
        <rect data-draw x="190" y="190" width="20" height="13" rx="5" />
        <rect data-draw x="190" y="207" width="20" height="13" rx="5" />
        <rect data-draw x="190" y="224" width="20" height="13" rx="5" />
        <rect data-draw x="190" y="241" width="20" height="13" rx="5" />
        <rect data-draw x="190" y="258" width="20" height="13" rx="5" />
        <rect data-draw x="187" y="277" width="26" height="15" rx="6" />
        <rect data-draw x="187" y="296" width="26" height="15" rx="6" />
        <rect data-draw x="187" y="315" width="26" height="15" rx="6" />
      </g>

      {/* ── ribs ── */}
      <g data-bone="ribs">
        <path data-draw d="M200 192 L200 272" />
        <path data-draw d="M198 200 C176 200 158 206 148 220" />
        <path data-draw d="M202 200 C224 200 242 206 252 220" />
        <path data-draw d="M198 218 C174 218 154 226 144 242" />
        <path data-draw d="M202 218 C226 218 246 226 256 242" />
        <path data-draw d="M198 236 C172 236 152 246 142 264" />
        <path data-draw d="M202 236 C228 236 248 246 258 264" />
        <path data-draw d="M198 254 C172 254 154 266 146 284" />
        <path data-draw d="M202 254 C228 254 246 266 254 284" />
      </g>

      {/* ── shoulder girdle ── */}
      <g data-bone="shoulder">
        <path data-draw d="M198 180 C178 174 160 172 144 178" />
        <path data-draw d="M202 180 C222 174 240 172 256 178" />
        <circle data-draw className="joint" cx="140" cy="184" r="11" />
        <circle data-draw className="joint" cx="260" cy="184" r="11" />
        <path data-draw d="M150 196 L138 224" strokeWidth={5} />
        <path data-draw d="M250 196 L262 224" strokeWidth={5} />
      </g>

      {/* ── arms ── */}
      <g data-bone="arm">
        <path data-draw d="M138 195 C132 232 128 266 126 300" />
        <path data-draw d="M262 195 C268 232 272 266 274 300" />
        <circle data-draw className="joint" cx="125" cy="310" r="9" />
        <circle data-draw className="joint" cx="275" cy="310" r="9" />
        <path data-draw d="M124 319 C122 355 121 390 120 424" />
        <path data-draw d="M276 319 C278 355 279 390 280 424" />
        <circle data-draw className="joint" cx="120" cy="433" r="7" />
        <circle data-draw className="joint" cx="280" cy="433" r="7" />
        <path data-draw d="M115 441 C112 456 112 470 117 483" strokeWidth={5} />
        <path data-draw d="M125 441 C128 456 128 470 123 483" strokeWidth={5} />
        <path data-draw d="M285 441 C288 456 288 470 283 483" strokeWidth={5} />
        <path data-draw d="M275 441 C272 456 272 470 277 483" strokeWidth={5} />
      </g>

      {/* ── pelvis + hips ── */}
      <g data-bone="hip">
        <path data-draw d="M200 332 L189 356 L211 356 Z" />
        <path data-draw d="M198 344 C174 344 152 354 142 374 C136 386 138 396 146 400" />
        <path data-draw d="M202 344 C226 344 248 354 258 374 C264 386 262 396 254 400" />
        <circle data-draw className="joint" cx="148" cy="410" r="11" />
        <circle data-draw className="joint" cx="252" cy="410" r="11" />
      </g>

      {/* ── legs ── */}
      <g data-bone="leg">
        <path data-draw d="M148 421 C150 462 152 505 154 546" />
        <path data-draw d="M252 421 C250 462 248 505 246 546" />
        <path data-draw d="M154 588 C155 626 156 660 157 694" />
        <path data-draw d="M246 588 C245 626 244 660 243 694" />
      </g>

      {/* ── knees ── */}
      <g data-bone="knee">
        <circle data-draw className="joint" cx="154" cy="567" r="12" />
        <circle data-draw className="joint" cx="246" cy="567" r="12" />
      </g>

      {/* ── ankles + feet ── */}
      <g data-bone="ankle">
        <circle data-draw className="joint" cx="157" cy="703" r="8" />
        <circle data-draw className="joint" cx="243" cy="703" r="8" />
        <path data-draw d="M157 711 L157 728 L190 728" />
        <path data-draw d="M243 711 L243 728 L210 728" />
      </g>
    </svg>
  );
}
