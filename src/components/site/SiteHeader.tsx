"use client";

import { useEffect, useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { Segmented } from "@/components/ui/Overlay";
import type { Currency } from "@/data/resortStorage";

const NAV = [
  { href: "#stay", label: "Cottages" },
  { href: "#experiences", label: "Experiences" },
  { href: "#events", label: "Weddings & Retreats" },
  { href: "#dining", label: "Dining" },
  { href: "#activities", label: "Activities" },
  { href: "#location", label: "Getting here" },
];

const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "UGX", label: "UGX" },
];

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className="group flex flex-col leading-none" aria-label="Hakuna Matata FunCity, back to top">
      <span className={`text-[0.6rem] font-semibold uppercase tracking-[0.28em] ${light ? "text-ember-soft" : "text-ember"}`}>
        FunCity
      </span>
      <span className={`display mt-0.5 text-[1.35rem] ${light ? "text-white" : "text-ink"}`}>Hakuna Matata</span>
    </a>
  );
}

export function SiteHeader() {
  const { currency, setCurrency, openAdmin, openBooking } = useResort();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/75">
      <div className="container-x flex h-[68px] items-center justify-between gap-4">
        <Wordmark />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-stone hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Segmented
            value={currency}
            onChange={setCurrency}
            options={CURRENCY_OPTIONS}
            size="sm"
            className="hidden sm:inline-flex"
          />
          <button type="button" onClick={openAdmin} className="btn btn-ghost btn-sm hidden lg:inline-flex">
            <LockIcon />
            Staff
          </button>
          <button type="button" onClick={() => openBooking()} className="btn btn-primary btn-sm hidden sm:inline-flex">
            Book a stay
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition hover:bg-stone lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" className="animate-fade-in border-t border-hairline bg-canvas lg:hidden">
          <nav className="container-x flex flex-col py-3" aria-label="Mobile">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-hairline py-3.5 text-[0.95rem] font-medium text-ink last:border-b-0"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="container-x flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-linen py-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-mute">Currency</span>
              <Segmented value={currency} onChange={setCurrency} options={CURRENCY_OPTIONS} size="sm" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openAdmin();
                }}
                className="btn btn-secondary btn-sm"
              >
                <LockIcon />
                Staff
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openBooking();
                }}
                className="btn btn-primary btn-sm"
              >
                Book a stay
              </button>
            </div>
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
