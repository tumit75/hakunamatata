"use client";

import { useRef, useState, type CSSProperties, type TouchEvent } from "react";
import { useResort } from "@/components/ResortProvider";
import { FxStyles, slideStyle } from "@/components/booking/fx";
import {
  CAL_WEEKDAYS,
  MONTHS,
  addDays,
  diffDays,
  formatDate,
  isHighSeason,
  monthGrid,
  quoteStay,
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
  const { today, nightStatus, nightly, money, currency, rateFor } = useResort();
  const minYM = ymOf(today);
  const maxYM = minYM + 12;
  const [view, setView] = useState(() => ymOf(checkIn && checkIn > today ? checkIn : today));
  const [nav, setNav] = useState<{ dir: 1 | -1; n: number }>({ dir: 1, n: 0 });
  const [hover, setHover] = useState<string | null>(null);
  const touchX = useRef<number | null>(null);
  const shown = Math.min(Math.max(view, minYM), maxYM);

  const go = (dir: 1 | -1) => {
    const target = shown + dir;
    if (target < minYM || target > maxYM) return;
    setView(target);
    setNav((n) => ({ dir, n: n.n + 1 }));
  };

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

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
  const previewNights = checkIn && previewEnd ? diffDays(checkIn, previewEnd) : 0;
  const previewTotal =
    checkIn && previewEnd
      ? quoteStay({ baseRateUSD: rateFor(cottageId), checkIn, checkOut: previewEnd, guests: 1, addonIds: [] }).lodgingUSD
      : 0;

  const hint = readOnly
    ? "Live availability"
    : !checkIn
      ? "Select a check-in date"
      : !checkOut
        ? previewEnd
          ? `${previewNights} ${previewNights === 1 ? "night" : "nights"} · ${money(previewTotal)} before VAT`
          : "Now select a check-out date"
        : `${nights} ${nights === 1 ? "night" : "nights"} selected`;

  const visible = months === 2 ? [shown, shown + 1] : [shown];

  return (
    <div className="w-full select-none" onMouseLeave={() => setHover(null)}>
      <FxStyles />
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn btn-ghost h-10 w-10 p-0"
          onClick={() => go(-1)}
          disabled={shown <= minYM}
          aria-label="Previous month"
        >
          <Chevron dir="left" />
        </button>
        <p key={hint} className="animate-fade-in text-center text-sm text-ink-soft" aria-live="polite">
          {hint}
        </p>
        <button
          type="button"
          className="btn btn-ghost h-10 w-10 p-0"
          onClick={() => go(1)}
          disabled={shown >= maxYM}
          aria-label="Next month"
        >
          <Chevron dir="right" />
        </button>
      </div>

      <div className="overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div
          key={shown}
          className={months === 2 ? "grid gap-8 md:grid-cols-2" : ""}
          style={nav.n > 0 ? slideStyle(nav.dir, 200) : undefined}
        >
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
                    const isToday = iso === today;
                    const isStart = iso === checkIn;
                    const isEnd = iso === checkOut;
                    const isPreviewEnd = !checkOut && iso === previewEnd;
                    const inRange = !!checkIn && !!rangeEnd && iso > checkIn && iso < rangeEnd;
                    const pickable = canPick(iso);
                    const price = !past && !status ? nightly(cottageId, iso) : null;
                    const high = isHighSeason(iso);

                    let cls =
                      "relative flex h-11 flex-col items-center justify-center rounded-lg text-[13px] leading-none transition-[background-color,color,box-shadow] duration-150 sm:h-12";
                    let style: CSSProperties | undefined;
                    if (isStart || isEnd) cls += " animate-pop-in bg-forest font-semibold text-white shadow-[0_6px_14px_-6px_rgba(31,61,43,0.6)]";
                    else if (isPreviewEnd) cls += " bg-forest/85 text-white";
                    else if (inRange) cls += checkOut ? " bg-forest-soft text-forest" : " bg-forest-soft/60 text-forest";
                    else if (past) cls += " text-ink-mute/35";
                    else if (status?.kind === "booked") {
                      cls += " text-ink-mute/70 line-through";
                      style = HATCH_BOOKED;
                    } else if (status?.kind === "blocked") {
                      cls += " bg-stone text-ink-mute/70";
                      style = HATCH_BLOCKED;
                    } else cls += " text-ink";
                    if (isToday && !isStart && !isEnd) cls += " ring-1 ring-inset ring-ember/60";
                    if (pickable && !isStart && !isEnd && !inRange) cls += " cursor-pointer hover:bg-stone";
                    if (!pickable) cls += readOnly ? " cursor-default" : " cursor-not-allowed";

                    const label = [
                      formatDate(iso, { year: true }),
                      isToday ? "today" : null,
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
                        onFocus={() => setHover(iso)}
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
                        {isToday && !isStart && !isEnd && (
                          <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-ember" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-mute">
          <LegendSwatch label="Available" className="bg-white ring-1 ring-hairline-strong" />
          <LegendSwatch label="Reserved" className="bg-white ring-1 ring-hairline" style={HATCH_BOOKED} />
          <LegendSwatch label="Blocked" className="bg-stone" style={HATCH_BLOCKED} />
          <LegendSwatch label="Today" className="bg-white ring-1 ring-ember/60" />
          <span className="inline-flex items-center gap-1.5">
            <span className="num font-semibold text-ember">$</span> High season price
          </span>
        </div>
        {!readOnly && checkIn && (
          <button
            type="button"
            onClick={() => onChange(undefined, undefined)}
            className="text-xs font-semibold text-ink-soft underline underline-offset-2 transition hover:text-ink"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
}
