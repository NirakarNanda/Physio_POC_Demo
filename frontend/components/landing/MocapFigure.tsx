"use client";

import { useEffect, useRef } from "react";

const VOLT = "#c8f542";
const VOLT_SOFT = "rgba(200, 245, 66, 0.55)";

interface Pt {
  x: number;
  y: number;
}

/**
 * MocapFigure — a motion-capture style runner rendered as an SVG rig.
 * Joint angles are computed procedurally every frame (walk/run cycle via
 * sine-phase kinematics + forward kinematics), with foot-trail ghosts,
 * ground-strike pulse rings and live HUD telemetry (knee/hip angles).
 * No assets, no video — pure math + SVG, updated imperatively for 60fps.
 */
export default function MocapFigure({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodes = useRef<Record<string, SVGElement | null>>({});

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const N = nodes.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- rig geometry ----
    const hipX = 196;
    const baseHipY = 166;
    const L1 = 56; // thigh
    const L2 = 54; // shin
    const TORSO = 60;
    const HEAD_R = 11;
    const UA = 38; // upper arm
    const FA = 34; // forearm
    const GROUND_Y = 284;

    const setLine = (id: string, a: Pt, b: Pt) => {
      const el = N[id] as unknown as SVGLineElement | null;
      if (!el) return;
      el.setAttribute("x1", a.x.toFixed(1));
      el.setAttribute("y1", a.y.toFixed(1));
      el.setAttribute("x2", b.x.toFixed(1));
      el.setAttribute("y2", b.y.toFixed(1));
    };
    const setDot = (id: string, p: Pt) => {
      const el = N[id] as unknown as SVGCircleElement | null;
      if (!el) return;
      el.setAttribute("cx", p.x.toFixed(1));
      el.setAttribute("cy", p.y.toFixed(1));
    };
    const setText = (id: string, x: number, y: number, s: string) => {
      const el = N[id] as unknown as SVGTextElement | null;
      if (!el) return;
      el.setAttribute("x", x.toFixed(1));
      el.setAttribute("y", y.toFixed(1));
      el.textContent = s;
    };

    interface Leg {
      th: number;
      kn: number;
      knee: Pt;
      ankle: Pt;
      foot: Pt;
    }
    interface Arm {
      elbow: Pt;
      wrist: Pt;
    }

    function pose(p: number): { hip: Pt; shoulder: Pt; head: Pt; legs: Leg[]; arms: Arm[] } {
      const bob = 7 * Math.abs(Math.sin(p));
      const hip: Pt = { x: hipX, y: baseHipY - bob };
      const lean = 0.14 + 0.03 * Math.sin(2 * p);
      const shoulder: Pt = {
        x: hip.x + TORSO * Math.sin(lean),
        y: hip.y - TORSO * Math.cos(lean),
      };
      const head: Pt = { x: shoulder.x + 5 * Math.sin(lean), y: shoulder.y - HEAD_R - 7 };

      const legs: Leg[] = [0, Math.PI].map((off) => {
        const th = 0.62 * Math.sin(p + off);
        const kn = 1.85 * Math.pow(Math.max(0, Math.cos(p + off)), 1.35);
        const knee: Pt = { x: hip.x + L1 * Math.sin(th), y: hip.y + L1 * Math.cos(th) };
        const sh = th - kn;
        const ankle: Pt = { x: knee.x + L2 * Math.sin(sh), y: knee.y + L2 * Math.cos(sh) };
        const foot: Pt = { x: ankle.x + 15 * Math.cos(sh * 0.35), y: Math.min(ankle.y + 4, GROUND_Y) };
        return { th, kn, knee, ankle, foot };
      });

      const arms: Arm[] = [0, Math.PI].map((off) => {
        const sa = -0.55 * Math.sin(p + off);
        const eb = 1.25 + 0.35 * Math.sin(p + off + 0.8);
        const elbow: Pt = {
          x: shoulder.x + UA * Math.sin(sa),
          y: shoulder.y + UA * Math.cos(sa),
        };
        const fa = sa - eb;
        const wrist: Pt = {
          x: elbow.x + FA * Math.sin(fa),
          y: elbow.y + FA * Math.cos(fa),
        };
        return { elbow, wrist };
      });

      return { hip, shoulder, head, legs, arms };
    }

    function draw(p: number) {
      const { hip, shoulder, head, legs, arms } = pose(p);

      setLine("torso", hip, shoulder);
      setDot("head", head);
      setDot("hip", hip);
      setDot("shoulder", shoulder);

      legs.forEach((l, i) => {
        setLine(`thigh${i}`, hip, l.knee);
        setLine(`shin${i}`, l.knee, l.ankle);
        setLine(`foot${i}`, l.ankle, l.foot);
        setDot(`knee${i}`, l.knee);
        setDot(`ankle${i}`, l.ankle);
        // contact shadow
        const sh = N[`shadow${i}`] as unknown as SVGEllipseElement | null;
        if (sh) {
          const h = Math.max(0, GROUND_Y - l.ankle.y);
          sh.setAttribute("cx", l.ankle.x.toFixed(1));
          sh.setAttribute("rx", (26 - Math.min(14, h * 0.35)).toFixed(1));
          sh.setAttribute("opacity", (0.4 - Math.min(0.3, h * 0.008)).toFixed(2));
        }
      });

      arms.forEach((a, i) => {
        setLine(`ua${i}`, shoulder, a.elbow);
        setLine(`fa${i}`, a.elbow, a.wrist);
        setDot(`elbow${i}`, a.elbow);
        setDot(`wrist${i}`, a.wrist);
      });

      // HUD telemetry — live joint angles of the lead leg
      const lead = legs[0];
      const kneeDeg = Math.round((lead.kn * 180) / Math.PI);
      const hipDeg = Math.round((Math.abs(lead.th) * 180) / Math.PI);
      setText("kneeLabel", lead.knee.x + 26, lead.knee.y - 14, `KNEE ${kneeDeg}°`);
      setLine("kneeLead", lead.knee, { x: lead.knee.x + 22, y: lead.knee.y - 10 });
      setText("hipLabel", hip.x - 108, hip.y - 26, `HIP ${hipDeg}°`);
      setLine("hipLead", hip, { x: hip.x - 20, y: hip.y - 22 });

      return legs;
    }

    if (reduced) {
      draw(0.7);
      return;
    }

    // ---- animation loop ----
    const ringsG = N["rings"] as unknown as SVGGElement | null;
    const rings: { el: SVGCircleElement; age: number }[] = [];
    const spawnRing = (x: number, y: number) => {
      if (!ringsG || rings.length > 8) return;
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", x.toFixed(1));
      c.setAttribute("cy", y.toFixed(1));
      c.setAttribute("r", "6");
      c.setAttribute("fill", "none");
      c.setAttribute("stroke", VOLT);
      c.setAttribute("stroke-width", "1.5");
      ringsG.appendChild(c);
      rings.push({ el: c, age: 0 });
    };

    const trails: Pt[][] = [[], []];
    const TRAIL_N = 12;
    const prevAnkleY = [GROUND_Y, GROUND_Y];

    let phase = 0.7;
    const SPEED = 6.2; // rad/s → ≈ 119 steps/min
    let last = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      phase += SPEED * dt;

      const legs = draw(phase);

      legs.forEach((l, i) => {
        // foot-strike: ankle vertical velocity flips + → −
        const vy = l.ankle.y - prevAnkleY[i];
        if (prevAnkleY[i] > 0 && vy < -0.15 && l.ankle.y > GROUND_Y - 26) {
          spawnRing(l.ankle.x, GROUND_Y);
        }
        prevAnkleY[i] = l.ankle.y;

        // trail ghosts
        const tr = trails[i];
        tr.push({ x: l.ankle.x, y: l.ankle.y });
        if (tr.length > TRAIL_N) tr.shift();
        tr.forEach((pt, j) => {
          const el = N[`trail${i}_${j}`] as unknown as SVGCircleElement | null;
          if (!el) return;
          el.setAttribute("cx", pt.x.toFixed(1));
          el.setAttribute("cy", pt.y.toFixed(1));
          el.setAttribute("opacity", ((j / TRAIL_N) * 0.35).toFixed(2));
        });
      });

      // age strike rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.age += dt;
        const k = r.age / 0.9;
        if (k >= 1) {
          r.el.remove();
          rings.splice(i, 1);
        } else {
          r.el.setAttribute("r", (6 + k * 34).toFixed(1));
          r.el.setAttribute("opacity", (0.55 * (1 - k)).toFixed(2));
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const ref = (id: string) => (el: SVGElement | null) => {
    nodes.current[id] = el;
  };

  const bone = {
    stroke: VOLT,
    strokeWidth: 5,
    strokeLinecap: "round" as const,
    opacity: 0.92,
  };
  const jointOuter = { fill: VOLT, opacity: 0.22 };
  const jointInner = { fill: "#eefbcf" };

  const joint = (id: string, r = 4) => (
    <g key={id}>
      <circle ref={ref(`${id}o`)} r={r + 4} {...jointOuter} />
      <circle ref={ref(id)} r={r} {...jointInner} />
    </g>
  );

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 340"
      className={className}
      role="img"
      aria-label="Animated motion-capture runner showing live gait analysis"
    >
      {/* ground */}
      <line x1="20" y1="284" x2="380" y2="284" stroke={VOLT_SOFT} strokeWidth="1" strokeDasharray="2 6" />
      <ellipse ref={ref("shadow0")} cx="196" cy="284" rx="26" ry="5" fill={VOLT} opacity="0.35" />
      <ellipse ref={ref("shadow1")} cx="196" cy="284" rx="26" ry="5" fill={VOLT} opacity="0.35" />

      {/* foot trails */}
      <g>
        {Array.from({ length: 12 }).map((_, j) => (
          <circle key={`t0${j}`} ref={ref(`trail0_${j}`)} r="3" fill={VOLT} opacity="0" />
        ))}
        {Array.from({ length: 12 }).map((_, j) => (
          <circle key={`t1${j}`} ref={ref(`trail1_${j}`)} r="3" fill={VOLT} opacity="0" />
        ))}
      </g>
      <g ref={ref("rings")} />

      {/* rig */}
      <line ref={ref("torso")} {...bone} />
      <line ref={ref("thigh1")} {...bone} opacity="0.55" />
      <line ref={ref("shin1")} {...bone} opacity="0.55" />
      <line ref={ref("foot1")} {...bone} opacity="0.55" strokeWidth={4} />
      <line ref={ref("thigh0")} {...bone} />
      <line ref={ref("shin0")} {...bone} />
      <line ref={ref("foot0")} {...bone} strokeWidth={4} />
      <line ref={ref("ua1")} {...bone} opacity="0.55" strokeWidth={4} />
      <line ref={ref("fa1")} {...bone} opacity="0.55" strokeWidth={4} />
      <line ref={ref("ua0")} {...bone} strokeWidth={4} />
      <line ref={ref("fa0")} {...bone} strokeWidth={4} />

      {joint("hip", 5)}
      {joint("shoulder", 4.5)}
      {joint("knee0", 4.5)}
      {joint("ankle0", 4)}
      {joint("knee1", 4.5)}
      {joint("ankle1", 4)}
      {joint("elbow0", 4)}
      {joint("wrist0", 3.5)}
      {joint("elbow1", 4)}
      {joint("wrist1", 3.5)}
      <g>
        <circle ref={ref("heado")} r={HEAD_R + 5} {...jointOuter} />
        <circle ref={ref("head")} r={HEAD_R} {...jointInner} />
      </g>

      {/* HUD telemetry */}
      <line ref={ref("kneeLead")} stroke="#8ba198" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
      <text
        ref={ref("kneeLabel")}
        fill="#8ba198"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        letterSpacing="1.5"
      >
        KNEE 0°
      </text>
      <line ref={ref("hipLead")} stroke="#8ba198" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
      <text
        ref={ref("hipLabel")}
        fill="#8ba198"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        letterSpacing="1.5"
      >
        HIP 0°
      </text>
      <text
        x="20"
        y="24"
        fill="#8ba198"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        letterSpacing="2"
        opacity="0.9"
      >
        CADENCE 119 SPM · DEMO FEED
      </text>
    </svg>
  );
}

const HEAD_R = 11;
