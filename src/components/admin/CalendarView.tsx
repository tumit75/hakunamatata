"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useResort } from "@/components/ResortProvider";
import { Segmented } from "@/components/ui/Overlay";
import {
  CAL_WEEKDAYS,
  MONTHS,
  addDays,
  diffDays,
  formatDate,
  formatRange,
  monthGrid,
  nightsBetween,
  type BlockSource,
} from "@/data/resortStorage";
import { useToast } from "./AdminToast";
import {
  BLOCK_SOURCE_META,
  Detail,
  Dot,
  Icon,
  Notice,
  StatusLabel,
  ViewHeader,
  cottageShort,
  initials,
} from "./adminUi";

type ManualSource = Extract<BlockSource, "maintenance" | "private-buyout" | "other">;

const STRIPES = {
  backgroundImage: "repeating-linear-gradient(135deg, rgba(200,125,85,0.18) 0 5px, transparent 5px 10px)",
};

export function CalendarView() {
  const { cottages, today, state, nightStatus, addBlock, removeBlock } = useResort();
  const toast = useToast();
  const [cottageId, setCottageId] = useState(cottages[0].id);
  const [month, setMonth] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [first, setFirst] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [source, setSource] = useState<ManualSource>("maintenance");
  const [warning, setWarning] = useState<string | null>(null);
  const [inspect, setInspect] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const dir = useRef(0);

  const cells = useMemo(() => monthGrid(month.y, month.m), [month]);
  const end = first ? addDays(last ?? first, 1) : null;
  const selNights = first && end ? diffDays(first, end) : 0;

  // Hover preview while choosing the last night.
  const previewing = !!first && !last && !!hover && hover > first;
  const previewConflict = useMemo(() => {
    if (!previewing || !first || !hover) return false;
    return nightsBetween(first, addDays(hover, 1)).some((n) => nightStatus(cottageId, n));
  }, [previewing, first, hover, nightStatus, cottageId]);

  const blocks = useMemo(
    () => state.blocked.filter((b) => b.cottageId === cottageId).sort((a, b) => a.start.localeCompare(b.start)),
    [state.blocked, cottageId],
  );

  // Slide the month grid in from the direction of travel (DOM animation, no state).
  useEffect(() => {
    const el = gridRef.current;
    const d = dir.current;
    if (!el || d === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate(
      [
        { opacity: 0, transform: `translate3d(${d * 18}px, 0, 0)` },
        { opacity: 1, transform: "none" },
      ],
      { duration: 190, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  }, [month]);

  const clearSelection = () => {
    setFirst(null);
    setLast(null);
    setHover(null);
  };

  const changeCottage = (id: string) => {
    setCottageId(id);
    clearSelection();
    setInspect(null);
    setWarning(null);
  };

  const shiftMonth = (delta: number) => {
    dir.current = delta;
    setMonth(({ y, m }) => {
      const n = m + delta;
      return { y: y + Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
    });
  };

  const onDay = (iso: string) => {
    setWarning(null);
    if (nightStatus(cottageId, iso)) {
      setInspect(iso);
      return;
    }
    setInspect(null);
    if (!first || last) {
      setFirst(iso);
      setLast(null);
      return;
    }
    if (iso < first) {
      setFirst(iso);
      return;
    }
    if (iso === first) {
      clearSelection();
      return;
    }
    setLast(iso);
    setHover(null);
  };

  const submit = () => {
    if (!first || !end) return;
    const clash = nightsBetween(first, end)
      .map((n) => nightStatus(cottageId, n))
      .find(Boolean);
    if (clash?.kind === "booked") {
      setWarning(
        `Can't block these dates: they overlap booking ${clash.booking.code} (${clash.booking.guestName}, ${formatRange(clash.booking.checkIn, clash.booking.checkOut)}). Move or cancel that booking first.`,
      );
      return;
    }
    if (clash?.kind === "blocked") {
      setWarning(`These dates overlap an existing block: “${clash.block.reason}”.`);
      return;
    }
    if (!reason.trim()) {
      setWarning("Add a short reason so the team knows why these nights are closed.");
      return;
    }
    addBlock({ cottageId, start: first, end, reason: reason.trim(), source });
    toast(`${selNights} ${selNights === 1 ? "night" : "nights"} blocked`, {
      detail: `${cottageShort(cottageId)} · ${formatRange(first, end)}. Guests can no longer book these dates.`,
    });
    setReason("");
    clearSelection();
  };

  const unblock = (id: string, start: string, stop: string) => {
    removeBlock(id);
    if (inspect && inspect >= start && inspect < stop) setInspect(null);
    toast("Nights unblocked", { detail: `${cottageShort(cottageId)} · ${formatRange(start, stop)} is bookable again.` });
  };

  const inspected = inspect ? nightStatus(cottageId, inspect) : null;
  const atCurrentMonth = month.y === Number(today.slice(0, 4)) && month.m === Number(today.slice(5, 7)) - 1;

  return (
    <div>
      <ViewHeader
        eyebrow="Availability"
        title="Calendar & date blocks"
        description="Close nights for maintenance or private buyouts. Click a first and last night on the calendar, add a reason, then block. Blocked nights disappear from the guest booking calendar."
      />

      <div className="no-scrollbar -mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <Segmented value={cottageId} onChange={changeCottage} options={cottages.map((c) => ({ value: c.id, label: cottageShort(c.id) }))} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Month grid */}
        <div className="card overflow-hidden p-3 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition hover:bg-stone hover:text-ink active:scale-95"
              aria-label="Previous month"
            >
              <Icon name="chevronLeft" />
            </button>
            <div className="text-center">
              <p key={`${month.y}-${month.m}`} className="display animate-fade-in text-xl text-ink">
                {MONTHS[month.m]} <span className="num text-lg">{month.y}</span>
              </p>
              {!atCurrentMonth && (
                <button
                  type="button"
                  onClick={() => {
                    const target = { y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 };
                    dir.current = target.y * 12 + target.m < month.y * 12 + month.m ? -1 : 1;
                    setMonth(target);
                  }}
                  className="animate-fade-in text-xs font-semibold text-forest underline-offset-2 hover:underline"
                >
                  Back to today
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition hover:bg-stone hover:text-ink active:scale-95"
              aria-label="Next month"
            >
              <Icon name="chevronRight" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {CAL_WEEKDAYS.map((d) => (
              <div key={d} className="pb-1 text-center text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-ink-mute">
                {d}
              </div>
            ))}
          </div>

          <div ref={gridRef} className="grid grid-cols-7 gap-1 sm:gap-1.5" onMouseLeave={() => setHover(null)}>
            {cells.map((iso, i) => {
              if (!iso) return <div key={`pad-${i}`} />;
              const s = nightStatus(cottageId, iso);
              const past = iso < today;
              const isEndpoint = iso === first || iso === last;
              const inRange = !!first && !!end && !!last && iso > first && iso < last;
              const inPreview = previewing && !!first && !!hover && iso > first && iso <= hover;
              const showInitials = s?.kind === "booked" && (iso === s.booking.checkIn || i % 7 === 0 || iso.endsWith("-01"));
              const showBlock = s?.kind === "blocked" && (iso === s.block.start || i % 7 === 0 || iso.endsWith("-01"));

              let tone = "bg-canvas border-hairline hover:border-forest/50 hover:bg-forest-soft/40";
              if (s?.kind === "booked") tone = "bg-forest-soft border-forest/10 text-forest-deep hover:border-forest/40";
              else if (s?.kind === "blocked") tone = "bg-ember-soft/60 border-ember/20 text-ember-deep hover:border-ember/50";
              if (inPreview)
                tone = previewConflict
                  ? "border-dashed border-ember/60 bg-ember-soft text-ember-deep"
                  : "border-dashed border-forest/40 bg-forest-soft/70 text-forest-deep";
              if (inRange) tone = "bg-forest/15 border-forest/30 text-forest-deep";
              if (isEndpoint) tone = "border-forest text-white";

              const rangeDelay = inRange && first ? `${Math.min(diffDays(first, iso), 20) * 18}ms` : undefined;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={past && !s}
                  onClick={() => onDay(iso)}
                  onMouseEnter={() => setHover(iso)}
                  style={{ ...(s?.kind === "blocked" && !inRange && !inPreview ? STRIPES : null), transitionDelay: rangeDelay }}
                  aria-label={`${formatDate(iso, { year: true })}${s ? (s.kind === "booked" ? `, booked by ${s.booking.guestName}` : `, blocked: ${s.block.reason}`) : ", free"}`}
                  aria-pressed={isEndpoint || inRange}
                  className={`relative flex min-h-12 flex-col items-start justify-between overflow-hidden rounded-lg border p-1 text-left transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.96] sm:min-h-[4.5rem] sm:p-1.5 ${tone} ${
                    past ? "opacity-45" : ""
                  } ${inspect === iso ? "ring-2 ring-ember ring-offset-1" : ""} disabled:cursor-not-allowed disabled:active:scale-100`}
                >
                  {isEndpoint && <span key={`ep-${iso}`} aria-hidden className="absolute inset-0 animate-pop-in bg-forest" />}
                  <span
                    className={`num relative text-[0.7rem] sm:text-xs ${
                      iso === today && !isEndpoint ? "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 font-bold text-white" : ""
                    }`}
                  >
                    {Number(iso.slice(8))}
                  </span>
                  {showInitials && s?.kind === "booked" && (
                    <span className="num relative truncate text-[0.62rem] font-semibold sm:text-[0.7rem]">{initials(s.booking.guestName)}</span>
                  )}
                  {showBlock && <span className="relative hidden truncate text-[0.62rem] font-semibold sm:block">Blocked</span>}
                  {iso === first && !last && (
                    <span className="relative hidden text-[0.6rem] font-semibold uppercase tracking-wide sm:block">From</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-mute">
            <Legend swatch="border border-hairline-strong bg-canvas" label="Free" />
            <Legend swatch="bg-forest-soft border border-forest/10" label="Booked" />
            <Legend swatch="border border-ember/30" style={STRIPES} label="Blocked" />
            <Legend swatch="bg-forest" label="Selected" />
            <Legend swatch="bg-ember rounded-full" label="Today" />
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {inspected && inspect && (
            <div key={inspect} className="card animate-rise-in p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="eyebrow">{formatDate(inspect, { year: true })}</p>
                <button
                  type="button"
                  onClick={() => setInspect(null)}
                  className="inline-flex h-8 items-center rounded-full px-2 text-xs font-semibold text-ink-mute transition hover:bg-stone hover:text-ink"
                >
                  Close
                </button>
              </div>
              {inspected.kind === "booked" ? (
                <div className="grid grid-cols-2 gap-3">
                  <Detail label="Guest">{inspected.booking.guestName}</Detail>
                  <Detail label="Code">
                    <span className="num">{inspected.booking.code}</span>
                  </Detail>
                  <Detail label="Stay">
                    <span className="num">{formatRange(inspected.booking.checkIn, inspected.booking.checkOut)}</span>
                  </Detail>
                  <Detail label="Status">
                    <StatusLabel status={inspected.booking.status} />
                  </Detail>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Detail label="Reason">{inspected.block.reason}</Detail>
                    <Detail label="Type">
                      <span className="inline-flex items-center gap-1.5">
                        <Dot className={BLOCK_SOURCE_META[inspected.block.source].dot} />
                        {BLOCK_SOURCE_META[inspected.block.source].label}
                      </span>
                    </Detail>
                    <Detail label="Dates">
                      <span className="num">{formatRange(inspected.block.start, inspected.block.end)}</span>
                    </Detail>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm min-h-10"
                    onClick={() => unblock(inspected.block.id, inspected.block.start, inspected.block.end)}
                  >
                    Unblock these nights
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="card p-4 sm:p-5">
            <p className="eyebrow mb-1">New block</p>
            <div className="min-h-10">
              {first && end ? (
                <p key={`${first}-${last ?? ""}`} className="num animate-fade-in text-sm text-ink">
                  {formatRange(first, end)}{" "}
                  <span className="text-ink-mute">
                    · {selNights} {selNights === 1 ? "night" : "nights"}
                  </span>
                  {!last && <span className="mt-0.5 block font-sans text-xs text-ink-mute">Now click the last night, or block just this one.</span>}
                </p>
              ) : (
                <p className="text-sm text-ink-mute">Select the first night on the calendar, then the last night.</p>
              )}
              {previewing && hover && first && (
                <p className={`num mt-1 animate-fade-in text-xs ${previewConflict ? "text-ember-deep" : "text-forest"}`}>
                  {previewConflict ? "Overlaps a booking or block" : `Preview: ${diffDays(first, addDays(hover, 1))} nights`}
                </p>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="label" htmlFor="block-reason">
                  Reason
                </label>
                <input
                  id="block-reason"
                  className="field min-h-11"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
                  placeholder="e.g. Roof repairs, private buyout"
                />
              </div>
              <div>
                <label className="label" htmlFor="block-source">
                  Type
                </label>
                <select id="block-source" className="field min-h-11" value={source} onChange={(e) => setSource(e.target.value as ManualSource)}>
                  <option value="maintenance">Maintenance</option>
                  <option value="private-buyout">Private buyout</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={submit} disabled={!first} className="btn btn-primary min-h-11 flex-1">
                  <Icon name="lock" className="h-4 w-4" />
                  Block dates
                </button>
                {first && (
                  <button type="button" onClick={clearSelection} className="btn btn-ghost min-h-11 animate-fade-in">
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {warning && (
            <div className="animate-rise-in">
              <Notice tone="warn" onDismiss={() => setWarning(null)}>
                {warning}
              </Notice>
            </div>
          )}

          <div className="card p-4 sm:p-5">
            <p className="eyebrow mb-3">
              Blocks for {cottageShort(cottageId)} <span className="num text-ink-mute">({blocks.length})</span>
            </p>
            {blocks.length === 0 ? (
              <p className="text-sm text-ink-mute">No blocked dates for this cottage.</p>
            ) : (
              <ul className="divide-y divide-hairline">
                {blocks.map((b) => {
                  const past = b.end <= today;
                  return (
                    <li key={b.id} className={`flex animate-fade-in items-start justify-between gap-3 py-3 first:pt-0 last:pb-0 ${past ? "opacity-55" : ""}`}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{b.reason}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-mute">
                          <Dot className={BLOCK_SOURCE_META[b.source].dot} />
                          {BLOCK_SOURCE_META[b.source].label}
                          <span aria-hidden>·</span>
                          <span className="num">{formatRange(b.start, b.end)}</span>
                          <span aria-hidden>·</span>
                          <span className="num">{diffDays(b.start, b.end)}n</span>
                        </p>
                      </div>
                      <button type="button" onClick={() => unblock(b.id, b.start, b.end)} className="btn btn-ghost btn-sm min-h-10 shrink-0">
                        Unblock
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ swatch, label, style }: { swatch: string; label: string; style?: CSSProperties }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded-[4px] ${swatch}`} style={style} aria-hidden />
      {label}
    </span>
  );
}
