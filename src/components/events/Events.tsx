"use client";

import { useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Segmented, Specs } from "@/components/ui/Overlay";
import { IMG } from "@/lib/images";
import {
  COTTAGES,
  VAT_RATE,
  addDays,
  formatDate,
  weekdayOf,
  whatsappLink,
  type EventQuote,
  type EventType,
} from "@/data/resortStorage";

/* ------------------------------------------------------------------ */
/* Event tracks                                                        */
/* ------------------------------------------------------------------ */

type Pricing = { kind: "guest" | "flat"; usd: number };
type Pkg = { id: string; name: string; summary: string; includes: string[]; price: Pricing };
type Tier = { id: string; name: string; description: string; perGuestUSD: number };
type Extra = { id: string; name: string; description: string; price: Pricing };

type Track = {
  type: EventType;
  label: string;
  title: string;
  intro: string;
  images: { src: string; alt: string }[];
  facts: string[];
  guestMin: number;
  guestMax: number;
  guestStep: number;
  guestDefault: number;
  defaultLeadDays: number;
  packages: Pkg[];
  tiers: Tier[];
  extras: Extra[];
};

const TRACKS: Record<EventType, Track> = {
  wedding: {
    type: "wedding",
    label: "wedding",
    title: "Say “I do” in the botanical garden",
    intro:
      "Exchange vows under the old fig tree, dine on the lawn beneath festoon lights and dance until the fireflies come out. Our wedding team handles everything from the kwanjula introduction to the last dance.",
    images: [
      { src: IMG.weddingCeremony, alt: "Wedding ceremony set up on a garden lawn" },
      { src: IMG.weddingExit, alt: "Reception hall dressed with long tables and soft lights" },
      { src: IMG.weddingTable, alt: "Reception table with flowers and candles" },
      { src: IMG.weddingCouple, alt: "Newly married couple holding hands" },
    ],
    facts: ["Garden lawn up to 300 guests", "Pavilion 150 seated", "Bridal cottage", "Kwanjula & church ceremonies", "On-site planner"],
    guestMin: 30,
    guestMax: 300,
    guestStep: 5,
    guestDefault: 120,
    defaultLeadDays: 90,
    packages: [
      {
        id: "intimate",
        name: "Intimate Garden Vows",
        summary: "Up to 60 guests on the fig-tree lawn",
        includes: ["4-hour venue hire", "Ceremony arch & chairs", "Wedding coordinator", "Sound for vows"],
        price: { kind: "flat", usd: 1800 },
      },
      {
        id: "classic",
        name: "Garden Ceremony & Reception",
        summary: "Ceremony and reception in one place",
        includes: ["Full-day venue hire", "Lawn or pavilion reception", "Tables, linen & chairs", "Coordinator & sound"],
        price: { kind: "guest", usd: 22 },
      },
      {
        id: "grand",
        name: "Grand Celebration Weekend",
        summary: "Exclusive use of the gardens for two days",
        includes: ["Exclusive two-day hire", "Kwanjula or rehearsal evening", "Bridal cottage, 2 nights", "Dedicated planner"],
        price: { kind: "flat", usd: 6500 },
      },
    ],
    tiers: [
      { id: "garden-buffet", name: "Garden Buffet", description: "Ugandan and continental buffet, salads, grills and a dessert table", perGuestUSD: 25 },
      { id: "signature-feast", name: "Signature Ugandan Feast", description: "Luwombo, roast goat, matooke, Nile tilapia and a carving station", perGuestUSD: 38 },
      { id: "chefs-tasting", name: "Chef's Tasting", description: "Plated five-course menu with canapés and wine pairing", perGuestUSD: 55 },
    ],
    extras: [
      { id: "decor", name: "Décor & florals", description: "Styling, centrepieces and ceremony flowers", price: { kind: "flat", usd: 1200 } },
      { id: "band", name: "Live band or DJ", description: "Five hours with sound and lighting", price: { kind: "flat", usd: 650 } },
      { id: "photographer", name: "Photographer", description: "Full day with an edited online gallery", price: { kind: "flat", usd: 800 } },
      { id: "bridal-night", name: "Bridal cottage night", description: "Sunset Horizon Loft with a romance setup", price: { kind: "flat", usd: 320 } },
      { id: "fireworks", name: "Fireworks finale", description: "Three-minute display over the gardens", price: { kind: "flat", usd: 450 } },
      { id: "welcome-drinks", name: "Welcome drinks & juice bar", description: "Fresh passion, mango and hibiscus on arrival", price: { kind: "guest", usd: 5 } },
    ],
  },
  corporate: {
    type: "corporate",
    label: "corporate retreat",
    title: "Retreats that send teams home recharged",
    intro:
      "Swap the boardroom for open sky: strategy sessions in the pavilion each morning, afternoons on the quad-bike trail or canopy walk, and evenings round the campfire. All under an hour from Kampala.",
    images: [
      { src: IMG.corporatePanel, alt: "Speaker presenting to a seated audience" },
      { src: IMG.corporateBoardroom, alt: "Team working together around a table" },
      { src: IMG.corporateWorkshop, alt: "Colleagues collaborating over laptops" },
      { src: IMG.atvTrail, alt: "Group walking a forest trail" },
    ],
    facts: ["Pavilion 120 theatre-style", "3 breakout spaces", "Fibre Wi-Fi", "5 cottages on site", "Under an hour from Kampala"],
    guestMin: 10,
    guestMax: 120,
    guestStep: 1,
    guestDefault: 40,
    defaultLeadDays: 30,
    packages: [
      {
        id: "day-conference",
        name: "Day Conference",
        summary: "Pavilion from 8 am to 5 pm",
        includes: ["Pavilion & breakout hire", "Screen, flipcharts & stationery", "Fibre Wi-Fi", "Event host"],
        price: { kind: "guest", usd: 18 },
      },
      {
        id: "strategy-retreat",
        name: "Two-Day Strategy Retreat",
        summary: "Two days of sessions with breakouts",
        includes: ["Two-day venue hire", "Three breakout spaces", "Facilitator check-ins", "Evening campfire space"],
        price: { kind: "guest", usd: 45 },
      },
      {
        id: "adventure-day",
        name: "Team Building Adventure Day",
        summary: "Outdoor challenges led by our guides",
        includes: ["Canopy walk & trail challenges", "Guides & safety kit", "Awards session", "Lawn games"],
        price: { kind: "guest", usd: 30 },
      },
    ],
    tiers: [
      { id: "day-delegate", name: "Day Delegate", description: "Morning and afternoon tea plus a buffet lunch", perGuestUSD: 15 },
      { id: "full-board", name: "Full Board", description: "Breakfast, lunch, dinner and all tea breaks", perGuestUSD: 42 },
      { id: "premium-full-board", name: "Premium Full Board", description: "Full board plus a BBQ night, soft drinks and bar credit", perGuestUSD: 60 },
    ],
    extras: [
      { id: "facilitator", name: "Facilitator-led team building", description: "Half-day programme with a certified facilitator", price: { kind: "flat", usd: 600 } },
      { id: "av", name: "Projector & PA", description: "HD projector, two mics and a speaker system", price: { kind: "flat", usd: 150 } },
      { id: "quad", name: "Quad-bike challenge", description: "Guided trail race with safety briefing", price: { kind: "guest", usd: 25 } },
      { id: "campfire", name: "Campfire dinner", description: "Open-fire grill and storytelling under the stars", price: { kind: "guest", usd: 20 } },
      { id: "shuttle", name: "Airport shuttle (Entebbe)", description: "Coaster bus, return trip, up to 28 seats", price: { kind: "flat", usd: 180 } },
    ],
  },
};

type Selection = {
  date: string;
  guests: number;
  packageId: string;
  tierId: string;
  extras: string[];
  rooms: number;
  nights: number;
};

function defaultSelection(t: Track): Selection {
  return {
    date: "",
    guests: t.guestDefault,
    packageId: t.packages[1].id,
    tierId: t.tiers[1].id,
    extras: [],
    rooms: 0,
    nights: 1,
  };
}

type Contact = { name: string; organisation: string; email: string; phone: string; notes: string };
type ContactErrors = Partial<Record<"name" | "email" | "phone" | "date", string>>;

type Submitted = {
  quote: EventQuote;
  ref: string;
  summary: string;
  callDay: string;
  callTime: string | null;
};

const CALL_TIMES = ["10:00", "12:30", "15:00", "17:00"];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function Events() {
  const { today, money, rateFor, addEventQuote, update } = useResort();
  const [type, setType] = useState<EventType>("wedding");
  const track = TRACKS[type];

  const [selections, setSelections] = useState<Record<EventType, Selection>>(() => ({
    wedding: defaultSelection(TRACKS.wedding),
    corporate: defaultSelection(TRACKS.corporate),
  }));
  const sel = selections[type];
  const patch = (p: Partial<Selection>) => setSelections((s) => ({ ...s, [type]: { ...s[type], ...p } }));

  const [contact, setContact] = useState<Contact>({ name: "", organisation: "", email: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const minDate = addDays(today, 14);
  const fallbackDate = addDays(today, track.defaultLeadDays);
  const eventDate = sel.date && sel.date >= minDate ? sel.date : sel.date ? minDate : fallbackDate;

  const pkg = track.packages.find((p) => p.id === sel.packageId) ?? track.packages[0];
  const tier = track.tiers.find((t) => t.id === sel.tierId) ?? track.tiers[0];
  const chosenExtras = track.extras.filter((e) => sel.extras.includes(e.id));

  const avgCottageRate = useMemo(
    () => Math.round(COTTAGES.reduce((s, c) => s + rateFor(c.id), 0) / COTTAGES.length),
    [rateFor],
  );

  const priceOf = (p: Pricing) => (p.kind === "guest" ? p.usd * sel.guests : p.usd);
  const priceDetail = (p: Pricing) => (p.kind === "guest" ? `${money(p.usd)} × ${sel.guests} guests` : "Flat fee");

  const lines: { label: string; detail: string; usd: number }[] = [
    { label: pkg.name, detail: priceDetail(pkg.price), usd: priceOf(pkg.price) },
    { label: `Catering · ${tier.name}`, detail: `${money(tier.perGuestUSD)} × ${sel.guests} guests`, usd: tier.perGuestUSD * sel.guests },
    ...chosenExtras.map((e) => ({ label: e.name, detail: priceDetail(e.price), usd: priceOf(e.price) })),
  ];
  if (type === "corporate" && sel.rooms > 0) {
    lines.push({
      label: "Overnight cottages",
      detail: `${sel.rooms} ${sel.rooms === 1 ? "cottage" : "cottages"} × ${sel.nights} ${sel.nights === 1 ? "night" : "nights"} · avg. ${money(avgCottageRate)}`,
      usd: avgCottageRate * sel.rooms * sel.nights,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.usd, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;
  const perGuest = Math.round(total / Math.max(1, sel.guests));

  const callDays = useMemo(() => {
    const out: string[] = [];
    let d = today;
    while (out.length < 5) {
      d = addDays(d, 1);
      const w = weekdayOf(d);
      if (w !== 0 && w !== 6) out.push(d);
    }
    return out;
  }, [today]);

  const toggleExtra = (id: string) =>
    patch({ extras: sel.extras.includes(id) ? sel.extras.filter((x) => x !== id) : [...sel.extras, id] });

  const setField = (k: keyof Contact) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setContact((c) => ({ ...c, [k]: v }));
    if (errors[k as keyof ContactErrors]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const er: ContactErrors = {};
    if (!contact.name.trim()) er.name = "Please add your name.";
    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) er.email = "Please enter a valid email.";
    if (contact.phone.replace(/\D/g, "").length < 7) er.phone = "Please enter a phone number we can call.";
    if (eventDate < minDate) er.date = `Earliest date is ${formatDate(minDate, { year: true })}.`;
    setErrors(er);
    if (Object.keys(er).length) return;

    const extrasList = chosenExtras.map((x) => x.name);
    if (type === "corporate" && sel.rooms > 0) {
      extrasList.push(`${sel.rooms} cottages × ${sel.nights} nights`);
    }
    const quote = addEventQuote({
      type,
      name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      organisation: type === "corporate" && contact.organisation.trim() ? contact.organisation.trim() : undefined,
      date: eventDate,
      guests: sel.guests,
      packageName: pkg.name,
      cateringTier: tier.name,
      extras: extrasList,
      estimateUSD: total,
      notes: contact.notes.trim() || undefined,
    });
    const ref = `EVQ-${(quote.id.split("_")[1] ?? quote.id).slice(0, 6).toUpperCase()}`;
    const summary = [
      `Hello Hakuna Matata FunCity! I just requested a ${track.label} quote (ref ${ref}).`,
      `Date: ${formatDate(eventDate, { year: true })}`,
      `Guests: ${sel.guests}`,
      `Package: ${pkg.name}`,
      `Catering: ${tier.name}`,
      extrasList.length ? `Extras: ${extrasList.join(", ")}` : null,
      `Estimate: ${money(total)}`,
      `Name: ${contact.name.trim()}${type === "corporate" && contact.organisation.trim() ? ` (${contact.organisation.trim()})` : ""}`,
    ]
      .filter(Boolean)
      .join("\n");
    setSubmitted({ quote, ref, summary, callDay: callDays[0], callTime: null });
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function bookCall(time: string) {
    if (!submitted) return;
    const line = `Call booked: ${formatDate(submitted.callDay, { year: true })} at ${time} EAT`;
    update((s) => ({
      ...s,
      eventQuotes: s.eventQuotes.map((q) =>
        q.id === submitted.quote.id ? { ...q, notes: [q.notes, line].filter(Boolean).join("\n") } : q,
      ),
    }));
    setSubmitted({ ...submitted, callTime: time });
  }

  const showSuccess = submitted && submitted.quote.type === type;

  return (
    <section id="events" className="section bg-linen">
      <div className="container-x">
        {/* Heading */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Weddings · Celebrations · Retreats</p>
            <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">Gather under the acacias</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Two dedicated event teams, one for love stories and one for teams that need room to think. Build a live
              estimate below and get a detailed quote within a day.
            </p>
          </div>
          <Segmented<EventType>
            value={type}
            onChange={setType}
            className="self-start lg:self-auto"
            options={[
              {
                value: "wedding",
                label: (
                  <>
                    <span className="sm:hidden">Weddings</span>
                    <span className="hidden sm:inline">Weddings & Celebrations</span>
                  </>
                ),
              },
              {
                value: "corporate",
                label: (
                  <>
                    <span className="sm:hidden">Corporate</span>
                    <span className="hidden sm:inline">Team Building & Corporate Retreats</span>
                  </>
                ),
              },
            ]}
          />
        </div>

        {/* Track intro + collage */}
        <div key={type} className="mt-10 grid animate-fade-in gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:pt-4">
            <h3 className="display text-3xl text-ink sm:text-4xl">{track.title}</h3>
            <p className="mt-4 leading-relaxed text-ink-soft">{track.intro}</p>
            <Specs items={track.facts} className="mt-5 leading-7" />
            <div className="mt-8 border-t border-hairline pt-6">
              <p className="text-sm text-ink-mute">Packages from</p>
              <p className="num mt-1 text-2xl text-ink">
                {type === "wedding" ? money(1800) : `${money(18)}`}
                <span className="ml-2 font-sans text-sm text-ink-mute">{type === "wedding" ? "flat" : "per guest"}</span>
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 md:h-[460px] md:grid-cols-4 md:grid-rows-2">
              {track.images.map((img, i) => (
                <Photo
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  sizes={i === 0 ? "(min-width: 768px) 30vw, 100vw" : "(min-width: 768px) 18vw, 50vw"}
                  className={`rounded-2xl ${
                    i === 0
                      ? "col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto"
                      : i === 1
                        ? "col-span-2 aspect-[16/9] md:aspect-auto"
                        : "aspect-square md:aspect-auto"
                  }`}
                  imgClassName="transition-transform duration-500 hover:scale-[1.04]"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quote builder */}
        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Steps */}
          <div className="card p-5 sm:p-7 lg:col-span-7">
            <p className="eyebrow">Quote builder</p>
            <h3 className="display mt-2 text-2xl text-ink sm:text-3xl">
              Plan your {type === "wedding" ? "celebration" : "retreat"}
            </h3>

            <Step n="01" title="Choose a package">
              <div className="grid gap-3 sm:grid-cols-3">
                {track.packages.map((p) => {
                  const active = p.id === pkg.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => patch({ packageId: p.id })}
                      className={`flex flex-col rounded-xl border p-4 text-left transition ${
                        active ? "border-forest bg-forest-soft/60 ring-1 ring-forest" : "border-hairline-strong bg-canvas hover:border-ink/30"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold leading-snug text-ink">{p.name}</span>
                        <Radio checked={active} />
                      </span>
                      <span className="num mt-2 text-base text-forest">
                        {money(p.price.usd)}
                        <span className="ml-1 font-sans text-xs text-ink-mute">{p.price.kind === "guest" ? "/ guest" : "flat"}</span>
                      </span>
                      <span className="mt-2 text-xs leading-relaxed text-ink-mute">{p.summary}</span>
                      <ul className="mt-3 space-y-1 border-t border-hairline pt-3 text-xs text-ink-soft">
                        {p.includes.map((inc) => (
                          <li key={inc} className="flex gap-1.5">
                            <CheckIcon className="mt-0.5 h-3 w-3 shrink-0 text-forest" />
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </Step>

            <Step n="02" title="Date & guests">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor={`ev-date-${type}`} className="label">
                    Event date
                  </label>
                  <input
                    id={`ev-date-${type}`}
                    type="date"
                    className="field num"
                    min={minDate}
                    value={eventDate}
                    onChange={(e) => {
                      patch({ date: e.target.value });
                      if (errors.date) setErrors((er) => ({ ...er, date: undefined }));
                    }}
                  />
                  <p className={`mt-1.5 text-xs ${errors.date ? "text-danger" : "text-ink-mute"}`}>
                    {errors.date ?? `${formatDate(eventDate, { year: true })} · at least 14 days ahead`}
                  </p>
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor={`ev-guests-${type}`} className="label">
                      Guests
                    </label>
                    <span className="num text-lg text-ink">{sel.guests}</span>
                  </div>
                  <input
                    id={`ev-guests-${type}`}
                    type="range"
                    min={track.guestMin}
                    max={track.guestMax}
                    step={track.guestStep}
                    value={sel.guests}
                    onChange={(e) => patch({ guests: Number(e.target.value) })}
                    className="mt-2 w-full accent-forest"
                  />
                  <div className="num mt-1 flex justify-between text-xs text-ink-mute">
                    <span>{track.guestMin}</span>
                    <span>{track.guestMax}</span>
                  </div>
                </div>
              </div>
            </Step>

            <Step n="03" title="Catering">
              <div className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline-strong">
                {track.tiers.map((t) => {
                  const active = t.id === tier.id;
                  return (
                    <label
                      key={t.id}
                      className={`flex cursor-pointer items-start gap-3 p-4 transition ${active ? "bg-forest-soft/60" : "bg-canvas hover:bg-linen"}`}
                    >
                      <input
                        type="radio"
                        name={`tier-${type}`}
                        checked={active}
                        onChange={() => patch({ tierId: t.id })}
                        className="mt-1 h-4 w-4 accent-forest"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">{t.name}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-mute">{t.description}</span>
                      </span>
                      <span className="num shrink-0 text-sm text-ink">
                        {money(t.perGuestUSD)}
                        <span className="font-sans text-xs text-ink-mute"> / guest</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </Step>

            <Step n="04" title="Extras">
              <div className="grid gap-3 sm:grid-cols-2">
                {track.extras.map((x) => {
                  const active = sel.extras.includes(x.id);
                  return (
                    <label
                      key={x.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                        active ? "border-forest bg-forest-soft/60" : "border-hairline-strong bg-canvas hover:border-ink/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleExtra(x.id)}
                        className="mt-1 h-4 w-4 accent-forest"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">{x.name}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-mute">{x.description}</span>
                        <span className="num mt-1.5 block text-xs text-forest">
                          {money(x.price.usd)}
                          <span className="font-sans text-ink-mute">{x.price.kind === "guest" ? " / guest" : " flat"}</span>
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </Step>

            {type === "corporate" && (
              <Step n="05" title="Overnight cottages">
                <div className="rounded-xl border border-hairline-strong p-4">
                  <p className="text-sm text-ink-soft">
                    Keep the team on site. Each cottage sleeps 2–6, averaging{" "}
                    <span className="num text-ink">{money(avgCottageRate)}</span> a night.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Stepper
                      label="Cottages"
                      value={sel.rooms}
                      min={0}
                      max={COTTAGES.length}
                      onChange={(rooms) => patch({ rooms })}
                      suffix={sel.rooms === 0 ? "none" : sel.rooms === COTTAGES.length ? "whole resort" : undefined}
                    />
                    <Stepper
                      label="Nights"
                      value={sel.nights}
                      min={1}
                      max={3}
                      disabled={sel.rooms === 0}
                      onChange={(nights) => patch({ nights })}
                    />
                  </div>
                </div>
              </Step>
            )}
          </div>

          {/* Live estimate (sticky on desktop) */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <aside className="card overflow-hidden lg:sticky lg:top-24" aria-live="polite">
              <div className="bg-forest px-5 py-5 text-white sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Live estimate</p>
                <p className="num mt-2 text-3xl sm:text-4xl">{money(total)}</p>
                <p className="mt-1 text-sm text-white/75">
                  <span className="num">≈ {money(perGuest)}</span> per guest · {sel.guests} guests ·{" "}
                  {formatDate(eventDate, { year: true })}
                </p>
              </div>
              <dl className="divide-y divide-hairline px-5 sm:px-6">
                {lines.map((l) => (
                  <div key={l.label} className="flex items-start justify-between gap-4 py-3">
                    <dt className="min-w-0">
                      <span className="block text-sm text-ink">{l.label}</span>
                      <span className="num block text-xs text-ink-mute">{l.detail}</span>
                    </dt>
                    <dd className="num shrink-0 text-sm text-ink">{money(l.usd)}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="num text-ink">{money(subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-ink-soft">VAT ({Math.round(VAT_RATE * 100)}%)</dt>
                  <dd className="num text-ink">{money(vat)}</dd>
                </div>
                <div className="flex justify-between gap-4 py-4">
                  <dt className="font-semibold text-ink">Estimated total</dt>
                  <dd className="num text-lg font-semibold text-ink">{money(total)}</dd>
                </div>
              </dl>
              <p className="border-t border-hairline bg-linen px-5 py-3 text-xs text-ink-mute sm:px-6">
                Estimate only, final quote within 24 h. No payment needed to enquire.
              </p>
            </aside>
          </div>

          {/* Contact / success */}
          <div ref={resultRef} className="scroll-mt-24 lg:col-span-7 lg:col-start-1">
            {showSuccess && submitted ? (
              <div className="card animate-pop-in p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-white">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="display text-2xl text-ink">Quote request received</h3>
                    <p className="mt-1 text-sm text-ink-soft">
                      Reference <span className="num font-semibold text-ink">{submitted.ref}</span>. Our events team will
                      email a detailed quote to <span className="font-medium text-ink">{submitted.quote.email}</span> within 24
                      hours.
                    </p>
                  </div>
                </div>

                <div className="mt-7 border-t border-hairline pt-6">
                  <h4 className="text-sm font-semibold text-ink">Book a 15-minute call with our planner</h4>
                  <p className="mt-1 text-xs text-ink-mute">Times are East Africa Time (EAT). We&apos;ll ring {submitted.quote.phone}.</p>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {callDays.map((d) => {
                      const active = d === submitted.callDay;
                      const [wd, day, mon] = formatDate(d).split(" ");
                      return (
                        <button
                          key={d}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSubmitted({ ...submitted, callDay: d, callTime: null })}
                          className={`rounded-xl border px-1 py-2.5 text-center transition ${
                            active ? "border-forest bg-forest text-white" : "border-hairline-strong bg-canvas text-ink hover:border-ink/30"
                          }`}
                        >
                          <span className={`block text-[11px] font-semibold uppercase tracking-wide ${active ? "text-white/80" : "text-ink-mute"}`}>
                            {wd}
                          </span>
                          <span className="num block text-lg leading-tight">{day}</span>
                          <span className={`block text-[11px] ${active ? "text-white/80" : "text-ink-mute"}`}>{mon}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {CALL_TIMES.map((t) => {
                      const active = t === submitted.callTime;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => bookCall(t)}
                          className={`num rounded-lg border px-3 py-2 text-sm transition ${
                            active ? "border-ember bg-ember-soft text-ink" : "border-hairline-strong bg-canvas text-ink hover:border-ink/30"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {submitted.callTime && (
                    <p className="mt-4 flex items-start gap-2 rounded-xl bg-forest-soft px-4 py-3 text-sm text-forest animate-fade-in">
                      <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        Call booked for <strong>{formatDate(submitted.callDay, { year: true })}</strong> at{" "}
                        <strong className="num">{submitted.callTime}</strong> EAT. A calendar invite is on its way.
                      </span>
                    </p>
                  )}
                </div>

                <div className="mt-7 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row">
                  <a
                    href={whatsappLink(submitted.summary)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Continue on WhatsApp
                  </a>
                  <button type="button" className="btn btn-secondary" onClick={() => setSubmitted(null)}>
                    Start a new quote
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="card p-5 sm:p-7">
                <div className="flex items-baseline gap-3">
                  <span className="num text-xs text-ember">{type === "corporate" ? "06" : "05"}</span>
                  <h4 className="text-base font-semibold text-ink">Your details</h4>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field id="ev-name" label={type === "wedding" ? "Your name(s)" : "Contact name"} error={errors.name}>
                    <input id="ev-name" className="field" autoComplete="name" value={contact.name} onChange={setField("name")} />
                  </Field>
                  {type === "corporate" ? (
                    <Field id="ev-org" label="Organisation">
                      <input id="ev-org" className="field" autoComplete="organization" value={contact.organisation} onChange={setField("organisation")} />
                    </Field>
                  ) : (
                    <Field id="ev-phone" label="Phone / WhatsApp" error={errors.phone}>
                      <input id="ev-phone" className="field" type="tel" autoComplete="tel" placeholder="+256 7__ ___ ___" value={contact.phone} onChange={setField("phone")} />
                    </Field>
                  )}
                  <Field id="ev-email" label="Email" error={errors.email}>
                    <input id="ev-email" className="field" type="email" autoComplete="email" value={contact.email} onChange={setField("email")} />
                  </Field>
                  {type === "corporate" && (
                    <Field id="ev-phone" label="Phone / WhatsApp" error={errors.phone}>
                      <input id="ev-phone" className="field" type="tel" autoComplete="tel" placeholder="+256 7__ ___ ___" value={contact.phone} onChange={setField("phone")} />
                    </Field>
                  )}
                  <div className={type === "corporate" ? "sm:col-span-2" : ""}>
                    <Field id="ev-notes" label="Anything else? (optional)">
                      <textarea
                        id="ev-notes"
                        className="field min-h-[88px] resize-y"
                        placeholder={type === "wedding" ? "Ceremony style, colours, dietary needs…" : "Goals for the retreat, agenda, dietary needs…"}
                        value={contact.notes}
                        onChange={setField("notes")}
                      />
                    </Field>
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-ink-mute">We reply within 24 hours, usually sooner.</p>
                  <button type="submit" className="btn btn-ember">
                    Request detailed quote
                    <ArrowIcon className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div className="mt-8 border-t border-hairline pt-6">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="num text-xs text-ember">{n}</span>
        <h4 className="text-base font-semibold text-ink">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  disabled = false,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  suffix?: string;
}) {
  return (
    <div className={disabled ? "opacity-45" : ""}>
      <p className="label">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-secondary btn-sm h-9 w-9 px-0"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
        <span className="num w-8 text-center text-lg text-ink">{value}</span>
        <button
          type="button"
          className="btn btn-secondary btn-sm h-9 w-9 px-0"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
        {suffix && <span className="text-xs text-ink-mute">{suffix}</span>}
      </div>
    </div>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        checked ? "border-forest bg-forest" : "border-ink/25 bg-canvas"
      }`}
    >
      {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
    </span>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
