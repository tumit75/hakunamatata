"use client";

import { Fragment, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useResort } from "@/components/ResortProvider";
import { CountUp, useInView } from "@/components/ui/Motion";
import { Specs } from "@/components/ui/Overlay";
import {
  ADDONS,
  WEEKDAYS_SHORT,
  addDays,
  diffDays,
  formatDate,
  formatRange,
  formatTimestamp,
  usdToUgx,
  weekdayOf,
  type Booking,
  type BookingSource,
  type BookingStatus,
  type NightStatus,
} from "@/data/resortStorage";
import { useToast } from "./AdminToast";
import {
  BOOKING_STATUSES,
  Detail,
  Dot,
  Icon,
  PAYMENT_LABEL,
  SOURCE_LABEL,
  STATUS_META,
  ViewHeader,
  cottageName,
  cottageShort,
  initials,
  type IconName,
} from "./adminUi";

const SOURCES = Object.keys(SOURCE_LABEL) as BookingSource[];
const STRIP_NIGHTS = 14;
const STRIPES = {
  backgroundImage: "repeating-linear-gradient(135deg, rgba(200,125,85,0.28) 0 4px, rgba(200,125,85,0.08) 4px 8px)",
};

type NightRow = { iso: string; statuses: NightStatus[]; booked: number; blocked: number };

export function LedgerView() {
  const { state, today, money, currency, cottages, nightStatus, setBookingStatus } = useResort();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const [cottage, setCottage] = useState("all");
  const [source, setSource] = useState<"all" | BookingSource>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const kpis = useMemo(() => {
    const live = state.bookings.filter((b) => b.status !== "cancelled");
    const inHouse = live.filter((b) => b.checkIn <= today && today < b.checkOut);
    const weekEnd = addDays(today, 7);
    const arrivals = live.filter((b) => b.checkIn >= today && b.checkIn < weekEnd);
    const total = cottages.length * 30;
    let booked = 0;
    for (const c of cottages) {
      for (let i = 0; i < 30; i++) if (nightStatus(c.id, addDays(today, i))?.kind === "booked") booked++;
    }
    const upcoming = live.filter((b) => b.checkOut > today);
    return {
      inHouse: inHouse.length,
      inHouseGuests: inHouse.reduce((s, b) => s + b.guests, 0),
      arrivals: arrivals.length,
      arrivalGuests: arrivals.reduce((s, b) => s + b.guests, 0),
      occupancy: Math.round((booked / total) * 100),
      booked,
      total,
      revenue: upcoming.reduce((s, b) => s + b.totalUSD, 0),
      revenueCount: upcoming.length,
    };
  }, [state.bookings, today, cottages, nightStatus]);

  const nights = useMemo<NightRow[]>(
    () =>
      Array.from({ length: STRIP_NIGHTS }, (_, i) => {
        const iso = addDays(today, i);
        const statuses = cottages.map((c) => nightStatus(c.id, iso));
        return {
          iso,
          statuses,
          booked: statuses.filter((s) => s?.kind === "booked").length,
          blocked: statuses.filter((s) => s?.kind === "blocked").length,
        };
      }),
    [today, cottages, nightStatus],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return state.bookings
      .filter(
        (b) =>
          (status === "all" || b.status === status) &&
          (cottage === "all" || b.cottageId === cottage) &&
          (source === "all" || b.source === source) &&
          (!q ||
            b.guestName.toLowerCase().includes(q) ||
            b.code.toLowerCase().includes(q) ||
            (qDigits.length >= 3 && b.phone.replace(/\D/g, "").includes(qDigits))),
      )
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn) || a.cottageId.localeCompare(b.cottageId));
  }, [state.bookings, query, status, cottage, source]);

  const filtersActive = query !== "" || status !== "all" || cottage !== "all" || source !== "all";
  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setCottage("all");
    setSource("all");
  };
  const toggle = (id: string) => setExpanded((e) => (e === id ? null : id));

  const changeStatus = (id: string, next: BookingStatus) => {
    const b = state.bookings.find((x) => x.id === id);
    setBookingStatus(id, next);
    toast(`${b?.code ?? "Booking"} marked ${STATUS_META[next].label.toLowerCase()}`, {
      tone: next === "cancelled" ? "warn" : "ok",
      detail: b ? `${b.guestName} · ${cottageName(b.cottageId)}` : undefined,
    });
  };

  // UGX totals run to eight digits, so show them in millions to fit a phone-width tile.
  const revenueValue =
    currency === "USD" ? (
      <CountUp to={kpis.revenue} prefix="$" />
    ) : (
      <CountUp to={usdToUgx(kpis.revenue) / 1_000_000} decimals={1} prefix="USh " suffix="M" />
    );

  return (
    <div>
      <ViewHeader
        eyebrow="Front desk"
        title="Bookings ledger"
        description="Every reservation from the website, walk-ins, phone and synced channels. Click a booking for guest details; change status inline."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon="users" label="In-house tonight" value={<CountUp to={kpis.inHouse} />} sub={`${kpis.inHouseGuests} guests on property`} />
        <Kpi icon="arrival" label="Arrivals, 7 days" value={<CountUp to={kpis.arrivals} />} sub={`${kpis.arrivalGuests} guests expected`} />
        <Kpi
          icon="chart"
          label="Occupancy, 30 nights"
          value={<CountUp to={kpis.occupancy} suffix="%" />}
          sub={`${kpis.booked} of ${kpis.total} cottage-nights`}
          extra={<OccupancyBars nights={nights} total={cottages.length} />}
        />
        <Kpi icon="wallet" label="Upcoming revenue" value={revenueValue} sub={`${kpis.revenueCount} active stays, incl. VAT`} />
      </div>

      <NightGrid nights={nights} />

      <div className="card mb-4 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
        <label className="relative block sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Search bookings</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest, code or phone"
            className="field min-h-11 pl-9"
          />
        </label>
        <select className="field min-h-11 lg:w-40" value={status} onChange={(e) => setStatus(e.target.value as "all" | BookingStatus)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
        <select className="field min-h-11 lg:w-48" value={cottage} onChange={(e) => setCottage(e.target.value)} aria-label="Filter by cottage">
          <option value="all">All cottages</option>
          {cottages.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="field min-h-11 lg:w-40" value={source} onChange={(e) => setSource(e.target.value as "all" | BookingSource)} aria-label="Filter by source">
          <option value="all">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex min-h-9 items-center justify-between gap-3 text-sm text-ink-mute">
        <span>
          <span className="num text-ink">{rows.length}</span> of <span className="num">{state.bookings.length}</span> bookings
          <span className="hidden sm:inline">, sorted by check-in</span>
        </span>
        {filtersActive && (
          <button type="button" className="btn btn-ghost btn-sm animate-fade-in" onClick={clearFilters}>
            <Icon name="close" className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="card animate-fade-in px-6 py-14 text-center">
          <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-stone text-ink-mute">
            <Icon name="search" className="h-5 w-5" />
          </span>
          <p className="display text-xl text-ink">No bookings match</p>
          <p className="mt-1 text-sm text-ink-mute">Try a different name, code or filter.</p>
        </div>
      ) : (
        <>
          {/* Table from md up */}
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-linen text-[0.68rem] uppercase tracking-[0.1em] text-ink-mute">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Booking</th>
                    <th className="px-4 py-3 font-semibold">Cottage</th>
                    <th className="px-4 py-3 font-semibold">Stay</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => {
                    const open = expanded === b.id;
                    const cancelled = b.status === "cancelled";
                    return (
                      <Fragment key={b.id}>
                        <tr
                          onClick={() => toggle(b.id)}
                          className={`group cursor-pointer border-t border-hairline transition-colors duration-150 hover:bg-linen ${open ? "bg-linen" : ""} ${
                            cancelled ? "text-ink-mute" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              aria-expanded={open}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggle(b.id);
                              }}
                              className="flex items-start gap-2 text-left"
                            >
                              <Icon
                                name="chevronDown"
                                className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-mute transition-transform duration-200 ${open ? "rotate-180 text-forest" : "group-hover:text-ink"}`}
                              />
                              <span className="min-w-0">
                                <span className={`block font-semibold ${cancelled ? "line-through decoration-ink-mute/50" : "text-ink"}`}>{b.guestName}</span>
                                <span className="num block text-xs text-ink-mute">{b.code}</span>
                              </span>
                            </button>
                          </td>
                          <td className="px-4 py-3 text-ink-soft">{cottageName(b.cottageId)}</td>
                          <td className="px-4 py-3">
                            <span className="num block whitespace-nowrap text-ink-soft">{formatRange(b.checkIn, b.checkOut)}</span>
                            <span className="num block text-xs text-ink-mute">
                              {diffDays(b.checkIn, b.checkOut)} nights · {b.guests} guests
                            </span>
                          </td>
                          <td className="num whitespace-nowrap px-4 py-3 text-right font-semibold text-ink">{money(b.totalUSD)}</td>
                          <td className="px-4 py-3">
                            <span className="block whitespace-nowrap text-ink-soft">{PAYMENT_LABEL[b.paymentMethod]}</span>
                            <span className="block text-xs text-ink-mute">{SOURCE_LABEL[b.source]}</span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <StatusSelect booking={b} onChange={changeStatus} />
                          </td>
                        </tr>
                        {open && (
                          <tr className="bg-linen">
                            <td colSpan={6} className="px-4 pb-5 pt-1">
                              <div className="animate-rise-in">
                                <BookingDetails booking={b} />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards on phones */}
          <ul className="space-y-3 md:hidden">
            {rows.map((b) => {
              const open = expanded === b.id;
              return (
                <li key={b.id} className={`card overflow-hidden transition-shadow duration-200 ${open ? "shadow-[0_14px_32px_-20px_rgba(31,61,43,0.4)]" : ""}`}>
                  <button type="button" onClick={() => toggle(b.id)} aria-expanded={open} className="block w-full p-4 pb-3 text-left">
                    <span className="flex items-start justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="num inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-soft text-sm font-semibold text-forest-deep">
                          {initials(b.guestName)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-ink">{b.guestName}</span>
                          <span className="block truncate text-sm text-ink-soft">{cottageName(b.cottageId)}</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="num block font-semibold text-ink">{money(b.totalUSD)}</span>
                        <span className="num block text-xs text-ink-mute">{b.code}</span>
                      </span>
                    </span>
                    <Specs
                      className="mt-3"
                      items={[
                        <span key="d" className="num">{formatRange(b.checkIn, b.checkOut)}</span>,
                        <span key="n" className="num">{diffDays(b.checkIn, b.checkOut)}n</span>,
                        <span key="g" className="num">{b.guests} guests</span>,
                      ]}
                    />
                    <Specs className="mt-0.5" items={[PAYMENT_LABEL[b.paymentMethod], SOURCE_LABEL[b.source]]} />
                  </button>
                  <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-2.5">
                    <StatusSelect booking={b} onChange={changeStatus} />
                    <button type="button" onClick={() => toggle(b.id)} className="btn btn-ghost btn-sm min-h-10" aria-expanded={open}>
                      {open ? "Hide" : "Details"}
                      <Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {open && (
                    <div className="animate-rise-in border-t border-hairline bg-linen p-3">
                      <BookingDetails booking={b} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  extra,
}: {
  icon: IconName;
  label: string;
  value: ReactNode;
  sub: string;
  extra?: ReactNode;
}) {
  return (
    <div className="card lift flex min-w-0 flex-col p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-soft text-forest">
          <Icon name={icon} className="h-3.5 w-3.5" />
        </span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-3 truncate text-2xl font-semibold text-ink sm:text-[1.7rem]">{value}</p>
      <p className="mt-1 truncate text-xs text-ink-mute">{sub}</p>
      {extra}
    </div>
  );
}

/** Tiny 14-night bar chart for the occupancy tile. */
function OccupancyBars({ nights, total }: { nights: NightRow[]; total: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="mt-3 flex h-8 items-end gap-[3px]" aria-hidden>
      {nights.map((n, i) => {
        const pct = total ? ((n.booked + n.blocked * 0.5) / total) * 100 : 0;
        return (
          <span key={n.iso} className="flex h-full flex-1 items-end rounded-[3px] bg-stone">
            <span
              className={`w-full rounded-[3px] ${n.booked === total ? "bg-ember" : "bg-forest"} transition-[height] duration-500 ease-out`}
              style={{ height: inView ? `${Math.max(pct, 6)}%` : "0%", transitionDelay: `${i * 30}ms`, opacity: pct ? 1 : 0.25 }}
            />
          </span>
        );
      })}
    </div>
  );
}

/** Cottage × night grid for the next two weeks. */
function NightGrid({ nights }: { nights: NightRow[] }) {
  const { cottages, today } = useResort();
  const { ref, inView } = useInView<HTMLDivElement>();
  const tonightBooked = nights[0]?.booked ?? 0;

  return (
    <div ref={ref} className="card mb-6 p-3 sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <p className="eyebrow">Next 14 nights</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            <span className="num font-semibold text-ink">{tonightBooked}</span> of <span className="num">{cottages.length}</span> cottages occupied tonight
          </p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-mute">
          <LegendDot className="bg-forest" label="Booked" />
          <LegendDot className="border border-ember/30" style={STRIPES} label="Blocked" />
          <LegendDot className="bg-stone" label="Free" />
        </div>
      </div>

      <div className="grid grid-cols-[3.75rem_repeat(14,minmax(0,1fr))] gap-[3px] sm:grid-cols-[6.5rem_repeat(14,minmax(0,1fr))] sm:gap-1">
        <span />
        {nights.map((n) => {
          const isToday = n.iso === today;
          const weekend = weekdayOf(n.iso) === 5 || weekdayOf(n.iso) === 6;
          return (
            <span
              key={n.iso}
              className={`num flex flex-col items-center pb-1 text-[0.6rem] leading-tight sm:text-[0.68rem] ${isToday ? "font-bold text-ember" : weekend ? "text-ink-soft" : "text-ink-mute"}`}
              title={formatDate(n.iso, { year: true })}
            >
              <span>{WEEKDAYS_SHORT[weekdayOf(n.iso)].slice(0, 1)}</span>
              <span>{Number(n.iso.slice(8))}</span>
            </span>
          );
        })}

        {cottages.map((c, row) => (
          <Fragment key={c.id}>
            <span className="flex items-center truncate pr-1 text-[0.68rem] font-semibold text-ink-soft sm:text-xs" title={c.name}>
              <span className="truncate sm:hidden">{cottageShort(c.id)}</span>
              <span className="hidden truncate sm:inline">{c.name.replace(/ (Cottage|Villa|Pavilion|Loft|Banda)$/, "")}</span>
            </span>
            {nights.map((n, col) => {
              const s = n.statuses[row];
              const prev = col > 0 ? nights[col - 1].statuses[row] : null;
              const startsBooking = s?.kind === "booked" && !(prev?.kind === "booked" && prev.booking.id === s.booking.id);
              const label =
                s?.kind === "booked"
                  ? `${c.name}, ${formatDate(n.iso)}: ${s.booking.guestName} (${s.booking.code})`
                  : s?.kind === "blocked"
                    ? `${c.name}, ${formatDate(n.iso)}: blocked, ${s.block.reason}`
                    : `${c.name}, ${formatDate(n.iso)}: free`;
              return (
                <span
                  key={n.iso}
                  title={label}
                  aria-label={label}
                  role="img"
                  className={`relative flex h-7 items-center justify-center overflow-hidden rounded-[5px] transition-[transform,opacity] duration-300 ease-out sm:h-8 ${
                    s?.kind === "booked" ? "bg-forest text-white" : s?.kind === "blocked" ? "border border-ember/25" : "bg-stone"
                  }`}
                  style={{
                    ...(s?.kind === "blocked" ? STRIPES : null),
                    transform: inView ? "none" : "scaleY(0.3)",
                    opacity: inView ? 1 : 0,
                    transitionDelay: `${col * 22 + row * 30}ms`,
                  }}
                >
                  {startsBooking && s?.kind === "booked" && (
                    <span className="num hidden text-[0.6rem] font-semibold sm:inline">{initials(s.booking.guestName)}</span>
                  )}
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function LegendDot({ className, label, style }: { className: string; label: string; style?: CSSProperties }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2.5 w-2.5 rounded-[3px] ${className}`} style={style} aria-hidden />
      {label}
    </span>
  );
}

function StatusSelect({ booking, onChange }: { booking: Booking; onChange: (id: string, s: BookingStatus) => void }) {
  return (
    <label className="relative inline-flex items-center">
      <span className="pointer-events-none absolute left-2.5">
        <Dot className={`${STATUS_META[booking.status].dot} transition-colors duration-200`} />
      </span>
      <span className="sr-only">Status for {booking.code}</span>
      <select
        value={booking.status}
        onChange={(e) => onChange(booking.id, e.target.value as BookingStatus)}
        className="field min-h-10 w-auto py-1.5 pl-6 pr-7 text-xs font-semibold"
      >
        {BOOKING_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BookingDetails({ booking: b }: { booking: Booking }) {
  const addonNames = b.addons.map((id) => ADDONS.find((a) => a.id === id)?.name ?? id);
  const notify = [b.notifyEmail ? "Email" : null, b.notifySms ? "SMS" : null].filter(Boolean).join(" & ");
  return (
    <div className="grid gap-4 rounded-xl border border-hairline bg-canvas p-4 sm:grid-cols-2 lg:grid-cols-4">
      <Detail label="Email">
        {b.email ? (
          <a href={`mailto:${b.email}`} className="text-forest underline-offset-2 hover:underline">
            {b.email}
          </a>
        ) : (
          <span className="text-ink-mute">Not provided</span>
        )}
      </Detail>
      <Detail label="Phone">
        <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="num text-forest underline-offset-2 hover:underline">
          {b.phone}
        </a>
      </Detail>
      <Detail label="Add-ons">{addonNames.length ? addonNames.join(", ") : <span className="text-ink-mute">None</span>}</Detail>
      <Detail label="Booked on">
        <span className="num">{formatTimestamp(b.createdAt)}</span>
      </Detail>
      <div className="sm:col-span-2 lg:col-span-3">
        <Detail label="Special requests">{b.specialRequests ? b.specialRequests : <span className="text-ink-mute">None</span>}</Detail>
      </div>
      <Detail label="Confirmations">{notify || <span className="text-ink-mute">Off</span>}</Detail>
    </div>
  );
}
