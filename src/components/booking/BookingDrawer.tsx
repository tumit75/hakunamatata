"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useResort, type BookingRequest } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Drawer, Segmented, Specs } from "@/components/ui/Overlay";
import { AvailabilityCalendar } from "@/components/cottages/AvailabilityCalendar";
import {
  ADDONS,
  RESORT_EMAIL,
  RESORT_GPS,
  RESORT_PHONE,
  addDays,
  addonQty,
  diffDays,
  formatDate,
  formatMoney,
  formatRange,
  getCottage,
  quoteStay,
  type AddonUnit,
  type Booking,
  type Cottage,
  type PaymentMethod,
  type StayQuote,
} from "@/data/resortStorage";

/* ------------------------------------------------------------------ */
/* Shared pieces (also used by CottageDetail)                          */
/* ------------------------------------------------------------------ */

export function Stepper({
  label,
  value,
  min = 1,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-ink-soft">{label}</span>
      <div className="inline-flex items-center rounded-[10px] border border-hairline-strong bg-white">
        <button
          type="button"
          className="h-9 w-9 rounded-l-[10px] text-lg text-ink-soft transition hover:bg-stone disabled:opacity-30"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Fewer ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className="num w-8 text-center text-sm font-semibold" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          className="h-9 w-9 rounded-r-[10px] text-lg text-ink-soft transition hover:bg-stone disabled:opacity-30"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`More ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

const UNIT_LABEL: Record<AddonUnit, string> = { stay: "per stay", night: "per night", guest: "per guest" };

/** Itemised price: nights grouped by rate, add-ons, VAT, total, other-currency equivalent. */
export function PriceBreakdown({ quote }: { quote: StayQuote }) {
  const { money, currency } = useResort();
  const groups: { rate: number; count: number }[] = [];
  for (const n of quote.nightly) {
    const g = groups.find((x) => x.rate === n.rateUSD);
    if (g) g.count += 1;
    else groups.push({ rate: n.rateUSD, count: 1 });
  }
  const other = currency === "USD" ? formatMoney(quote.totalUSD, "UGX") : formatMoney(quote.totalUSD, "USD");

  return (
    <dl className="space-y-2 text-sm">
      {groups.map((g) => (
        <div key={g.rate} className="flex justify-between gap-3">
          <dt className="text-ink-soft">
            <span className="num">{g.count}</span> {g.count === 1 ? "night" : "nights"} ×{" "}
            <span className="num">{money(g.rate)}</span>
          </dt>
          <dd className="num text-ink">{money(g.rate * g.count)}</dd>
        </div>
      ))}
      {quote.addonLines.map((l) => (
        <div key={l.addon.id} className="flex justify-between gap-3">
          <dt className="text-ink-soft">
            {l.addon.name}
            {l.qty > 1 && <span className="num text-ink-mute"> × {l.qty}</span>}
          </dt>
          <dd className="num text-ink">{money(l.totalUSD)}</dd>
        </div>
      ))}
      <div className="flex justify-between gap-3">
        <dt className="text-ink-soft">VAT (18%)</dt>
        <dd className="num text-ink">{money(quote.taxUSD)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-hairline pt-3">
        <dt className="font-semibold text-ink">Total</dt>
        <dd className="num text-lg font-semibold text-ink">{money(quote.totalUSD)}</dd>
      </div>
      <p className="text-right text-xs text-ink-mute">
        ≈ <span className="num">{other}</span>
      </p>
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

type Step = 1 | 2 | 3 | 4 | 5;
type PayMethod = "mtn" | "airtel" | "card";

const STEPS = ["Stay", "Add-ons", "Details", "Payment", "Confirmed"] as const;
const TITLES: Record<Step, string> = {
  1: "Choose your stay",
  2: "Make it yours",
  3: "Guest details",
  4: "Payment",
  5: "You're all set",
};
const ARRIVAL_TIMES = ["12:00 – 14:00", "14:00 – 16:00", "16:00 – 18:00", "18:00 – 20:00", "After 20:00"];
const MTN_PREFIXES = ["077", "078", "076"];
const AIRTEL_PREFIXES = ["070", "075", "074"];

const METHOD_LABEL: Record<PaymentMethod, string> = {
  mtn: "MTN Mobile Money",
  airtel: "Airtel Money",
  card: "Card",
  cash: "Cash",
  "pay-on-arrival": "Pay on arrival",
};

function normalizeUgPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("256")) d = `0${d.slice(3)}`;
  else if (d.length === 9 && d.startsWith("7")) d = `0${d}`;
  return d;
}

function networkOf(digits: string): PayMethod | null {
  const p = digits.slice(0, 3);
  if (MTN_PREFIXES.includes(p)) return "mtn";
  if (AIRTEL_PREFIXES.includes(p)) return "airtel";
  return null;
}

function prettyPhone(d: string): string {
  return d.length === 10 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : d;
}

function cardBrand(digits: string): "Visa" | "Mastercard" | null {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  return null;
}

function luhnValid(digits: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

function formatCardNumber(raw: string): string {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function expiryValid(exp: string, today: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(exp);
  if (!m) return false;
  const mm = Number(m[1]);
  const yy = 2000 + Number(m[2]);
  if (mm < 1 || mm > 12) return false;
  const ty = Number(today.slice(0, 4));
  const tm = Number(today.slice(5, 7));
  return yy > ty || (yy === ty && mm >= tm);
}

/** Random payment reference / card token. Event handlers only. */
function randomPaymentRef(prefix: string): string {
  return `${prefix}${Math.floor(100000000 + Math.random() * 899999999)}`;
}
function randomCardToken(): string {
  return `tok_${Math.random().toString(36).slice(2, 12)}`;
}

function ugxLabel(usd: number): string {
  return formatMoney(usd, "UGX").replace("USh", "UGX");
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircle({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.7 2.7L16 9.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */

export function BookingDrawer() {
  const { booking } = useResort();
  if (!booking.open) return null;
  // Unmounts on close, so every open starts a fresh flow.
  const key = [booking.cottageId, booking.checkIn, booking.checkOut, booking.guests].join("|");
  return <BookingFlow key={key} prefill={booking} />;
}

function BookingFlow({ prefill }: { prefill: BookingRequest }) {
  const {
    closeBooking,
    cottages,
    rateFor,
    money,
    isRangeAvailable,
    addBooking,
    openConcierge,
    today,
  } = useResort();

  const [step, setStep] = useState<Step>(1);
  const [cottageId, setCottageId] = useState(prefill.cottageId ?? "");
  const [range, setRange] = useState<{ checkIn?: string; checkOut?: string }>(() => {
    const { checkIn, checkOut, cottageId: cid } = prefill;
    if (!checkIn || !checkOut || diffDays(checkIn, checkOut) <= 0 || checkIn < today) return {};
    if (cid && !isRangeAvailable(cid, checkIn, checkOut)) return {};
    return { checkIn, checkOut };
  });
  const [guests, setGuests] = useState(prefill.guests ?? 2);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    arrival: ARRIVAL_TIMES[1],
    requests: "",
    notifyEmail: true,
    notifySms: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [method, setMethod] = useState<PayMethod>("mtn");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoStage, setMomoStage] = useState<"idle" | "prompt" | "processing">("idle");
  const [pin, setPin] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [cardStage, setCardStage] = useState<"idle" | "processing">("idle");

  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [receipt, setReceipt] = useState("");

  const topRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const cottage = cottageId ? getCottage(cottageId) : undefined;
  const cap = cottage?.guests ?? 6;
  const effGuests = Math.min(guests, cap);
  const { checkIn, checkOut } = range;
  const datesValid = !!checkIn && !!checkOut && diffDays(checkIn, checkOut) > 0;
  const quote =
    cottage && checkIn && checkOut && datesValid
      ? quoteStay({ baseRateUSD: rateFor(cottage.id), checkIn, checkOut, guests: effGuests, addonIds })
      : null;
  const available = !!cottage && !!checkIn && !!checkOut && datesValid && isRangeAvailable(cottage.id, checkIn, checkOut);
  const paying = momoStage === "processing" || cardStage === "processing";

  const goTo = (s: Step) => {
    setError(null);
    setStep(s);
    topRef.current?.scrollIntoView({ block: "start" });
  };

  function validate(s: Step): string | null {
    if (s === 1) {
      if (!cottage) return "Choose a cottage to continue.";
      if (!datesValid) return "Select your check-in and check-out dates in the calendar.";
      if (!available) return "Some of those nights are taken. Please choose other dates.";
    }
    if (s === 3) {
      if (details.name.trim().length < 2) return "Please enter the lead guest's full name.";
      if (!/^\S+@\S+\.\S+$/.test(details.email.trim())) return "Please enter a valid email address.";
      if (details.phone.replace(/\D/g, "").length < 9) return "Please enter a phone number we can reach you on.";
    }
    return null;
  }

  function next() {
    const e = validate(step);
    if (e) {
      setError(e);
      return;
    }
    if (step === 3) {
      const d = normalizeUgPhone(details.phone);
      if (!momoPhone) setMomoPhone(details.phone);
      const net = networkOf(d);
      if (net) setMethod(net);
    }
    goTo((step + 1) as Step);
  }

  function selectCottage(c: Cottage) {
    setCottageId(c.id);
    setGuests((g) => Math.min(g, c.guests));
    setError(null);
    if (checkIn && checkOut && !isRangeAvailable(c.id, checkIn, checkOut)) {
      setRange({});
      setNotice(`Your dates aren't free in ${c.name}. Pick new dates below.`);
    } else setNotice(null);
  }

  function changeMethod(m: PayMethod) {
    setMethod(m);
    setMomoStage("idle");
    setPin("");
    setError(null);
  }

  function finalize(pm: PaymentMethod, receiptText: string) {
    if (!cottage || !quote || !checkIn || !checkOut) return;
    if (!isRangeAvailable(cottage.id, checkIn, checkOut)) {
      setMomoStage("idle");
      setCardStage("idle");
      setRange({});
      setStep(1);
      setError("Sorry, those dates were just taken. Please choose new dates. You have not been charged.");
      return;
    }
    const created = addBooking({
      cottageId: cottage.id,
      checkIn,
      checkOut,
      guests: effGuests,
      guestName: details.name.trim(),
      email: details.email.trim(),
      phone: details.phone.trim(),
      addons: addonIds,
      specialRequests: [`Arrival ${details.arrival}`, details.requests.trim()].filter(Boolean).join(". "),
      totalUSD: quote.totalUSD,
      paymentMethod: pm,
      status: "confirmed",
      source: "website",
      notifyEmail: details.notifyEmail,
      notifySms: details.notifySms,
    });
    setConfirmed(created);
    setReceipt(receiptText);
    goTo(5);
  }

  function approveMomo() {
    if (pin.length !== 4) return;
    setMomoStage("processing");
    const net = method === "airtel" ? "airtel" : "mtn";
    const phone = prettyPhone(normalizeUgPhone(momoPhone));
    const ref = randomPaymentRef(net === "mtn" ? "MP" : "AM");
    timers.current.push(
      window.setTimeout(() => finalize(net, `${METHOD_LABEL[net]} · ${phone} · Ref ${ref}`), 1400),
    );
  }

  function payCard() {
    const digits = card.number.replace(/\D/g, "");
    setCardStage("processing");
    const token = randomCardToken();
    const brand = cardBrand(digits) ?? "Card";
    timers.current.push(
      window.setTimeout(() => finalize("card", `${brand} •••• ${digits.slice(-4)} · ${token}`), 1400),
    );
  }

  const footer =
    step === 5 ? (
      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={closeBooking}>
          Done
        </button>
      </div>
    ) : (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {quote ? (
            <>
              <p className="num text-lg font-semibold text-ink">{money(quote.totalUSD)}</p>
              <p className="text-xs text-ink-mute">
                <span className="num">{quote.nights}</span> {quote.nights === 1 ? "night" : "nights"} · incl. VAT
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-mute">Choose a cottage and dates</p>
          )}
        </div>
        <div className="flex gap-2">
          {step > 1 && (
            <button type="button" className="btn btn-secondary" onClick={() => goTo((step - 1) as Step)} disabled={paying}>
              Back
            </button>
          )}
          {step < 4 && (
            <button type="button" className="btn btn-primary" onClick={next}>
              Continue
            </button>
          )}
        </div>
      </div>
    );

  return (
    <Drawer
      open
      onClose={closeBooking}
      size="xl"
      eyebrow={step < 5 ? `Step ${step} of 4` : "Booking confirmed"}
      title={TITLES[step]}
      footer={footer}
    >
      <div ref={topRef} className="scroll-mt-6" />
      {step < 5 && <StepIndicator step={step} onJump={(s) => s < step && !paying && goTo(s)} />}

      <div className={step < 5 ? "mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]" : "mt-1"}>
        <div className="min-w-0">
          {error && (
            <p role="alert" className="mb-5 rounded-xl border border-ember/30 bg-ember-soft px-4 py-3 text-sm text-ink">
              {error}
            </p>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <div>
                <p className="label">Cottage</p>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {cottages.map((c) => {
                    const sel = c.id === cottageId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCottage(c)}
                        aria-pressed={sel}
                        className={`group overflow-hidden rounded-xl border text-left transition ${
                          sel ? "border-forest ring-2 ring-forest" : "border-hairline hover:border-hairline-strong"
                        }`}
                      >
                        <Photo
                          src={c.images[0]}
                          alt=""
                          className="aspect-[4/3]"
                          imgClassName="transition-transform duration-300 group-hover:scale-[1.04]"
                          sizes="220px"
                        />
                        <div className="p-2.5">
                          <p className="text-[13px] font-semibold leading-snug text-ink">{c.name}</p>
                          <p className="mt-0.5 text-xs text-ink-mute">
                            from <span className="num">{money(rateFor(c.id))}</span> ·{" "}
                            <span className={guests > c.guests ? "text-ember" : ""}>sleeps {c.guests}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {cottage ? (
                <div>
                  <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                    <p className="label mb-0">Dates in {cottage.name}</p>
                    <Stepper label="Guests" value={effGuests} min={1} max={cap} onChange={setGuests} />
                  </div>
                  {notice && <p className="mb-3 text-sm text-ember">{notice}</p>}
                  <div className="card p-4">
                    <AvailabilityCalendar
                      key={cottage.id}
                      cottageId={cottage.id}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onChange={(a, b) => {
                        setRange({ checkIn: a, checkOut: b });
                        setNotice(null);
                        setError(null);
                      }}
                      months={1}
                    />
                  </div>
                </div>
              ) : (
                <p className="rounded-xl bg-linen p-4 text-sm text-ink-soft">
                  Choose a cottage above to see its live calendar and prices.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">Optional extras, added to your stay and settled in one payment.</p>
              {ADDONS.map((a) => {
                const on = addonIds.includes(a.id);
                const qty = addonQty(a, quote?.nights ?? 1, effGuests);
                return (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
                      on ? "border-forest bg-forest-soft/60" : "border-hairline hover:border-hairline-strong"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-forest"
                      checked={on}
                      onChange={() =>
                        setAddonIds((ids) => (on ? ids.filter((x) => x !== a.id) : [...ids, a.id]))
                      }
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="font-semibold text-ink">{a.name}</span>
                        <span className="text-sm">
                          <span className="num text-ink">{money(a.priceUSD)}</span>{" "}
                          <span className="text-ink-mute">{UNIT_LABEL[a.unit]}</span>
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-ink-soft">{a.description}</span>
                      {on && qty > 1 && (
                        <span className="num mt-1.5 block text-xs text-ink-mute">
                          {qty} × {money(a.priceUSD)} = {money(a.priceUSD * qty)}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="bk-name">
                  Full name (lead guest)
                </label>
                <input
                  id="bk-name"
                  className="field"
                  autoComplete="name"
                  value={details.name}
                  onChange={(e) => setDetails({ ...details, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="bk-email">
                  Email
                </label>
                <input
                  id="bk-email"
                  type="email"
                  className="field"
                  autoComplete="email"
                  value={details.email}
                  onChange={(e) => setDetails({ ...details, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="bk-phone">
                  Phone
                </label>
                <input
                  id="bk-phone"
                  type="tel"
                  className="field num"
                  autoComplete="tel"
                  placeholder="+256 7XX XXX XXX"
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                />
                <p className="mt-1 text-xs text-ink-mute">Ugandan numbers start with +256. We text your voucher here.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="bk-arrival">
                  Expected arrival
                </label>
                <select
                  id="bk-arrival"
                  className="field num"
                  value={details.arrival}
                  onChange={(e) => setDetails({ ...details, arrival: e.target.value })}
                >
                  {ARRIVAL_TIMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="bk-req">
                  Special requests
                </label>
                <textarea
                  id="bk-req"
                  rows={3}
                  className="field resize-none"
                  placeholder="Dietary needs, celebrations, a baby cot…"
                  value={details.requests}
                  onChange={(e) => setDetails({ ...details, requests: e.target.value })}
                />
              </div>
              <Toggle
                label="Email confirmation"
                hint="Voucher and receipt by email"
                checked={details.notifyEmail}
                onChange={(v) => setDetails({ ...details, notifyEmail: v })}
              />
              <Toggle
                label="SMS confirmation"
                hint="Booking code and arrival reminder by text"
                checked={details.notifySms}
                onChange={(v) => setDetails({ ...details, notifySms: v })}
              />
            </div>
          )}

          {step === 4 && quote && (
            <div className="space-y-6">
              <Segmented<PayMethod>
                value={method}
                onChange={changeMethod}
                options={[
                  { value: "mtn", label: "MTN MoMo" },
                  { value: "airtel", label: "Airtel Money" },
                  { value: "card", label: "Card" },
                ]}
                className="w-full [&>button]:flex-1"
              />

              {method !== "card" ? (
                <MobileMoneyPanel
                  network={method}
                  phone={momoPhone}
                  setPhone={(v) => {
                    setMomoPhone(v);
                    setMomoStage("idle");
                  }}
                  onSwitchNetwork={changeMethod}
                  stage={momoStage}
                  pin={pin}
                  setPin={setPin}
                  amount={ugxLabel(quote.totalUSD)}
                  cottageName={cottage?.name ?? ""}
                  onSend={() => {
                    setPin("");
                    setMomoStage("prompt");
                  }}
                  onCancel={() => {
                    setMomoStage("idle");
                    setPin("");
                  }}
                  onApprove={approveMomo}
                />
              ) : (
                <CardPanel
                  card={card}
                  setCard={setCard}
                  today={today}
                  processing={cardStage === "processing"}
                  totalLabel={money(quote.totalUSD)}
                  onPay={payCard}
                />
              )}

              <div className="flex flex-col gap-2 border-t border-hairline pt-4 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <LockIcon /> Demo checkout. No real money is taken.
                </span>
                <button
                  type="button"
                  onClick={() => openConcierge("corporate")}
                  className="text-left font-semibold text-forest underline underline-offset-2 hover:text-forest-deep"
                >
                  Corporate or custom payment? Schedule a call or WhatsApp us
                </button>
              </div>
            </div>
          )}

          {step === 5 && confirmed && cottage && (
            <Confirmation booking={confirmed} cottage={cottage} receipt={receipt} />
          )}
        </div>

        {step < 5 && (
          <aside className="lg:sticky lg:top-0 lg:self-start">
            <StaySummary cottage={cottage} checkIn={checkIn} checkOut={checkOut} guests={effGuests} quote={quote} />
          </aside>
        )}
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StepIndicator({ step, onJump }: { step: Step; onJump: (s: Step) => void }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2">
      {STEPS.slice(0, 4).map((label, i) => {
        const s = (i + 1) as Step;
        const done = s < step;
        const current = s === step;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onJump(s)}
              disabled={!done}
              aria-current={current ? "step" : undefined}
              className="flex min-w-0 items-center gap-2 disabled:cursor-default"
            >
              <span
                className={`num flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                  current ? "bg-forest text-white" : done ? "bg-forest-soft text-forest" : "bg-stone text-ink-mute"
                }`}
              >
                {done ? (
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                    <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s
                )}
              </span>
              <span className={`hidden truncate text-sm sm:inline ${current ? "font-semibold text-ink" : "text-ink-mute"}`}>
                {label}
              </span>
            </button>
            {i < 3 && <span className="h-px min-w-3 flex-1 bg-hairline-strong" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function StaySummary({
  cottage,
  checkIn,
  checkOut,
  guests,
  quote,
}: {
  cottage?: Cottage;
  checkIn?: string;
  checkOut?: string;
  guests: number;
  quote: StayQuote | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-linen">
      {cottage ? (
        <Photo src={cottage.images[0]} alt={cottage.name} className="aspect-[16/10]" sizes="300px" />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-stone text-sm text-ink-mute">No cottage yet</div>
      )}
      <div className="p-4">
        <p className="eyebrow">Your stay</p>
        <p className="display mt-1.5 text-xl text-ink">{cottage?.name ?? "Choose a cottage"}</p>
        {checkIn && checkOut ? (
          <Specs
            className="mt-2"
            items={[
              <span key="d" className="num">
                {formatRange(checkIn, checkOut)}
              </span>,
              <span key="g">
                <span className="num">{guests}</span> {guests === 1 ? "guest" : "guests"}
              </span>,
            ]}
          />
        ) : (
          <p className="mt-2 text-sm text-ink-mute">Select dates to see your price.</p>
        )}
        {quote && (
          <div className="mt-4 border-t border-hairline pt-4">
            <PriceBreakdown quote={quote} />
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-hairline p-3.5 text-left transition hover:border-hairline-strong"
    >
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-xs text-ink-mute">{hint}</span>
      </span>
      <span className={`relative h-6 w-10 shrink-0 rounded-full transition ${checked ? "bg-forest" : "bg-stone-deep"}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function MobileMoneyPanel({
  network,
  phone,
  setPhone,
  onSwitchNetwork,
  stage,
  pin,
  setPin,
  amount,
  cottageName,
  onSend,
  onCancel,
  onApprove,
}: {
  network: "mtn" | "airtel";
  phone: string;
  setPhone: (v: string) => void;
  onSwitchNetwork: (m: PayMethod) => void;
  stage: "idle" | "prompt" | "processing";
  pin: string;
  setPin: (v: string) => void;
  amount: string;
  cottageName: string;
  onSend: () => void;
  onCancel: () => void;
  onApprove: () => void;
}) {
  const digits = normalizeUgPhone(phone);
  const valid = digits.length === 10 && digits.startsWith("07");
  const detected = valid ? networkOf(digits) : null;
  const mismatch = detected && detected !== network;
  const isMtn = network === "mtn";
  const brand = isMtn ? "MTN MoMo" : "Airtel Money";

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-[11px] font-extrabold ${
              isMtn ? "bg-mtn text-ink" : "bg-airtel text-white"
            }`}
            aria-hidden
          >
            {isMtn ? "MTN" : "airtel"}
          </span>
          <div>
            <p className="font-semibold text-ink">{brand}</p>
            <p className="text-xs text-ink-mute">Approve on your phone with your Mobile Money PIN.</p>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="momo-phone">
            {brand} number
          </label>
          <input
            id="momo-phone"
            type="tel"
            className="field num"
            placeholder={isMtn ? "077X XXX XXX" : "070X XXX XXX"}
            value={phone}
            disabled={stage === "processing"}
            onChange={(e) => setPhone(e.target.value)}
          />
          {phone && !valid && <p className="mt-1.5 text-xs text-ember">Enter a 10-digit Ugandan mobile number, e.g. 0772 123 456.</p>}
          {mismatch && (
            <p className="mt-1.5 text-xs text-ember">
              This looks like {detected === "mtn" ? "an MTN" : "an Airtel"} number.{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={() => onSwitchNetwork(detected)}
              >
                Switch to {detected === "mtn" ? "MTN MoMo" : "Airtel Money"}
              </button>
            </p>
          )}
        </div>
        <p className="text-sm text-ink-soft">
          Amount due <span className="num font-semibold text-ink">{amount}</span>
        </p>
        {stage === "idle" && (
          <button type="button" className="btn btn-primary w-full sm:w-auto" disabled={!valid} onClick={onSend}>
            Send payment prompt
          </button>
        )}
        {stage !== "idle" && (
          <p className="text-sm text-ink-soft">
            Prompt sent to <span className="num font-semibold text-ink">{prettyPhone(digits)}</span>. Enter the PIN on the
            phone screen to approve.
          </p>
        )}
      </div>

      {stage !== "idle" && (
        <div className="mx-auto w-[260px] animate-pop-in rounded-[2.2rem] border-[9px] border-ink bg-ink shadow-xl">
          <div className="overflow-hidden rounded-[1.6rem] bg-[#e9ece8]">
            <div className="flex items-center justify-between px-4 pt-2 text-[10px] font-semibold text-ink-soft">
              <span className="num">14:02</span>
              <span>{isMtn ? "MTN UG" : "Airtel UG"}</span>
            </div>
            <div className="px-3 pb-5 pt-6">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                {stage === "processing" ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <Spinner className="h-7 w-7 text-forest" />
                    <p className="text-sm font-semibold text-ink">Processing payment…</p>
                    <p className="text-xs text-ink-mute">Confirming with {brand}</p>
                  </div>
                ) : (
                  <>
                    <p className={`num mb-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${isMtn ? "bg-mtn text-ink" : "bg-airtel text-white"}`}>
                      {isMtn ? "*165#" : "*185#"}
                    </p>
                    <p className="num text-[12.5px] leading-relaxed text-ink">
                      Pay {amount} to HAKUNA MATATA FUNCITY?
                      <br />
                      Ref: {cottageName.slice(0, 22)}
                      <br />
                      Enter PIN:
                    </p>
                    <input
                      type="password"
                      inputMode="numeric"
                      autoFocus
                      maxLength={4}
                      aria-label="Mobile Money PIN"
                      className="field num mt-2 text-center tracking-[0.6em]"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && pin.length === 4) onApprove();
                      }}
                    />
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
                        Cancel
                      </button>
                      <button type="button" className="btn btn-primary btn-sm" disabled={pin.length !== 4} onClick={onApprove}>
                        Approve
                      </button>
                    </div>
                    <p className="mt-2 text-center text-[10px] text-ink-mute">Demo: any 4 digits</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardPanel({
  card,
  setCard,
  today,
  processing,
  totalLabel,
  onPay,
}: {
  card: { number: string; expiry: string; cvc: string; name: string };
  setCard: (c: { number: string; expiry: string; cvc: string; name: string }) => void;
  today: string;
  processing: boolean;
  totalLabel: string;
  onPay: () => void;
}) {
  const digits = card.number.replace(/\D/g, "");
  const brand = cardBrand(digits);
  const numberOk = digits.length === 16 && luhnValid(digits) && !!brand;
  const expOk = expiryValid(card.expiry, today);
  const cvcOk = /^\d{3,4}$/.test(card.cvc);
  const nameOk = card.name.trim().length >= 2;
  const ok = numberOk && expOk && cvcOk && nameOk;

  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="cc-num">
          Card number
        </label>
        <div className="relative">
          <input
            id="cc-num"
            inputMode="numeric"
            autoComplete="cc-number"
            className="field num pr-28"
            placeholder="4242 4242 4242 4242"
            value={card.number}
            disabled={processing}
            onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold tracking-wide">
            {brand === "Visa" ? (
              <span className="italic text-[#1a1f71]">VISA</span>
            ) : brand === "Mastercard" ? (
              <span className="inline-flex items-center" aria-label="Mastercard">
                <span className="h-4 w-4 rounded-full bg-[#eb001b]" />
                <span className="-ml-1.5 h-4 w-4 rounded-full bg-[#f79e1b]/90" />
              </span>
            ) : (
              <span className="font-medium text-ink-mute">Visa · Mastercard</span>
            )}
          </span>
        </div>
        {digits.length === 16 && !numberOk && <p className="mt-1.5 text-xs text-ember">That card number doesn&apos;t look right.</p>}
        <p className="mt-1 text-xs text-ink-mute">Test card: 4242 4242 4242 4242, any future date, any CVC.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="cc-exp">
            Expiry
          </label>
          <input
            id="cc-exp"
            inputMode="numeric"
            autoComplete="cc-exp"
            className="field num"
            placeholder="MM/YY"
            value={card.expiry}
            disabled={processing}
            onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
          />
          {card.expiry.length === 5 && !expOk && <p className="mt-1.5 text-xs text-ember">Check the expiry date.</p>}
        </div>
        <div>
          <label className="label" htmlFor="cc-cvc">
            CVC
          </label>
          <input
            id="cc-cvc"
            inputMode="numeric"
            autoComplete="cc-csc"
            className="field num"
            placeholder="123"
            value={card.cvc}
            disabled={processing}
            onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="cc-name">
          Name on card
        </label>
        <input
          id="cc-name"
          autoComplete="cc-name"
          className="field"
          value={card.name}
          disabled={processing}
          onChange={(e) => setCard({ ...card, name: e.target.value })}
        />
      </div>
      <button type="button" className="btn btn-primary w-full" disabled={!ok || processing} onClick={onPay}>
        {processing ? (
          <>
            <Spinner className="h-4 w-4" /> Securing card (tokenizing)…
          </>
        ) : (
          <>
            <LockIcon /> Pay <span className="num">{totalLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation                                                        */
/* ------------------------------------------------------------------ */

function CodeGlyph({ code }: { code: string }) {
  const cells = Array.from({ length: 81 }, (_, i) => {
    const r = Math.floor(i / 9);
    const c = i % 9;
    const finder = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
    if (finder) return !(r % 6 === 1 && c % 6 === 1) || (r === 1 && c === 7) || (r === 7 && c === 1);
    const ch = code.charCodeAt(i % code.length);
    return (ch * (i + 3) + i * i) % 5 < 2;
  });
  return (
    <div className="grid h-20 w-20 shrink-0 grid-cols-9 gap-[1.5px] rounded-md bg-white p-1.5" aria-hidden>
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-ink" : "bg-transparent"} />
      ))}
    </div>
  );
}

function Confirmation({ booking, cottage, receipt }: { booking: Booking; cottage: Cottage; receipt: string }) {
  const { money, currency } = useResort();
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const nights = diffDays(booking.checkIn, booking.checkOut);
  const addonNames = ADDONS.filter((a) => booking.addons.includes(a.id)).map((a) => a.name);
  const other = currency === "USD" ? formatMoney(booking.totalUSD, "UGX") : formatMoney(booking.totalUSD, "USD");
  const firstName = booking.guestName.split(" ")[0];
  const shortDates = `${formatDate(booking.checkIn, { weekday: false })}-${formatDate(booking.checkOut, { weekday: false })}`;

  const smsText = `Hakuna Matata FunCity: booking ${booking.code} confirmed. ${cottage.name}, ${shortDates}, ${booking.guests} guests. Check-in from 2pm. Help: ${RESORT_PHONE}`;
  const reminderText = `Hi ${firstName}, see you tomorrow! Check-in from 2pm, ${cottage.name}. GPS ${RESORT_GPS.lat}, ${RESORT_GPS.lng}. Need an airport shuttle? Reply 1. Code ${booking.code}`;

  const rows: [string, ReactNode][] = [
    ["Guest", booking.guestName],
    ["Cottage", cottage.name],
    ["Dates", <span key="d" className="num">{formatRange(booking.checkIn, booking.checkOut)}</span>],
    ["Nights · guests", <span key="n" className="num">{nights} · {booking.guests}</span>],
    ["Add-ons", addonNames.length ? addonNames.join(", ") : "None"],
    ["Paid", <span key="p"><span className="num font-semibold">{money(booking.totalUSD)}</span> <span className="num text-ink-mute">(≈ {other})</span></span>],
    ["Payment", <span key="m" className="num text-[13px]">{receipt}</span>],
    ["Check-in", <span key="c">From <span className="num">2:00 pm</span> · check-out by <span className="num">11:00 am</span></span>],
  ];

  function downloadVoucher() {
    const line = (k: string, v: string) =>
      `<tr><td style="padding:6px 0;color:#77776d;width:150px">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(booking.code)} · Hakuna Matata FunCity</title></head>
<body style="font-family:Georgia,serif;max-width:560px;margin:40px auto;padding:0 16px;color:#1a1a1a">
<p style="letter-spacing:.16em;text-transform:uppercase;font:600 12px sans-serif;color:#c87d55">Booking voucher</p>
<h1 style="font-weight:400;margin:4px 0 2px">Hakuna Matata FunCity</h1>
<p style="font:600 28px monospace;color:#20402e;margin:12px 0 20px">${esc(booking.code)}</p>
<table style="font:14px sans-serif;border-collapse:collapse;width:100%">
${line("Guest", booking.guestName)}${line("Cottage", cottage.name)}${line("Dates", formatRange(booking.checkIn, booking.checkOut))}
${line("Nights / guests", `${nights} / ${booking.guests}`)}${line("Add-ons", addonNames.join(", ") || "None")}
${line("Paid", `${formatMoney(booking.totalUSD, "USD")} (${formatMoney(booking.totalUSD, "UGX")})`)}${line("Payment", receipt)}
${line("Check-in", "From 2:00 pm, check-out by 11:00 am")}${line("GPS", RESORT_GPS.label)}${line("Contact", `${RESORT_PHONE} · ${RESORT_EMAIL}`)}
</table>
<p style="font:13px sans-serif;color:#77776d;margin-top:24px">Show this voucher at reception. Demo booking, no real payment taken.</p>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${booking.code}-voucher.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="space-y-8">
      <style>{`@media print{body *{visibility:hidden!important}#hmf-voucher,#hmf-voucher *{visibility:visible!important}#hmf-voucher{position:fixed;inset:0 auto auto 0;width:100%;box-shadow:none}}`}</style>

      <div className="flex items-start gap-3 rounded-xl bg-forest-soft p-4 text-forest">
        <CheckCircle className="mt-0.5 h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">Payment received. Your cottage is reserved.</p>
          <p className="mt-0.5 text-sm text-forest/80">
            Thank you, {firstName}. Keep your booking code handy for check-in.
          </p>
        </div>
      </div>

      <div id="hmf-voucher" className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <div className="flex items-center justify-between gap-4 bg-forest px-5 py-5 text-white sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Booking voucher</p>
            <p className="num mt-1 text-3xl font-semibold tracking-wide sm:text-4xl">{booking.code}</p>
            <p className="display mt-1 text-lg text-white/90">Hakuna Matata FunCity</p>
          </div>
          <CodeGlyph code={booking.code} />
        </div>
        <dl className="divide-y divide-hairline px-5 sm:px-6">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[120px_1fr] gap-3 py-2.5 text-sm sm:grid-cols-[150px_1fr]">
              <dt className="text-ink-mute">{k}</dt>
              <dd className="min-w-0 break-words text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="border-t border-hairline bg-linen px-5 py-3 text-xs text-ink-mute sm:px-6">
          <Specs
            className="text-xs"
            items={[RESORT_PHONE, RESORT_EMAIL, <span key="g" className="num">GPS {RESORT_GPS.label}</span>]}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
          Print voucher
        </button>
        <button type="button" className="btn btn-secondary" onClick={downloadVoucher}>
          Download voucher
        </button>
      </div>

      <div>
        <p className="eyebrow">Guest messages</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <MessageCard
            title="Email confirmation"
            meta={[`From ${RESORT_EMAIL}`, `To ${booking.email}`]}
            subject={`Your stay is confirmed · ${booking.code}`}
            body={`Dear ${firstName}, your ${cottage.name} is reserved for ${formatRange(booking.checkIn, booking.checkOut)}. Your voucher is attached. We look forward to welcoming you.`}
            sent={!!sent.email}
            sentTo={booking.email}
            disabledHint={booking.notifyEmail ? undefined : "Email confirmations are off for this booking."}
            onSend={() => setSent((s) => ({ ...s, email: true }))}
          />
          <MessageCard
            title="SMS confirmation"
            meta={["From HAKUNAMATA", `To ${booking.phone}`]}
            body={smsText}
            count={smsText.length}
            sent={!!sent.sms}
            sentTo={booking.phone}
            disabledHint={booking.notifySms ? undefined : "SMS confirmations are off for this booking."}
            onSend={() => setSent((s) => ({ ...s, sms: true }))}
          />
          <div className="md:col-span-2">
            <MessageCard
              title="Arrival reminder"
              meta={[`Scheduled ${formatDate(addDays(booking.checkIn, -1))}, 10:00`, "24 h before check-in", `SMS + email to ${firstName}`]}
              body={reminderText}
              extra="Directions: from Kampala take the Entebbe Expressway or Jinja Road, then follow the FunCity signs. From Entebbe Airport, ask for our shuttle."
              count={reminderText.length}
              sent={!!sent.reminder}
              sentTo={`${booking.phone} · ${booking.email}`}
              onSend={() => setSent((s) => ({ ...s, reminder: true }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageCard({
  title,
  meta,
  subject,
  body,
  extra,
  count,
  sent,
  sentTo,
  disabledHint,
  onSend,
}: {
  title: string;
  meta: string[];
  subject?: string;
  body: string;
  extra?: string;
  count?: number;
  sent: boolean;
  sentTo: string;
  disabledHint?: string;
  onSend: () => void;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-hairline bg-white p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold text-ink">{title}</p>
        {count !== undefined && (
          <p className={`num text-xs ${count > 160 ? "text-ember" : "text-ink-mute"}`}>{count}/160</p>
        )}
      </div>
      <Specs className="mt-1 text-xs" items={meta} />
      <div className="mt-3 flex-1 rounded-lg bg-linen p-3 text-sm leading-relaxed text-ink-soft">
        {subject && <p className="mb-1.5 font-semibold text-ink">{subject}</p>}
        <p>{body}</p>
        {extra && <p className="mt-2 text-xs text-ink-mute">{extra}</p>}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        {sent ? (
          <p className="inline-flex min-w-0 items-center gap-1.5 text-sm text-forest">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span className="truncate">Sent to {sentTo}</span>
          </p>
        ) : disabledHint ? (
          <p className="text-xs text-ink-mute">{disabledHint}</p>
        ) : (
          <span />
        )}
        {!sent && !disabledHint && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onSend}>
            Simulate send
          </button>
        )}
      </div>
    </div>
  );
}
