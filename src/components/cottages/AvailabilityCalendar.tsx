"use client";

import { useState, type CSSProperties } from "react";
import { useResort } from "@/components/ResortProvider";
import {
  CAL_WEEKDAYS,
  MONTHS,
  addDays,
  diffDays,
  formatDate,
  isHighSeason,
  monthGrid,
  usdToUgx,
  type Currency,
} from "@/data/resortStorage";

type Props = {
  cottageId: string;
  checkIn?: string;
  checkOut?: string;
  onChange: (checkIn?: string, checkOut?: string) => void;
  /** 2 shows two months side by side on md+ (one on phones). */
  months?: 1 | 2;
  readOnly?: boolean;
};

const ymOf = (iso: string) => Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7)) - 1;

const HATCH_BOOKED: CSSProperties = {
  backgroundImage: "repeating-linear-gradient(135deg, rgba(26,26,26,0.075) 0 3px, transparent 3px 7px)",
};
const HATCH_BLOCKED: CSSProperties = {
  backgroundImage: "repeating-linear-gradient(45deg, rgba(26,26,26,0.07) 0 3px, transparent 3px 7px)",
};

function compactPrice(usd: number, currency: Currency): string {
  if (currency === "USD") return `$${Math.round(usd)}`;
  const k = usdToUgx(usd) / 1000;
  return k >= 1000 ? `${(k / 1000).toFixed(1)}m` : `${Math.round(k)}k`;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LegendSwatch({ label, className = "", style }: { label: string; className?: string; style?: CSSProperties }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded-[3px] ${className}`} style={style} aria-hidden />
      {label}
    </span>
  );
}

export function AvailabilityCalendar({ cottageId, checkIn, checkOut, onChange, months = 2, readOnly = false }: Props) {
  const { today, nightStatus, nightly, money, currency } = useResort();
  const minYM = ymOf(today);
  const maxYM = minYM + 12;
  const [view, setView] = useState(() => ymOf(checkIn && checkIn > today ? checkIn : today));
  const [hover, setHover] = useState<string | null>(null);
  const shown = Math.min(Math.max(view, minYM), maxYM);

  const isFree = (iso: string) => iso >= today && !nightStatus(cottageId, iso);
  const selectingOut = !readOnly && !!checkIn && !checkOut;

  // While choosing check-out, the latest valid date is the first taken night after check-in.
  let limit: string | null = null;
  if (selectingOut && checkIn) {
    let d = addDays(checkIn, 1);
    for (let i = 0; i < 400 && isFree(d); i++) d = addDays(d, 1);
    limit = d;
  }

  const validCheckout = (iso: string) => !!(selectingOut && checkIn && limit && iso > checkIn && iso <= limit);
  const canPick = (iso: string) => !readOnly && iso >= today && (validCheckout(iso) || isFree(iso));

  const pick = (iso: string) => {
    if (!canPick(iso)) return;
    if (checkIn && validCheckout(iso)) onChange(checkIn, iso);
    else onChange(iso, undefined);
  };

  const previewEnd = selectingOut && hover && validCheckout(hover) ? hover : null;
  const rangeEnd = checkOut ?? previewEnd;
  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;
  const hint = readOnly
    ? "Live availability"
    : !checkIn
      ? "Select a check-in date"
      : !checkOut
        ? "Now select a check-out date"
        : `${nights} ${nights === 1 ? "night" : "nights"} selected`;

  const visible = months === 2 ? [shown, shown + 1] : [shown];

  return (
    <div className="w-full select-none" onMouseLeave={() => setHover(null)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn btn-ghost btn-sm px-2"
          onClick={() => setView(shown - 1)}
          disabled={shown <= minYM}
          aria-label="Previous month"
        >
          <Chevron dir="left" />
        </button>
        <p className="text-center text-sm text-ink-soft" aria-live="polite">
          {hint}
        </p>
        <button
          type="button"
          className="btn btn-ghost btn-sm px-2"
          onClick={() => setView(shown + 1)}
          disabled={shown >= maxYM}
          aria-label="Next month"
        >
          <Chevron dir="right" />
        </button>
      </div>

      <div className={months === 2 ? "grid gap-8 md:grid-cols-2" : ""}>
        {visible.map((ym, idx) => {
          const year = Math.floor(ym / 12);
          const m0 = ym % 12;
          const cells = monthGrid(year, m0);
          return (
            <div key={ym} className={idx === 1 ? "hidden md:block" : ""}>
              <p className="mb-3 text-center text-sm font-semibold text-ink">
                {MONTHS[m0]} <span className="num">{year}</span>
              </p>
              <div className="grid grid-cols-7 gap-1 text-center">
                {CAL_WEEKDAYS.map((w) => (
                  <div key={w} className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-mute">
                    {w}
                  </div>
                ))}
                {cells.map((iso, i) => {
                  if (!iso) return <div key={`pad-${i}`} aria-hidden />;
                  const status = nightStatus(cottageId, iso);
                  const past = iso < today;
                  const isStart = iso === checkIn;
                  const isEnd = iso === checkOut;
                  const isPreviewEnd = !checkOut && iso === previewEnd;
                  const inRange = !!checkIn && !!rangeEnd && iso > checkIn && iso < rangeEnd;
                  const pickable = canPick(iso);
                  const price = !past && !status ? nightly(cottageId, iso) : null;
                  const high = isHighSeason(iso);

                  let cls =
                    "relative flex h-11 flex-col items-center justify-center rounded-lg text-[13px] leading-none transition-colors duration-150 sm:h-12";
                  let style: CSSProperties | undefined;
                  if (isStart || isEnd) cls += " bg-forest font-semibold text-white";
                  else if (isPreviewEnd) cls += " bg-forest/80 text-white";
                  else if (inRange) cls += checkOut ? " bg-forest-soft text-forest" : " bg-forest-soft/60 text-forest";
                  else if (past) cls += " text-ink-mute/35";
                  else if (status?.kind === "booked") {
                    cls += " text-ink-mute/70 line-through";
                    style = HATCH_BOOKED;
                  } else if (status?.kind === "blocked") {
                    cls += " bg-stone text-ink-mute/70";
                    style = HATCH_BLOCKED;
                  } else cls += " text-ink";
                  if (pickable && !isStart && !isEnd && !inRange) cls += " cursor-pointer hover:bg-stone";
                  if (!pickable) cls += readOnly ? " cursor-default" : " cursor-not-allowed";

                  const label = [
                    formatDate(iso, { year: true }),
                    past ? "past" : status ? (status.kind === "booked" ? "reserved" : "blocked") : null,
                    price !== null ? `${money(price)} per night` : null,
                    isStart ? "check-in" : null,
                    isEnd ? "check-out" : null,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={!pickable}
                      aria-label={label}
                      aria-pressed={isStart || isEnd}
                      onClick={() => pick(iso)}
                      onMouseEnter={() => setHover(iso)}
                      className={cls}
                      style={style}
                    >
                      <span className="num">{Number(iso.slice(8))}</span>
                      {price !== null && (
                        <span
                          className={`num mt-0.5 text-[9.5px] sm:text-[10px] ${
                            isStart || isEnd || isPreviewEnd ? "text-white/80" : high ? "text-ember" : "text-ink-mute"
                          }`}
                        >
                          {compactPrice(price, currency)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-mute">
          <LegendSwatch label="Available" className="bg-white ring-1 ring-hairline-strong" />
          <LegendSwatch label="Reserved" className="bg-white ring-1 ring-hairline" style={HATCH_BOOKED} />
          <LegendSwatch label="Blocked" className="bg-stone" style={HATCH_BLOCKED} />
          <span className="inline-flex items-center gap-1.5">
            <span className="num font-semibold text-ember">$</span> High season price
          </span>
        </div>
        {!readOnly && checkIn && (
          <button
            type="button"
            onClick={() => onChange(undefined, undefined)}
            className="text-xs font-semibold text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
