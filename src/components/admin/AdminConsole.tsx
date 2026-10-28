"use client";

import { useEffect, useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { CloseButton, Segmented } from "@/components/ui/Overlay";
import type { Currency } from "@/data/resortStorage";
import { Icon, type IconName } from "./adminUi";
import { CalendarView } from "./CalendarView";
import { EnquiriesView } from "./EnquiriesView";
import { LedgerView } from "./LedgerView";
import { OtaView } from "./OtaView";
import { RatesView } from "./RatesView";
import { WalkInView } from "./WalkInView";

type ViewId = "ledger" | "rates" | "calendar" | "ota" | "walkin" | "enquiries";

const VIEWS: { id: ViewId; label: string; icon: IconName }[] = [
  { id: "ledger", label: "Bookings", icon: "ledger" },
  { id: "calendar", label: "Calendar & blocks", icon: "calendar" },
  { id: "rates", label: "Rates", icon: "tag" },
  { id: "walkin", label: "Walk-in booking", icon: "userPlus" },
  { id: "ota", label: "OTA sync", icon: "sync" },
  { id: "enquiries", label: "Enquiries", icon: "inbox" },
];

export function AdminConsole({ onClose, onLock }: { onClose: () => void; onLock: () => void }) {
  const { currency, setCurrency, resetDemo, state } = useResort();
  const [view, setView] = useState<ViewId>("ledger");

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

  const newEnquiries = state.eventQuotes.filter((q) => q.status === "new").length;
  const pending = state.bookings.filter((b) => b.status === "pending").length;

  const handleReset = () => {
    if (window.confirm("Reset all bookings, rates, blocks and enquiries back to the demo data?")) resetDemo();
  };

  const counts: Partial<Record<ViewId, number>> = { ledger: pending, enquiries: newEnquiries };

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-linen" role="dialog" aria-modal="true" aria-label="Staff console">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-2 border-b border-hairline bg-canvas px-3 py-2.5 sm:gap-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest text-white sm:inline-flex">
            <Icon name="leaf" className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="display truncate text-lg text-ink">Hakuna Matata</p>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ember">Staff console</p>
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
        <button type="button" onClick={handleReset} className="btn btn-ghost btn-sm" title="Reset demo data">
          <Icon name="reset" />
          <span className="hidden md:inline">Reset demo data</span>
        </button>
        <button type="button" onClick={onLock} className="btn btn-secondary btn-sm" title="Lock console">
          <Icon name="lock" />
          <span className="hidden sm:inline">Lock</span>
        </button>
        <CloseButton onClick={onClose} label="Close staff console" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Nav: scrolling tab bar on mobile, sidebar on desktop */}
        <nav className="shrink-0 border-b border-hairline bg-canvas lg:w-60 lg:border-b-0 lg:border-r" aria-label="Console sections">
          <div className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:p-4">
            {VIEWS.map((v) => {
              const active = v.id === view;
              const count = counts[v.id] ?? 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm font-semibold transition lg:w-full ${
                    active ? "bg-forest-soft text-forest-deep" : "text-ink-soft hover:bg-stone hover:text-ink"
                  }`}
                >
                  <Icon name={v.icon} className="h-4 w-4 shrink-0" />
                  <span className="lg:flex-1 lg:text-left">{v.label}</span>
                  {count > 0 && (
                    <span className="num text-xs font-semibold text-ember" aria-label={`${count} need attention`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="hidden px-6 pb-6 pt-2 text-xs leading-relaxed text-ink-mute lg:block">
            Changes save in this browser and update the guest site instantly.
          </div>
        </nav>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {view === "ledger" && <LedgerView />}
            {view === "rates" && <RatesView />}
            {view === "calendar" && <CalendarView />}
            {view === "ota" && <OtaView />}
            {view === "walkin" && <WalkInView onViewLedger={() => setView("ledger")} />}
            {view === "enquiries" && <EnquiriesView />}
          </div>
        </main>
      </div>
    </div>
  );
}
