"use client";

import type { ReactNode } from "react";
import {
  COTTAGES,
  type BlockSource,
  type BookingSource,
  type BookingStatus,
  type OtaChannel,
  type PaymentMethod,
} from "@/data/resortStorage";

export const STATUS_META: Record<BookingStatus, { label: string; dot: string }> = {
  pending: { label: "Pending", dot: "bg-ember" },
  confirmed: { label: "Confirmed", dot: "bg-forest" },
  "checked-in": { label: "Checked in", dot: "bg-[#4f8f68]" },
  completed: { label: "Completed", dot: "bg-ink-mute" },
  cancelled: { label: "Cancelled", dot: "bg-danger" },
};

export const BOOKING_STATUSES = Object.keys(STATUS_META) as BookingStatus[];

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  mtn: "MTN MoMo",
  airtel: "Airtel Money",
  card: "Card",
  cash: "Cash",
  "pay-on-arrival": "Pay on arrival",
};

export const SOURCE_LABEL: Record<BookingSource, string> = {
  website: "Website",
  "walk-in": "Walk-in",
  phone: "Phone",
  airbnb: "Airbnb",
  "booking.com": "Booking.com",
};

export const BLOCK_SOURCE_META: Record<BlockSource, { label: string; dot: string }> = {
  maintenance: { label: "Maintenance", dot: "bg-ember" },
  "private-buyout": { label: "Private buyout", dot: "bg-forest" },
  airbnb: { label: "Airbnb", dot: "bg-[#ff5a5f]" },
  "booking.com": { label: "Booking.com", dot: "bg-[#003580]" },
  other: { label: "Other", dot: "bg-ink-mute" },
};

export const CHANNEL_META: Record<OtaChannel, { label: string; dot: string }> = {
  airbnb: { label: "Airbnb", dot: "bg-[#ff5a5f]" },
  "booking.com": { label: "Booking.com", dot: "bg-[#003580]" },
};

export function cottageName(id: string): string {
  return COTTAGES.find((c) => c.id === id)?.name ?? id;
}

/** "Nile", "Savannah", ... */
export function cottageShort(id: string): string {
  return cottageName(id).split(" ")[0];
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export function Dot({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`inline-block h-2 w-2 shrink-0 rounded-full ${className}`} />;
}

export function StatusLabel({ status }: { status: BookingStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
      <Dot className={m.dot} />
      {m.label}
    </span>
  );
}

export function ViewHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow mb-1.5">{eyebrow}</p>
        <h2 className="display text-3xl text-ink sm:text-[2.1rem]">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Small key/value block for detail panels. */
export function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-mute">{label}</p>
      <div className="mt-1 break-words text-sm text-ink">{children}</div>
    </div>
  );
}

export function Notice({ tone = "ok", children, onDismiss }: { tone?: "ok" | "warn"; children: ReactNode; onDismiss?: () => void }) {
  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        tone === "ok" ? "border-forest/15 bg-forest-soft text-forest-deep" : "border-ember/25 bg-ember-soft text-ember-deep"
      }`}
    >
      <Icon name={tone === "ok" ? "check" : "alert"} className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 text-xs font-semibold underline-offset-2 hover:underline">
          Dismiss
        </button>
      )}
    </div>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const ICONS = {
  ledger: "M4 6h16M4 12h16M4 18h10",
  tag: "M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.3 7.3a1 1 0 0 1-1.4 0L3.5 12.2Z M8 8h.01",
  calendar: "M4.5 6.5h15v13h-15z M4.5 10.5h15 M8.5 3.5v4 M15.5 3.5v4",
  sync: "M4.5 11a7.5 7.5 0 0 1 13.2-4.4L19.5 8.5 M19.5 3.5v5h-5 M19.5 13a7.5 7.5 0 0 1-13.2 4.4L4.5 15.5 M4.5 20.5v-5h5",
  userPlus: "M14.5 19.5c0-3-2.5-5-5.5-5s-5.5 2-5.5 5 M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M18.5 8v6 M15.5 11h6",
  inbox: "M4 13.5 6.5 5h11l2.5 8.5V19H4z M4 13.5h4.5l1 2.5h5l1-2.5H20",
  lock: "M6 11h12v9.5H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  unlock: "M6 11h12v9.5H6z M8.5 11V8a3.5 3.5 0 0 1 6.8-1.2",
  more: "M5.5 12a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0 M11.5 12a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0 M17.5 12a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0",
  close: "M6 6l12 12 M18 6 6 18",
  bed: "M3.5 18.5v-11 M3.5 14.5h17v4 M20.5 14.5v-2.5a2.5 2.5 0 0 0-2.5-2.5h-7v5 M7 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  copy: "M9 9h10.5v10.5H9z M15 9V4.5H4.5V15H9",
  download: "M12 4v11 M7.5 10.5 12 15l4.5-4.5 M5 19.5h14",
  chevronLeft: "M14.5 6 8.5 12l6 6",
  chevronRight: "M9.5 6l6 6-6 6",
  chevronDown: "M6 9.5l6 6 6-6",
  check: "M5 12.5 9.5 17 19 7.5",
  alert: "M12 8v5 M12 16.5h.01 M10.3 4.3 2.9 17.5A2 2 0 0 0 4.6 20.5h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M20 20l-4-4",
  reset: "M4 12a8 8 0 1 0 2.4-5.7L4 8.7 M4 4v4.7h4.7",
  backspace: "M9 5.5h10.5v13H9L3.5 12 9 5.5Z M12.5 9.5l5 5 M17.5 9.5l-5 5",
  plus: "M12 5v14 M5 12h14",
  trash: "M5 7h14 M10 7V4.5h4V7 M7 7l1 12.5h8L17 7",
  pause: "M9 5.5v13 M15 5.5v13",
  play: "M8 5.5 18 12 8 18.5z",
  users: "M15.5 19.5c0-2.8-2.4-4.5-5.5-4.5s-5.5 1.7-5.5 4.5 M10 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M16 5.3a3.5 3.5 0 0 1 0 6.4 M19.5 19.5c0-2.2-1.2-3.7-3-4.3",
  arrival: "M4 19.5h16 M7 15.5l-2.5-5 2-1 3 2.5 4.5-2.5-4-6 2.5-1 6 5 3-1.5a1.5 1.5 0 0 1 1.5 2.6L8.5 15.5H7Z",
  chart: "M4.5 19.5h15 M7.5 16v-5 M12 16V7 M16.5 16v-3",
  wallet: "M4.5 7.5h14v11h-14z M4.5 7.5l10-3v3 M15 13h.01",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  phone: "M5 4.5h3.5l1.5 4-2 1.5a10 10 0 0 0 6 6l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 6 1.5 1.5 0 0 1 5 4.5Z",
  mail: "M4 6h16v12H4z M4 6.5l8 6 8-6",
  leaf: "M5 19c0-8 5-14 14-14 0 9-6 14-14 14Z M5 19l7-7",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className = "h-4 w-4" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={ICONS[name]} />
    </svg>
  );
}
