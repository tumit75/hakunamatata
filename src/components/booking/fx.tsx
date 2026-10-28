"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useResort } from "@/components/ResortProvider";

/* Keyframes used by the cottage + booking UI. Rendered once per page (React dedupes by href). */
const FX_CSS = `
@keyframes hm-slide{from{opacity:0;transform:translate3d(var(--hm-dx,24px),0,0)}to{opacity:1;transform:none}}
@keyframes hm-draw{to{stroke-dashoffset:0}}
@keyframes hm-burst{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}18%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) translate(var(--bx),var(--by)) rotate(var(--br)) scale(1)}}
@keyframes hm-breathe{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes hm-pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
`;

export function FxStyles() {
  return (
    <style href="hm-booking-fx" precedence="medium">
      {FX_CSS}
    </style>
  );
}

/** Direction-aware slide/fade for keyed containers (steps, calendar months). */
export function slideStyle(dir: 1 | -1, duration = 200): CSSProperties {
  return {
    "--hm-dx": `${dir * 24}px`,
    animation: `hm-slide ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1) both`,
  } as CSSProperties;
}

/** Smoothly tweens a number toward its latest value. */
export function useTween(value: number, duration = 480): number {
  const [shown, setShown] = useState(value);
  const current = useRef(value);

  useEffect(() => {
    const from = current.current;
    if (from === value) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = reduced ? 1 : Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (value - from) * eased;
      current.current = v;
      setShown(v);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return shown;
}

/** A price in the active currency that counts to its new value when it changes. */
export function AnimatedMoney({ usd, className = "" }: { usd: number; className?: string }) {
  const { money } = useResort();
  const v = useTween(usd);
  return (
    <span className={`num ${className}`}>
      <span aria-hidden>{money(Math.round(v))}</span>
      <span className="sr-only">{money(usd)}</span>
    </span>
  );
}

/** Small status dot with a soft pulse ring. */
export function PulseDot({ tone = "forest" }: { tone?: "forest" | "ember" }) {
  return (
    <span
      className={`pulse-ring relative isolate inline-block h-2 w-2 shrink-0 rounded-full ${
        tone === "forest" ? "bg-forest" : "bg-ember"
      }`}
      aria-hidden
    />
  );
}

/** Circle + tick that draw themselves. */
export function DrawCheck({ className = "h-20 w-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 52" className={className} fill="none" aria-hidden>
      <circle cx="26" cy="26" r="24" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" />
      <circle
        cx="26"
        cy="26"
        r="24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="151"
        strokeDashoffset="151"
        style={{
          animation: "hm-draw 700ms cubic-bezier(0.65, 0, 0.35, 1) 120ms forwards",
          transform: "rotate(-90deg)",
          transformOrigin: "center",
        }}
      />
      <path
        d="M15 27l7.5 7.5L37.5 19"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="34"
        strokeDashoffset="34"
        style={{ animation: "hm-draw 420ms cubic-bezier(0.65, 0, 0.35, 1) 760ms forwards" }}
      />
    </svg>
  );
}

// Deterministic particle layout (no randomness): leaves and dots fanning out in a ring.
const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + (i % 2 ? 0.18 : -0.12);
  const dist = 64 + (i % 3) * 20;
  return {
    x: Math.round(Math.cos(angle) * dist),
    y: Math.round(Math.sin(angle) * dist),
    r: (i * 47) % 360,
    kind: i % 3,
    delay: (i % 4) * 45,
  };
});

/** A gentle burst of leaves and dots from the centre of its (relative) parent. */
export function Burst() {
  return (
    <span className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`absolute left-0 top-0 block ${
            p.kind === 0
              ? "h-3 w-1.5 rounded-[100%_0] bg-forest"
              : p.kind === 1
                ? "h-2 w-2 rounded-full bg-ember"
                : "h-3.5 w-2 rounded-[100%_0] bg-forest/45"
          }`}
          style={
            {
              "--bx": `${p.x}px`,
              "--by": `${p.y}px`,
              "--br": `${p.r}deg`,
              animation: `hm-burst 1000ms cubic-bezier(0.2, 0.7, 0.3, 1) ${720 + p.delay}ms both`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
