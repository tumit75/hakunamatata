"use client";

import { Fragment, useMemo, useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { Specs } from "@/components/ui/Overlay";
import {
  ADDONS,
  addDays,
  diffDays,
  formatRange,
  formatTimestamp,
  type Booking,
  type BookingSource,
  type BookingStatus,
} from "@/data/resortStorage";
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
  type IconName,
} from "./adminUi";

const SOURCES = Object.keys(SOURCE_LABEL) as BookingSource[];

export function LedgerView() {
  const { state, today, money, cottages, nightStatus, setBookingStatus } = useResort();
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

  return (
    <div>
      <ViewHeader
        eyebrow="Front desk"
        title="Bookings ledger"
        description="Every reservation from the website, walk-ins, phone and synced channels. Click a booking for guest details; change status inline."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon="users" label="In-house tonight" value={String(kpis.inHouse)} sub={`${kpis.inHouseGuests} guests on property`} />
        <Kpi icon="arrival" label="Arrivals, next 7 days" value={String(kpis.arrivals)} sub={`${kpis.arrivalGuests} guests expected`} />
        <Kpi icon="chart" label="Occupancy, next 30 nights" value={`${kpis.occupancy}%`} sub={`${kpis.booked} of ${kpis.total} cottage-nights`} />
        <Kpi icon="wallet" label="Upcoming revenue" value={money(kpis.revenue)} sub={`${kpis.revenueCount} active stays, incl. VAT`} />
      </div>

      <div className="card mb-4 grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
        <label className="relative block sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Search bookings</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest, code or phone"
            className="field pl-9"
          />
        </label>
        <select className="field lg:w-40" value={status} onChange={(e) => setStatus(e.target.value as "all" | BookingStatus)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
        <select className="field lg:w-48" value={cottage} onChange={(e) => setCottage(e.target.value)} aria-label="Filter by cottage">
          <option value="all">All cottages</option>
          {cottages.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="field lg:w-40" value={source} onChange={(e) => setSource(e.target.value as "all" | BookingSource)} aria-label="Filter by source">
          <option value="all">All sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex items-center justify-between text-sm text-ink-mute">
        <span>
          <span className="num text-ink">{rows.length}</span> of <span className="num">{state.bookings.length}</span> bookings, sorted by check-in
        </span>
        {filtersActive && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="display text-xl text-ink">No bookings match</p>
          <p className="mt-1 text-sm text-ink-mute">Try a different name, code or filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-sm">
                <thead className="bg-linen text-[0.7rem] uppercase tracking-[0.1em] text-ink-mute">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Guest</th>
                    <th className="px-4 py-3 font-semibold">Cottage</th>
                    <th className="px-4 py-3 font-semibold">Dates</th>
                    <th className="px-4 py-3 font-semibold">Nights · guests</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold">Payment · source</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => {
                    const open = expanded === b.id;
                    return (
                      <Fragment key={b.id}>
                        <tr
                          onClick={() => toggle(b.id)}
                          className={`cursor-pointer border-t border-hairline transition-colors hover:bg-linen ${open ? "bg-linen" : ""} ${
                            b.status === "cancelled" ? "text-ink-mute" : ""
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
                              className="num inline-flex items-center gap-1.5 font-semibold text-ink"
                            >
                              <Icon name="chevronDown" className={`h-3.5 w-3.5 text-ink-mute transition-transform ${open ? "rotate-180" : ""}`} />
                              {b.code}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-medium text-ink">{b.guestName}</td>
                          <td className="px-4 py-3 text-ink-soft">{cottageName(b.cottageId)}</td>
                          <td className="num whitespace-nowrap px-4 py-3 text-ink-soft">{formatRange(b.checkIn, b.checkOut)}</td>
                          <td className="num px-4 py-3 text-ink-soft">
                            {diffDays(b.checkIn, b.checkOut)} · {b.guests}
                          </td>
                          <td className="num whitespace-nowrap px-4 py-3 text-right font-semibold text-ink">{money(b.totalUSD)}</td>
                          <td className="px-4 py-3 text-ink-soft">
                            {PAYMENT_LABEL[b.paymentMethod]}
                            <span className="mx-1 text-ink-mute/60">·</span>
                            {SOURCE_LABEL[b.source]}
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <StatusSelect booking={b} onChange={setBookingStatus} />
                          </td>
                        </tr>
                        {open && (
                          <tr className="bg-linen">
                            <td colSpan={8} className="px-4 pb-5 pt-1">
                              <BookingDetails booking={b} />
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

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {rows.map((b) => {
              const open = expanded === b.id;
              return (
                <li key={b.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => toggle(b.id)} aria-expanded={open} className="min-w-0 flex-1 text-left">
                      <p className="num text-xs font-semibold text-ink-mute">{b.code}</p>
                      <p className="mt-0.5 truncate font-semibold text-ink">{b.guestName}</p>
                      <p className="truncate text-sm text-ink-soft">{cottageName(b.cottageId)}</p>
                    </button>
                    <p className="num shrink-0 text-right font-semibold text-ink">{money(b.totalUSD)}</p>
                  </div>
                  <Specs
                    className="mt-2"
                    items={[
                      <span key="d" className="num">{formatRange(b.checkIn, b.checkOut)}</span>,
                      <span key="n" className="num">{diffDays(b.checkIn, b.checkOut)} nights</span>,
                      <span key="g" className="num">{b.guests} guests</span>,
                    ]}
                  />
                  <Specs className="mt-0.5" items={[PAYMENT_LABEL[b.paymentMethod], SOURCE_LABEL[b.source]]} />
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-hairline pt-3">
                    <StatusSelect booking={b} onChange={setBookingStatus} />
                    <button type="button" onClick={() => toggle(b.id)} className="btn btn-ghost btn-sm">
                      {open ? "Hide" : "Details"}
                      <Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {open && (
                    <div className="mt-3 border-t border-hairline pt-3">
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

function Kpi({ icon, label, value, sub }: { icon: IconName; label: string; value: string; sub: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs font-semibold text-ink-mute">
        <Icon name={icon} className="h-4 w-4 text-forest" />
        <span className="truncate">{label}</span>
      </div>
      <p className="num mt-2 truncate text-2xl font-semibold text-ink sm:text-[1.7rem]">{value}</p>
      <p className="mt-1 truncate text-xs text-ink-mute">{sub}</p>
    </div>
  );
}

function StatusSelect({ booking, onChange }: { booking: Booking; onChange: (id: string, s: BookingStatus) => void }) {
  return (
    <label className="inline-flex items-center gap-2">
      <Dot className={STATUS_META[booking.status].dot} />
      <span className="sr-only">Status for {booking.code}</span>
      <select
        value={booking.status}
        onChange={(e) => onChange(booking.id, e.target.value as BookingStatus)}
        className="field w-auto py-1.5 pl-2 pr-7 text-xs font-semibold"
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
        <Detail label="Special requests">
          {b.specialRequests ? b.specialRequests : <span className="text-ink-mute">None</span>}
        </Detail>
      </div>
      <Detail label="Confirmations">{notify || <span className="text-ink-mute">Off</span>}</Detail>
    </div>
  );
}
