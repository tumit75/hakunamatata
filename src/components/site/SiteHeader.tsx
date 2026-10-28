"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useResort } from "@/components/ResortProvider";
import { useActiveSection, useScrollY } from "@/components/ui/Motion";
import { RESORT_PHONE, whatsappLink, type Currency } from "@/data/resortStorage";

const NAV = [
  { href: "#stay", label: "Cottages" },
  { href: "#experiences", label: "Experiences" },
  { href: "#events", label: "Weddings & Retreats" },
  { href: "#dining", label: "Dining" },
  { href: "#activities", label: "Activities" },
  { href: "#location", label: "Getting here" },
];

const SECTION_IDS = NAV.map((n) => n.href.slice(1));
const CURRENCIES: Currency[] = ["USD", "UGX"];

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className="group flex flex-col leading-none" aria-label="Hakuna Matata FunCity, back to top">
      <span
        className={`text-[0.6rem] font-semibold uppercase tracking-[0.28em] transition-colors duration-300 ${
          light ? "text-ember-soft" : "text-ember"
        }`}
      >
        FunCity
      </span>
      <span
        className={`display mt-0.5 whitespace-nowrap text-[1.25rem] transition-colors duration-300 sm:text-[1.35rem] ${light ? "text-white" : "text-ink"}`}
      >
        Hakuna Matata
      </span>
    </a>
  );
}

/** Currency switch that reads well both over the hero photo and on white. */
function CurrencyToggle({
  value,
  onChange,
  light,
  className = "",
}: {
  value: Currency;
  onChange: (c: Currency) => void;
  light: boolean;
  /** Include the display class here (e.g. "inline-flex" or "hidden sm:inline-flex"). */
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Currency"
      className={`rounded-[10px] border p-0.5 transition-colors duration-300 ${
        light ? "border-white/30 bg-white/10 backdrop-blur-sm" : "border-hairline-strong bg-linen"
      } ${className}`}
    >
      {CURRENCIES.map((c) => {
        const active = c === value;
        return (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(c)}
            className={`num min-h-8 rounded-[8px] px-2.5 text-xs font-semibold transition duration-150 ${
              active
                ? light
                  ? "bg-white text-forest-deep shadow-sm"
                  : "bg-forest text-white shadow-sm"
                : light
                  ? "text-white/80 hover:text-white"
                  : "text-ink-soft hover:text-ink"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

function scrollToHash(href: string) {
  const el = document.querySelector(href);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", href);
}

export function SiteHeader() {
  const { currency, setCurrency, openAdmin, openBooking } = useResort();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useScrollY();
  const active = useActiveSection(SECTION_IDS);
  const barRef = useRef<HTMLSpanElement | null>(null);

  const solid = scrollY > 40 || menuOpen;
  const light = !solid;

  // Scroll progress bar: written straight to the DOM, no re-renders.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // Mobile menu: Escape closes, body scroll locked, auto-close on desktop widths.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => {
      if (mq.matches) setMenuOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [menuOpen]);

  function onMobileNav(e: MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setMenuOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(href)));
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* Background layers cross-fade between "over the photo" and "solid" */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-linear-to-b from-black/45 via-black/15 to-transparent transition-opacity duration-300 ${
          light ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className={`absolute inset-0 border-b border-hairline bg-canvas/88 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)] backdrop-blur-md transition-opacity duration-300 ${
          solid ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`container-x relative flex items-center justify-between gap-3 transition-[height] duration-300 ${
          solid ? "h-[64px]" : "h-[68px] lg:h-[80px]"
        }`}
      >
        <Wordmark light={light} />

        <nav className="hidden items-center lg:flex" aria-label="Main">
          {NAV.map((n) => {
            const isActive = active === n.href.slice(1);
            return (
              <a
                key={n.href}
                href={n.href}
                aria-current={isActive ? "true" : undefined}
                className={`link-grow mx-2.5 py-1 text-sm font-medium transition-colors duration-200 xl:mx-3.5 ${
                  light
                    ? isActive
                      ? "text-white"
                      : "text-white/80 hover:text-white"
                    : isActive
                      ? "text-forest"
                      : "text-ink-soft hover:text-ink"
                }`}
              >
                {n.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <CurrencyToggle value={currency} onChange={setCurrency} light={light} className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={openAdmin}
            className={`btn btn-sm hidden lg:inline-flex ${light ? "text-white hover:bg-white/10" : "btn-ghost"}`}
          >
            <LockIcon />
            Staff
          </button>
          <button
            type="button"
            onClick={() => openBooking()}
            className={`btn btn-sm min-h-10 ${light ? "btn-ember" : "btn-primary"}`}
          >
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">Book a stay</span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition lg:hidden ${
              light ? "text-white hover:bg-white/10" : "text-ink hover:bg-stone"
            }`}
          >
            <span className="relative block h-3.5 w-5" aria-hidden>
              <span
                className={`absolute left-0 h-[1.8px] w-5 rounded-full bg-current transition-all duration-200 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-[1.8px] w-5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-150 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.8px] w-5 rounded-full bg-current transition-all duration-200 ${
                  menuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Scroll progress */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 block h-[2px] overflow-hidden">
        <span
          ref={barRef}
          className="block h-full w-full origin-left bg-linear-to-r from-forest via-forest to-ember"
          style={{ transform: "scaleX(0)" }}
        />
      </span>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[64px] z-40 flex animate-fade-in flex-col overflow-y-auto bg-canvas lg:hidden"
        >
          <nav className="container-x flex flex-1 flex-col pt-4" aria-label="Mobile">
            {NAV.map((n, i) => {
              const isActive = active === n.href.slice(1);
              return (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={(e) => onMobileNav(e, n.href)}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex items-center justify-between gap-4 border-b border-hairline py-4"
                  style={{ animation: `rise-in 420ms cubic-bezier(0.2,0.7,0.2,1) ${60 + i * 45}ms both` }}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="num text-xs text-ink-mute">0{i + 1}</span>
                    <span className={`display text-[1.75rem] ${isActive ? "text-forest" : "text-ink"}`}>{n.label}</span>
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-ink-mute transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              );
            })}
          </nav>

          <div
            className="container-x mt-6 space-y-4 border-t border-hairline bg-linen py-6"
            style={{ animation: `rise-in 420ms cubic-bezier(0.2,0.7,0.2,1) ${60 + NAV.length * 45}ms both` }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink-soft">Show prices in</span>
              <CurrencyToggle value={currency} onChange={setCurrency} light={false} className="inline-flex" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openAdmin();
                }}
                className="btn btn-secondary min-h-11"
              >
                <LockIcon />
                Staff portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openBooking();
                }}
                className="btn btn-primary min-h-11"
              >
                Book a stay
              </button>
            </div>
            <p className="text-center text-sm text-ink-mute">
              <a href={`tel:${RESORT_PHONE.replace(/\s/g, "")}`} className="num hover:text-ink">
                {RESORT_PHONE}
              </a>
              <span className="mx-1.5" aria-hidden>
                ·
              </span>
              <a
                href={whatsappLink("Hello Hakuna Matata FunCity, I have a question.")}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                WhatsApp us
              </a>
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
