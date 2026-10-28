"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { Segmented } from "@/components/ui/Overlay";
import { formatDate, type Currency } from "@/data/resortStorage";
import { ToastProvider, useToast } from "./AdminToast";
import { Icon, type IconName } from "./adminUi";
import { CalendarView } from "./CalendarView";
import { EnquiriesView } from "./EnquiriesView";
import { LedgerView } from "./LedgerView";
import { OtaView } from "./OtaView";
import { RatesView } from "./RatesView";
import { WalkInView } from "./WalkInView";

type ViewId = "ledger" | "rates" | "calendar" | "ota" | "walkin" | "enquiries";

const VIEWS: { id: ViewId; label: string; short: string; icon: IconName }[] = [
  { id: "ledger", label: "Bookings", short: "Bookings", icon: "ledger" },
  { id: "calendar", label: "Calendar & blocks", short: "Calendar", icon: "calendar" },
  { id: "rates", label: "Rates", short: "Rates", icon: "tag" },
  { id: "walkin", label: "Walk-in booking", short: "Walk-in", icon: "userPlus" },
  { id: "ota", label: "OTA sync", short: "OTA sync", icon: "sync" },
  { id: "enquiries", label: "Enquiries", short: "Enquiries", icon: "inbox" },
];

export function AdminConsole({ onClose, onLock }: { onClose: () => void; onLock: () => void }) {
  return (
    <ToastProvider>
      <ConsoleShell onClose={onClose} onLock={onLock} />
    </ToastProvider>
  );
}

function ConsoleShell({ onClose, onLock }: { onClose: () => void; onLock: () => void }) {
  const { currency, setCurrency, resetDemo, state, today, ready } = useResort();
  const toast = useToast();
  const [view, setView] = useState<ViewId>("ledger");
  const [menuOpen, setMenuOpen] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const buttons = useRef(new Map<ViewId, HTMLButtonElement>());
  const placed = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Lock page scroll + Escape to close.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Slide the active-nav indicator under the current item (DOM only, no state).
  useLayoutEffect(() => {
    const place = () => {
      const btn = buttons.current.get(view);
      const ind = indicatorRef.current;
      if (!btn || !ind) return;
      if (!placed.current) ind.style.transition = "none";
      ind.style.width = `${btn.offsetWidth}px`;
      ind.style.height = `${btn.offsetHeight}px`;
      ind.style.transform = `translate3d(${btn.offsetLeft}px, ${btn.offsetTop}px, 0)`;
      ind.style.opacity = "1";
      if (!placed.current) {
        void ind.offsetWidth;
        ind.style.transition = "";
        placed.current = true;
      }
    };
    place();
    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(place);
    ro.observe(rail);
    return () => ro.disconnect();
  }, [view]);

  // Close the phone menu on outside tap.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  const go = (id: ViewId) => {
    setView(id);
    mainRef.current?.scrollTo({ top: 0 });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    buttons.current.get(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest", inline: "center" });
  };

  const newEnquiries = state.eventQuotes.filter((q) => q.status === "new").length;
  const pending = state.bookings.filter((b) => b.status === "pending").length;
  const counts: Partial<Record<ViewId, number>> = { ledger: pending, enquiries: newEnquiries };

  const handleReset = () => {
    setMenuOpen(false);
    if (!window.confirm("Reset all bookings, rates, blocks and enquiries back to the demo data?")) return;
    resetDemo();
    toast("Demo data restored", { tone: "info", detail: "Bookings, rates, blocks and enquiries are back to the starting set." });
  };

  const handleLock = () => {
    setMenuOpen(false);
    onLock();
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-linen" role="dialog" aria-modal="true" aria-label="Staff console">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-2 border-b border-hairline bg-canvas/95 px-3 py-2 backdrop-blur sm:gap-3 sm:px-5 sm:py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-white sm:inline-flex">
            <Icon name="leaf" className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="display truncate text-[1.05rem] text-ink sm:text-lg">Hakuna Matata</p>
            <p className="flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-ember">
              Staff console
              <span className="hidden items-center gap-1.5 font-medium normal-case tracking-normal text-ink-mute md:inline-flex">
                <span aria-hidden className="text-ink-mute/60">
                  ·
                </span>
                <span className="pulse-ring relative isolate inline-block h-1.5 w-1.5 rounded-full bg-[#4f8f68]" aria-hidden />
                <span className="num">{ready ? formatDate(today, { year: true }) : "Loading…"}</span>
              </span>
            </p>
          </div>
        </div>

        <Segmented<Currency>
          size="sm"
          value={currency}
          onChange={setCurrency}
          options={[
            { value: "USD", label: "USD" },
            { value: "UGX", label: "UGX" },
          ]}
        />

        {/* Desktop / tablet actions */}
        <button type="button" onClick={handleReset} className="btn btn-ghost btn-sm hidden h-10 sm:inline-flex" title="Reset demo data">
          <Icon name="reset" />
          <span className="hidden lg:inline">Reset demo data</span>
        </button>
        <button type="button" onClick={handleLock} className="btn btn-secondary btn-sm hidden h-10 sm:inline-flex" title="Lock console">
          <Icon name="lock" />
          Lock
        </button>

        {/* Phone: secondary actions in a small menu */}
        <div ref={menuRef} className="relative sm:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="More actions"
            aria-expanded={menuOpen}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${menuOpen ? "bg-stone text-ink" : "text-ink-soft hover:bg-stone"}`}
          >
            <Icon name="more" className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 z-10 w-52 origin-top-right animate-pop-in overflow-hidden rounded-xl border border-hairline-strong bg-canvas py-1 shadow-xl">
              <button type="button" onClick={handleLock} className="flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm font-medium text-ink hover:bg-linen">
                <Icon name="lock" className="h-4 w-4 text-ink-soft" />
                Lock console
              </button>
              <button type="button" onClick={handleReset} className="flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm font-medium text-ink hover:bg-linen">
                <Icon name="reset" className="h-4 w-4 text-ink-soft" />
                Reset demo data
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close staff console"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-stone hover:text-ink"
        >
          <Icon name="close" className="h-5 w-5" />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Nav: scrolling tab bar on phones/tablets, sidebar on desktop */}
        <nav className="shrink-0 border-b border-hairline bg-canvas lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r" aria-label="Console sections">
          <div
            ref={railRef}
            className="no-scrollbar relative flex gap-1 overflow-x-auto px-3 py-2 [mask-image:linear-gradient(to_right,transparent,#000_14px,#000_calc(100%-14px),transparent)] lg:flex-col lg:overflow-visible lg:p-4 lg:[mask-image:none]"
          >
            <span
              ref={indicatorRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 rounded-[10px] bg-forest-soft opacity-0 transition-[transform,width,height] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            >
              <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-forest lg:inset-x-auto lg:inset-y-2 lg:left-0 lg:h-auto lg:w-[3px]" />
            </span>
            {VIEWS.map((v) => {
              const active = v.id === view;
              const count = counts[v.id] ?? 0;
              return (
                <button
                  key={v.id}
                  ref={(el) => {
                    if (el) buttons.current.set(v.id, el);
                    else buttons.current.delete(v.id);
                  }}
                  type="button"
                  onClick={() => go(v.id)}
                  aria-current={active ? "page" : undefined}
                  className={`relative z-[1] flex min-h-10 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-semibold transition-colors duration-150 lg:w-full ${
                    active ? "text-forest-deep" : "text-ink-soft hover:bg-stone/70 hover:text-ink"
                  }`}
                >
                  <Icon name={v.icon} className={`h-4 w-4 shrink-0 transition-transform duration-200 ${active ? "scale-110 text-forest" : ""}`} />
                  <span className="lg:flex-1 lg:text-left">
                    <span className="lg:hidden">{v.short}</span>
                    <span className="hidden lg:inline">{v.label}</span>
                  </span>
                  {count > 0 && (
                    <span
                      key={count}
                      className="num inline-flex h-5 min-w-5 animate-pop-in items-center justify-center rounded-full bg-ember-soft px-1.5 text-[0.7rem] font-semibold text-ember-deep"
                      aria-label={`${count} need attention`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-auto hidden px-6 pb-6 pt-2 lg:block">
            <div className="rounded-xl bg-linen p-4 text-xs leading-relaxed text-ink-mute">
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-ink-soft">
                <span className="pulse-ring relative isolate inline-block h-1.5 w-1.5 rounded-full bg-[#4f8f68]" aria-hidden />
                Live
              </p>
              Changes save in this browser and update the guest site instantly.
            </div>
          </div>
        </nav>

        <main ref={mainRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div key={view} className="mx-auto w-full max-w-6xl animate-rise-in px-4 pb-24 pt-6 sm:px-6 sm:pt-8 lg:px-8">
            {view === "ledger" && <LedgerView />}
            {view === "rates" && <RatesView />}
            {view === "calendar" && <CalendarView />}
            {view === "ota" && <OtaView />}
            {view === "walkin" && <WalkInView onViewLedger={() => go("ledger")} />}
            {view === "enquiries" && <EnquiriesView />}
          </div>
        </main>
      </div>
    </div>
  );
}
