"use client";

import { useState, type FormEvent } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Specs } from "@/components/ui/Overlay";
import {
  ADDONS,
  addDays,
  diffDays,
  formatRange,
  nightsBetween,
  quoteStay,
  type Booking,
  type PaymentMethod,
} from "@/data/resortStorage";
import { Dot, Icon, Notice, PAYMENT_LABEL, ViewHeader } from "./adminUi";

type FormState = {
  cottageId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  source: "walk-in" | "phone";
  payment: PaymentMethod;
  status: "confirmed" | "checked-in";
  addons: string[];
  notes: string;
};

const PAYMENTS = Object.keys(PAYMENT_LABEL) as PaymentMethod[];

export function WalkInView({ onViewLedger }: { onViewLedger: () => void }) {
  const { cottages, today, rateFor, isRangeAvailable, nightStatus, addBooking, money } = useResort();
  const blank = (): FormState => ({
    cottageId: cottages[0].id,
    checkIn: today,
    checkOut: addDays(today, 1),
    guests: 2,
    name: "",
    phone: "",
    email: "",
    source: "walk-in",
    payment: "cash",
    status: "checked-in",
    addons: [],
    notes: "",
  });
  const [f, setF] = useState<FormState>(blank);
  const [errors, setErrors] = useState<string[]>([]);
  const [created, setCreated] = useState<Booking | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));

  const cottage = cottages.find((c) => c.id === f.cottageId) ?? cottages[0];
  const nights = diffDays(f.checkIn, f.checkOut);
  const datesValid = nights > 0 && f.checkIn >= today;
  const available = datesValid && isRangeAvailable(f.cottageId, f.checkIn, f.checkOut);
  const overCapacity = f.guests > cottage.guests;
  const quote = datesValid
    ? quoteStay({ baseRateUSD: rateFor(f.cottageId), checkIn: f.checkIn, checkOut: f.checkOut, guests: f.guests, addonIds: f.addons })
    : null;

  const clash = datesValid && !available
    ? nightsBetween(f.checkIn, f.checkOut)
        .map((n) => nightStatus(f.cottageId, n))
        .find(Boolean)
    : null;

  const onCheckIn = (v: string) => {
    setF((p) => ({
      ...p,
      checkIn: v,
      checkOut: v >= p.checkOut ? addDays(v, 1) : p.checkOut,
      status: v > today ? "confirmed" : p.status,
    }));
  };

  const toggleAddon = (id: string) =>
    setF((p) => ({ ...p, addons: p.addons.includes(id) ? p.addons.filter((a) => a !== id) : [...p.addons, id] }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!f.name.trim()) errs.push("Enter the guest's name.");
    if (f.phone.replace(/\D/g, "").length < 7) errs.push("Enter a phone number we can reach the guest on.");
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) errs.push("Check the email address, or leave it empty.");
    if (!datesValid) errs.push("Check-out must be after check-in, and check-in can't be in the past.");
    else if (!available) errs.push(`${cottage.name} isn't free for those nights.`);
    if (overCapacity) errs.push(`${cottage.name} sleeps up to ${cottage.guests} guests.`);
    setErrors(errs);
    if (errs.length || !quote) return;

    const booking = addBooking({
      cottageId: f.cottageId,
      checkIn: f.checkIn,
      checkOut: f.checkOut,
      guests: f.guests,
      guestName: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      addons: f.addons,
      specialRequests: f.notes.trim() || undefined,
      totalUSD: quote.totalUSD,
      paymentMethod: f.payment,
      status: f.status,
      source: f.source,
      notifyEmail: !!f.email.trim(),
      notifySms: true,
    });
    setCreated(booking);
  };

  const reset = () => {
    setF(blank());
    setErrors([]);
    setCreated(null);
  };

  if (created) {
    return (
      <div>
        <ViewHeader eyebrow="Front desk" title="Booking created" />
        <div className="card mx-auto max-w-xl p-6 text-center sm:p-8">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-forest-soft text-forest">
            <Icon name="check" className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm text-ink-soft">Confirmation code</p>
          <p className="num mt-1 text-3xl font-semibold tracking-wide text-ink">{created.code}</p>
          <p className="mt-4 font-semibold text-ink">{created.guestName}</p>
          <Specs
            className="mt-1 justify-center"
            items={[
              cottages.find((c) => c.id === created.cottageId)?.name ?? "",
              <span key="d" className="num">{formatRange(created.checkIn, created.checkOut)}</span>,
              <span key="t" className="num">{money(created.totalUSD)}</span>,
            ]}
          />
          <p className="mt-4 text-sm text-ink-mute">
            {created.notifyEmail ? "Confirmation sent by SMS and email." : "Confirmation sent by SMS."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={reset} className="btn btn-primary">
              <Icon name="plus" /> Add another booking
            </button>
            <button type="button" onClick={onViewLedger} className="btn btn-secondary">
              View in ledger
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ViewHeader
        eyebrow="Front desk"
        title="Walk-in & phone booking"
        description="Add a reservation for a guest at reception or on the phone. Availability and price update as you type."
      />

      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
        <div className="card space-y-6 p-4 sm:p-6">
          <fieldset className="grid gap-4 sm:grid-cols-2">
            <legend className="eyebrow mb-3">Stay</legend>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="wi-cottage">
                Cottage
              </label>
              <select id="wi-cottage" className="field" value={f.cottageId} onChange={(e) => set("cottageId", e.target.value)}>
                {cottages.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · sleeps {c.guests}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="wi-in">
                Check-in
              </label>
              <input id="wi-in" type="date" className="field num" min={today} value={f.checkIn} onChange={(e) => e.target.value && onCheckIn(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="wi-out">
                Check-out
              </label>
              <input
                id="wi-out"
                type="date"
                className="field num"
                min={addDays(f.checkIn, 1)}
                value={f.checkOut}
                onChange={(e) => e.target.value && set("checkOut", e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="wi-guests">
                Guests
              </label>
              <input
                id="wi-guests"
                type="number"
                min={1}
                max={12}
                className={`field num ${overCapacity ? "border-ember" : ""}`}
                value={f.guests}
                onChange={(e) => set("guests", Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
              />
              {overCapacity && <p className="mt-1 text-xs text-ember-deep">Sleeps up to {cottage.guests}.</p>}
            </div>
            <div>
              <label className="label" htmlFor="wi-status">
                Status
              </label>
              <select id="wi-status" className="field" value={f.status} onChange={(e) => set("status", e.target.value as FormState["status"])}>
                <option value="confirmed">Confirmed</option>
                <option value="checked-in" disabled={f.checkIn > today}>
                  Checked in now
                </option>
              </select>
            </div>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-hairline pt-5 sm:grid-cols-2">
            <legend className="eyebrow mb-3 pt-5">Guest</legend>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="wi-name">
                Full name
              </label>
              <input id="wi-name" className="field" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" />
            </div>
            <div>
              <label className="label" htmlFor="wi-phone">
                Phone
              </label>
              <input
                id="wi-phone"
                type="tel"
                className="field num"
                value={f.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+256 7__ ___ ___"
              />
            </div>
            <div>
              <label className="label" htmlFor="wi-email">
                Email <span className="font-normal text-ink-mute">(optional)</span>
              </label>
              <input id="wi-email" type="email" className="field" value={f.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="wi-source">
                Booked via
              </label>
              <select id="wi-source" className="field" value={f.source} onChange={(e) => set("source", e.target.value as FormState["source"])}>
                <option value="walk-in">Walk-in at reception</option>
                <option value="phone">Phone call</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="wi-payment">
                Payment
              </label>
              <select id="wi-payment" className="field" value={f.payment} onChange={(e) => set("payment", e.target.value as PaymentMethod)}>
                {PAYMENTS.map((p) => (
                  <option key={p} value={p}>
                    {PAYMENT_LABEL[p]}
                  </option>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset className="border-t border-hairline pt-5">
            <legend className="eyebrow mb-3 pt-5">Add-ons</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {ADDONS.map((a) => {
                const on = f.addons.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      on ? "border-forest/40 bg-forest-soft/60" : "border-hairline hover:border-hairline-strong"
                    }`}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggleAddon(a.id)} className="mt-0.5 h-4 w-4 accent-[#20402e]" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{a.name}</span>
                      <span className="num text-xs text-ink-mute">
                        {money(a.priceUSD)} / {a.unit === "stay" ? "stay" : a.unit === "night" ? "night" : "guest"}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="border-t border-hairline pt-5">
            <label className="label" htmlFor="wi-notes">
              Notes & special requests
            </label>
            <textarea id="wi-notes" rows={3} className="field resize-y" value={f.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-0">
          <div className="card overflow-hidden">
            <Photo src={cottage.images[0]} alt={cottage.name} className="h-36 w-full" sizes="(min-width: 1024px) 400px, 100vw" />
            <div className="p-4 sm:p-5">
              <p className="display text-xl text-ink">{cottage.name}</p>
              <Specs className="mt-1" items={cottage.specs.slice(0, 3)} />

              <div className="mt-4 flex items-center gap-2 text-sm">
                {!datesValid ? (
                  <>
                    <Dot className="bg-ink-mute" />
                    <span className="text-ink-mute">Choose valid dates</span>
                  </>
                ) : available ? (
                  <>
                    <Dot className="bg-forest" />
                    <span className="font-medium text-forest">
                      Available · <span className="num">{formatRange(f.checkIn, f.checkOut)}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Dot className="bg-ember" />
                    <span className="font-medium text-ember-deep">
                      Not available
                      {clash?.kind === "booked" && <> · booked by {clash.booking.guestName}</>}
                      {clash?.kind === "blocked" && <> · {clash.block.reason}</>}
                    </span>
                  </>
                )}
              </div>

              {quote && (
                <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
                  <Line label={`${quote.nights} ${quote.nights === 1 ? "night" : "nights"}`} value={money(quote.lodgingUSD)} />
                  {quote.addonLines.map((l) => (
                    <Line key={l.addon.id} label={`${l.addon.name}${l.qty > 1 ? ` × ${l.qty}` : ""}`} value={money(l.totalUSD)} />
                  ))}
                  <Line label="VAT 18%" value={money(quote.taxUSD)} muted />
                  <div className="flex items-baseline justify-between border-t border-hairline pt-3">
                    <dt className="font-semibold text-ink">Total</dt>
                    <dd className="num text-xl font-semibold text-ink">{money(quote.totalUSD)}</dd>
                  </div>
                </dl>
              )}
            </div>
          </div>

          {errors.length > 0 && (
            <Notice tone="warn">
              <ul className="list-disc space-y-0.5 pl-4">
                {errors.map((er) => (
                  <li key={er}>{er}</li>
                ))}
              </ul>
            </Notice>
          )}

          <button type="submit" className="btn btn-primary w-full py-3" disabled={!datesValid}>
            Create booking{quote ? ` · ${money(quote.totalUSD)}` : ""}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Line({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={`min-w-0 truncate ${muted ? "text-ink-mute" : "text-ink-soft"}`}>{label}</dt>
      <dd className={`num shrink-0 ${muted ? "text-ink-mute" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
