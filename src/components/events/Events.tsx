"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Specs } from "@/components/ui/Overlay";
import { CountUp, Lightbox, Reveal, useInView } from "@/components/ui/Motion";
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
type Pkg = { id: string; name: string; summary: string; includes: string[]; price: Pricing; popular?: boolean };
type Tier = { id: string; name: string; description: string; perGuestUSD: number };
type Extra = { id: string; name: string; description: string; price: Pricing };
type Stat = { to: number; suffix?: string; label: string };

type Track = {
  type: EventType;
  label: string;
  tab: string;
  tabShort: string;
  title: string;
  intro: string;
  /** First four show in the collage; all open in the lightbox. */
  gallery: { src: string; alt: string }[];
  stats: Stat[];
  facts: string[];
  fromPrice: Pricing;
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
    tab: "Weddings & Celebrations",
    tabShort: "Weddings",
    title: "Say “I do” in the botanical garden",
    intro:
      "Exchange vows under the old fig tree, dine on the lawn beneath festoon lights and dance until the fireflies come out. Our wedding team handles everything from the kwanjula introduction to the last dance.",
    gallery: [
      { src: IMG.weddingCeremony, alt: "Ceremony arch and white chairs set out on the garden lawn" },
      { src: IMG.weddingDance, alt: "Guests dancing at an evening reception outdoors" },
      { src: IMG.weddingCouple, alt: "Bride and groom embracing under a tree" },
      { src: IMG.sunsetTable, alt: "Reception dinner under string lights at sunset" },
      { src: IMG.weddingTraditional, alt: "Couple in traditional dress at an introduction ceremony" },
      { src: IMG.weddingBanquet, alt: "Long banquet table laid for an outdoor reception" },
      { src: IMG.weddingExit, alt: "Newlyweds walking out of the ceremony past their guests" },
    ],
    stats: [
      { to: 300, label: "guests on the garden lawn" },
      { to: 150, label: "seated in the pavilion" },
      { to: 240, suffix: "+", label: "weddings hosted" },
    ],
    facts: ["Bridal cottage", "Kwanjula & church ceremonies", "On-site planner"],
    fromPrice: { kind: "flat", usd: 1800 },
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
        popular: true,
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
    tab: "Team Building & Corporate Retreats",
    tabShort: "Corporate",
    title: "Retreats that send teams home recharged",
    intro:
      "Swap the boardroom for open sky: strategy sessions in the pavilion each morning, afternoons on the quad-bike trail or canopy walk, and evenings round the campfire. All under an hour from Kampala.",
    gallery: [
      { src: IMG.corporateBoardroom, alt: "Strategy session around a long boardroom table" },
      { src: IMG.atvTrail, alt: "Quad bikes lined up on the green for a team challenge" },
      { src: IMG.corporateWorkshop, alt: "Colleagues reviewing ideas together on a laptop" },
      { src: IMG.bushDinner, alt: "Candlelit team dinner by the water" },
      { src: IMG.corporatePanel, alt: "Panel discussion with speakers and a seated audience" },
      { src: IMG.lodgeLounge, alt: "Open-air thatched lounge for breakout sessions" },
      { src: IMG.ropesCourse, alt: "Guide briefing a team on the ropes course" },
    ],
    stats: [
      { to: 120, label: "theatre-style seats" },
      { to: 3, label: "breakout spaces" },
      { to: 45, suffix: " min", label: "from Kampala" },
    ],
    facts: ["Fibre Wi-Fi", "5 cottages on site", "Guided outdoor challenges"],
    fromPrice: { kind: "guest", usd: 18 },
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
        popular: true,
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

type Row = { id: string; label: string; detail: string; usd: number; open: boolean };

const CALL_TIMES = ["10:00", "12:30", "15:00", "17:00"];

/* Local keyframes and the custom range slider (scoped by the ev- prefix). */
const EVENTS_CSS = `
@keyframes ev-in-left{from{opacity:0;transform:translate3d(-22px,0,0)}to{opacity:1;transform:none}}
@keyframes ev-in-right{from{opacity:0;transform:translate3d(22px,0,0)}to{opacity:1;transform:none}}
@keyframes ev-fade-up{from{opacity:0;transform:translate3d(0,6px,0)}to{opacity:1;transform:none}}
@keyframes ev-draw{to{stroke-dashoffset:0}}
@keyframes ev-delta{0%{opacity:0;transform:translateY(6px)}15%{opacity:1;transform:none}70%{opacity:1}100%{opacity:0;transform:translateY(-12px)}}
@keyframes ev-pop{0%{transform:scale(.92)}60%{transform:scale(1.05)}100%{transform:scale(1)}}
.ev-range{-webkit-appearance:none;appearance:none;width:100%;height:28px;background:transparent;cursor:pointer;touch-action:pan-y}
.ev-range:focus{outline:none}
.ev-range::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:linear-gradient(to right,var(--color-forest) var(--ev-fill),var(--color-stone-deep) var(--ev-fill))}
.ev-range::-webkit-slider-thumb{-webkit-appearance:none;margin-top:-8px;width:22px;height:22px;border-radius:50%;background:#fff;border:2px solid var(--color-forest);box-shadow:0 2px 8px rgba(31,61,43,.25);transition:transform 150ms ease,box-shadow 150ms ease}
.ev-range:active::-webkit-slider-thumb{transform:scale(1.15)}
.ev-range:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 5px rgba(200,125,85,.35)}
.ev-range::-moz-range-track{height:6px;border-radius:999px;background:var(--color-stone-deep)}
.ev-range::-moz-range-progress{height:6px;border-radius:999px;background:var(--color-forest)}
.ev-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid var(--color-forest);box-shadow:0 2px 8px rgba(31,61,43,.25)}
.ev-range:focus-visible::-moz-range-thumb{box-shadow:0 0 0 5px rgba(200,125,85,.35)}
`;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function Events() {
  const { today, money, rateFor, addEventQuote, update } = useResort();
  const [type, setType] = useState<EventType>("wedding");
  const [switches, setSwitches] = useState(0);
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
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Phones: show a floating estimate bar while the builder is on screen and the in-flow estimate isn't.
  const { ref: builderRef, inView: builderInView } = useInView<HTMLDivElement>({ once: false, threshold: 0, rootMargin: "0px" });
  const { ref: asideRef, inView: asideInView } = useInView<HTMLElement>({ once: false, threshold: 0, rootMargin: "0px" });
  const showBar = builderInView && !asideInView;

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

  const rows: Row[] = [
    { id: "pkg", label: pkg.name, detail: priceDetail(pkg.price), usd: priceOf(pkg.price), open: true },
    {
      id: "tier",
      label: `Catering · ${tier.name}`,
      detail: `${money(tier.perGuestUSD)} × ${sel.guests} guests`,
      usd: tier.perGuestUSD * sel.guests,
      open: true,
    },
    ...track.extras.map((e) => ({
      id: e.id,
      label: e.name,
      detail: priceDetail(e.price),
      usd: priceOf(e.price),
      open: sel.extras.includes(e.id),
    })),
  ];
  if (type === "corporate") {
    rows.push({
      id: "rooms",
      label: "Overnight cottages",
      detail: `${sel.rooms} ${sel.rooms === 1 ? "cottage" : "cottages"} × ${sel.nights} ${sel.nights === 1 ? "night" : "nights"} · avg. ${money(avgCottageRate)}`,
      usd: avgCottageRate * sel.rooms * sel.nights,
      open: sel.rooms > 0,
    });
  }
  const subtotal = rows.filter((r) => r.open).reduce((s, r) => s + r.usd, 0);
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

  const switchType = (t: EventType) => {
    if (t === type) return;
    setType(t);
    setSwitches((n) => n + 1);
    setLightbox(null);
  };

  const toggleExtra = (id: string) =>
    patch({ extras: sel.extras.includes(id) ? sel.extras.filter((x) => x !== id) : [...sel.extras, id] });

  const setField = (k: keyof Contact) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value;
    setContact((c) => ({ ...c, [k]: v }));
    if (errors[k as keyof ContactErrors]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const goToDetails = () => {
    setSheetOpen(false);
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 500);
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const er: ContactErrors = {};
    if (!contact.name.trim()) er.name = "Please add your name.";
    if (!/^\S+@\S+\.\S+$/.test(contact.email.trim())) er.email = "Please enter a valid email.";
    if (contact.phone.replace(/\D/g, "").length < 7) er.phone = "Please enter a phone number we can call.";
    if (eventDate < minDate) er.date = `Earliest date is ${formatDate(minDate, { year: true })}.`;
    setErrors(er);
    if (Object.keys(er).length) {
      setShake(true);
      return;
    }

    const extrasList = chosenExtras.map((x) => x.name);
    if (type === "corporate" && sel.rooms > 0) {
      extrasList.push(`${sel.rooms} cottages × ${sel.nights} nights`);
    }
    const payload = {
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
    };
    const summaryLines = [
      `Date: ${formatDate(eventDate, { year: true })}`,
      `Guests: ${sel.guests}`,
      `Package: ${pkg.name}`,
      `Catering: ${tier.name}`,
      extrasList.length ? `Extras: ${extrasList.join(", ")}` : null,
      `Estimate: ${money(total)}`,
      `Name: ${payload.name}${payload.organisation ? ` (${payload.organisation})` : ""}`,
    ];
    const label = track.label;
    const firstDay = callDays[0];

    setSubmitting(true);
    window.setTimeout(() => {
      const quote = addEventQuote(payload);
      const ref = `EVQ-${(quote.id.split("_")[1] ?? quote.id).slice(0, 6).toUpperCase()}`;
      const summary = [`Hello Hakuna Matata FunCity! I just requested a ${label} quote (ref ${ref}).`, ...summaryLines]
        .filter(Boolean)
        .join("\n");
      setSubmitted({ quote, ref, summary, callDay: firstDay, callTime: null });
      setSubmitting(false);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }, 750);
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

  const onFormAnimationEnd = (e: AnimationEvent<HTMLFormElement>) => {
    if (e.target === e.currentTarget) setShake(false);
  };

  const showSuccess = submitted && submitted.quote.type === type;
  // Literal class names so Tailwind can generate them.
  const trackAnim =
    switches === 0
      ? ""
      : type === "corporate"
        ? "animate-[ev-in-right_440ms_cubic-bezier(0.2,0.7,0.2,1)_both]"
        : "animate-[ev-in-left_440ms_cubic-bezier(0.2,0.7,0.2,1)_both]";
  const collage = track.gallery.slice(0, 4);
  const moreCount = track.gallery.length - collage.length;

  return (
    <section id="events" className="section relative overflow-hidden bg-linen">
      <style>{EVENTS_CSS}</style>
      <div className="container-x">
        {/* Heading */}
        <div className="flex flex-col gap-8">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">Weddings · Celebrations · Retreats</p>
            <h2 className="display mt-3 text-4xl text-ink sm:text-5xl lg:text-6xl">Gather under the acacias</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
              Two dedicated event teams, one for love stories and one for teams that need room to think. Build a live
              estimate below and get a detailed quote within a day.
            </p>
          </Reveal>
          <Reveal delay={120} className="w-full md:w-fit">
            <TrackSwitch value={type} onChange={switchType} />
          </Reveal>
        </div>

        {/* Track intro + collage */}
        <div key={type} className={`mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-12 ${trackAnim}`}>
          <div className="lg:col-span-5 lg:pt-2">
            <Reveal>
              <h3 className="display text-3xl text-ink sm:text-4xl">{track.title}</h3>
              <p className="mt-4 leading-relaxed text-ink-soft">{track.intro}</p>
            </Reveal>
            <Reveal delay={100}>
              <dl className="mt-7 grid grid-cols-3 gap-3 border-y border-hairline py-5">
                {track.stats.map((s) => (
                  <div key={s.label} className="min-w-0">
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <CountUp to={s.to} suffix={s.suffix} className="display block text-2xl text-forest sm:text-4xl" />
                      <span className="mt-1 block text-xs leading-snug text-ink-mute">{s.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <Specs items={track.facts} className="mt-4 leading-7" />
            </Reveal>
            <Reveal delay={180} className="mt-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-ink-mute">Packages from</p>
                <p className="num mt-1 text-2xl text-ink">
                  {money(track.fromPrice.usd)}
                  <span className="ml-2 font-sans text-sm text-ink-mute">
                    {track.fromPrice.kind === "guest" ? "per guest" : "flat"}
                  </span>
                </p>
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => setLightbox(0)}>
                <GridIcon className="h-4 w-4" />
                View all {track.gallery.length} photos
              </button>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 md:h-[480px] md:grid-cols-4 md:grid-rows-2">
              {collage.map((img, i) => (
                <Reveal
                  key={img.src}
                  variant="scale"
                  delay={i * 90}
                  className={
                    i === 0
                      ? "col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto"
                      : i === 1
                        ? "col-span-2 aspect-[16/9] md:aspect-auto"
                        : "aspect-square md:aspect-auto"
                  }
                >
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    aria-label={`Open photo: ${img.alt}`}
                    className="group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    <Photo
                      src={img.src}
                      alt={img.alt}
                      sizes={i === 0 ? "(min-width: 768px) 30vw, 100vw" : "(min-width: 768px) 18vw, 50vw"}
                      className="absolute inset-0"
                      imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="pointer-events-none absolute bottom-3 left-3 right-3 flex translate-y-2 items-end justify-between gap-2 text-left text-xs font-medium text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="line-clamp-2">{img.alt}</span>
                      <ExpandIcon className="h-4 w-4 shrink-0" />
                    </span>
                    {i === collage.length - 1 && moreCount > 0 && (
                      <span className="absolute inset-0 grid place-items-center bg-ink/40 text-white transition-colors duration-300 group-hover:bg-ink/55">
                        <span className="text-center">
                          <span className="display block text-3xl">+{moreCount}</span>
                          <span className="text-xs font-semibold uppercase tracking-[0.14em]">more photos</span>
                        </span>
                      </span>
                    )}
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Quote builder */}
        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          {/* Steps */}
          <div ref={builderRef} className="lg:col-span-7">
            <Reveal className="card p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Quote builder</p>
                  <h3 className="display mt-2 text-2xl text-ink sm:text-3xl">
                    Plan your {type === "wedding" ? "celebration" : "retreat"}
                  </h3>
                </div>
                <p className="text-xs text-ink-mute">Prices update as you go</p>
              </div>

              <div key={type} className={switches > 0 ? `animate-[ev-fade-up_320ms_cubic-bezier(0.2,0.7,0.2,1)_both]` : ""}>
                <Step n="01" title="Choose a package">
                  <div className="grid gap-3 md:grid-cols-3">
                    {track.packages.map((p) => {
                      const active = p.id === pkg.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => patch({ packageId: p.id })}
                          className={`lift flex h-full flex-col rounded-2xl border p-4 text-left active:scale-[0.99] ${
                            active
                              ? "border-forest bg-forest-soft/50 ring-1 ring-forest"
                              : "border-hairline-strong bg-canvas hover:border-ink/25"
                          }`}
                        >
                          <span className="flex min-h-5 items-start justify-between gap-3">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ember">
                              {p.popular ? "Most chosen" : ""}
                            </span>
                            <CheckBadge checked={active} />
                          </span>
                          <span className="mt-1 text-[15px] font-semibold leading-snug text-ink">{p.name}</span>
                          <span className="num mt-2 text-lg text-forest">
                            {money(p.price.usd)}
                            <span className="ml-1 font-sans text-xs text-ink-mute">{p.price.kind === "guest" ? "/ guest" : "flat"}</span>
                          </span>
                          <span className="mt-1.5 text-xs leading-relaxed text-ink-mute">{p.summary}</span>
                          <ul className="mt-3 space-y-1.5 border-t border-hairline pt-3 text-xs text-ink-soft">
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
                  <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                    <div>
                      <label htmlFor={`ev-date-${type}`} className="label">
                        Event date
                      </label>
                      <input
                        id={`ev-date-${type}`}
                        type="date"
                        className="field num h-11"
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
                    <GuestSlider
                      id={`ev-guests-${type}`}
                      value={sel.guests}
                      min={track.guestMin}
                      max={track.guestMax}
                      step={track.guestStep}
                      onChange={(guests) => patch({ guests })}
                    />
                  </div>
                </Step>

                <Step n="03" title="Catering">
                  <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Catering tier">
                    {track.tiers.map((t) => {
                      const active = t.id === tier.id;
                      return (
                        <label
                          key={t.id}
                          className={`lift relative flex cursor-pointer flex-col rounded-2xl border p-4 active:scale-[0.99] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember ${
                            active ? "border-forest bg-forest-soft/50 ring-1 ring-forest" : "border-hairline-strong bg-canvas hover:border-ink/25"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`tier-${type}`}
                            checked={active}
                            onChange={() => patch({ tierId: t.id })}
                            className="sr-only"
                          />
                          <span className="flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold text-ink">{t.name}</span>
                            <RadioDot checked={active} />
                          </span>
                          <span className="mt-1.5 flex-1 text-xs leading-relaxed text-ink-mute">{t.description}</span>
                          <span className="mt-3 flex items-baseline justify-between gap-2 border-t border-hairline pt-3">
                            <span className="num text-sm text-ink">
                              {money(t.perGuestUSD)}
                              <span className="font-sans text-xs text-ink-mute"> / guest</span>
                            </span>
                            <span className="num text-xs text-ink-mute">{money(t.perGuestUSD * sel.guests)}</span>
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
                          className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-[background-color,border-color,scale] duration-200 active:scale-[0.99] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember ${
                            active ? "border-forest bg-forest-soft/50" : "border-hairline-strong bg-canvas hover:border-ink/25 hover:bg-linen"
                          }`}
                        >
                          <input type="checkbox" checked={active} onChange={() => toggleExtra(x.id)} className="sr-only" />
                          <CheckBadge checked={active} square />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-ink">{x.name}</span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-ink-mute">{x.description}</span>
                          </span>
                          <span className="num shrink-0 text-right text-xs text-forest">
                            {money(x.price.usd)}
                            <span className="block font-sans text-ink-mute">{x.price.kind === "guest" ? "/ guest" : "flat"}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Step>

                {type === "corporate" && (
                  <Step n="05" title="Overnight cottages">
                    <div className="rounded-2xl border border-hairline-strong p-4">
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
            </Reveal>
          </div>

          {/* Live estimate: in the flow on phones, sticky panel on desktop */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <aside ref={asideRef} className="card overflow-hidden lg:sticky lg:top-24" aria-label="Live estimate">
              <div className="relative overflow-hidden bg-forest px-5 py-6 text-white sm:px-6">
                <svg
                  viewBox="0 0 200 200"
                  className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 text-white/[0.06]"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M100 10c20 40 60 50 90 50-30 20-40 60-40 90-20-30-60-40-90-40 30-20 40-60 40-100Z" />
                </svg>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Live estimate</p>
                <div className="relative mt-2 flex items-end gap-3">
                  <p className="num text-3xl sm:text-4xl" aria-live="polite">
                    <AnimatedMoney usd={total} format={money} />
                  </p>
                  <DeltaFloat usd={total} resetKey={type} format={money} />
                </div>
                <p className="mt-1.5 text-sm text-white/75">
                  <span className="num">≈ {money(perGuest)}</span> per guest · {sel.guests} guests ·{" "}
                  {formatDate(eventDate, { year: true })}
                </p>
              </div>
              <div className="px-5 sm:px-6">
                <EstimateRows rows={rows} subtotal={subtotal} vat={vat} total={total} format={money} />
              </div>
              <div className="border-t border-hairline bg-linen px-5 py-4 sm:px-6">
                {!showSuccess && (
                  <button type="button" onClick={goToDetails} className="btn btn-ember mb-3 w-full">
                    Request detailed quote
                    <ArrowIcon className="h-4 w-4" />
                  </button>
                )}
                <p className="text-xs text-ink-mute">Estimate only, final quote within 24 h. No payment needed to enquire.</p>
              </div>
            </aside>
          </div>

          {/* Contact / success */}
          <div ref={resultRef} className="scroll-mt-24 lg:col-span-7 lg:col-start-1">
            {showSuccess && submitted ? (
              <SuccessCard
                submitted={submitted}
                callDays={callDays}
                onDay={(d) => setSubmitted({ ...submitted, callDay: d, callTime: null })}
                onTime={bookCall}
                onReset={() => setSubmitted(null)}
                estimate={money(submitted.quote.estimateUSD)}
              />
            ) : (
              <Reveal>
                <form
                  onSubmit={submit}
                  noValidate
                  onAnimationEnd={onFormAnimationEnd}
                  className={`card p-5 sm:p-7 ${shake ? "shake" : ""}`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="num text-xs text-ember">{type === "corporate" ? "06" : "05"}</span>
                    <h4 className="text-base font-semibold text-ink">Your details</h4>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field id="ev-name" label={type === "wedding" ? "Your name(s)" : "Contact name"} error={errors.name}>
                      <input
                        ref={nameRef}
                        id="ev-name"
                        className={`field h-11 ${errors.name ? "border-danger" : ""}`}
                        autoComplete="name"
                        value={contact.name}
                        onChange={setField("name")}
                      />
                    </Field>
                    {type === "corporate" ? (
                      <Field id="ev-org" label="Organisation">
                        <input
                          id="ev-org"
                          className="field h-11"
                          autoComplete="organization"
                          value={contact.organisation}
                          onChange={setField("organisation")}
                        />
                      </Field>
                    ) : (
                      <Field id="ev-phone" label="Phone / WhatsApp" error={errors.phone}>
                        <input
                          id="ev-phone"
                          className={`field h-11 ${errors.phone ? "border-danger" : ""}`}
                          type="tel"
                          autoComplete="tel"
                          placeholder="+256 7__ ___ ___"
                          value={contact.phone}
                          onChange={setField("phone")}
                        />
                      </Field>
                    )}
                    <Field id="ev-email" label="Email" error={errors.email}>
                      <input
                        id="ev-email"
                        className={`field h-11 ${errors.email ? "border-danger" : ""}`}
                        type="email"
                        autoComplete="email"
                        value={contact.email}
                        onChange={setField("email")}
                      />
                    </Field>
                    {type === "corporate" && (
                      <Field id="ev-phone" label="Phone / WhatsApp" error={errors.phone}>
                        <input
                          id="ev-phone"
                          className={`field h-11 ${errors.phone ? "border-danger" : ""}`}
                          type="tel"
                          autoComplete="tel"
                          placeholder="+256 7__ ___ ___"
                          value={contact.phone}
                          onChange={setField("phone")}
                        />
                      </Field>
                    )}
                    <div className={type === "corporate" ? "sm:col-span-2" : ""}>
                      <Field id="ev-notes" label="Anything else? (optional)">
                        <textarea
                          id="ev-notes"
                          className="field min-h-[88px] resize-y"
                          placeholder={
                            type === "wedding" ? "Ceremony style, colours, dietary needs…" : "Goals for the retreat, agenda, dietary needs…"
                          }
                          value={contact.notes}
                          onChange={setField("notes")}
                        />
                      </Field>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-ink-mute">We reply within 24 hours, usually sooner.</p>
                    <button type="submit" className="btn btn-ember min-h-11" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Sending request…
                        </>
                      ) : (
                        <>
                          Request detailed quote
                          <ArrowIcon className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Reveal>
            )}
          </div>
        </div>
      </div>

      {/* Phones: floating estimate bar (sits left of the concierge button) */}
      <div
        inert={!showBar}
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 right-[88px] z-30 transition duration-200 ease-out md:bottom-6 md:left-6 md:right-[104px] lg:hidden ${
          showBar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-hairline bg-canvas/95 shadow-xl shadow-black/10 backdrop-blur">
          <Collapse open={sheetOpen}>
            <div className="max-h-[50dvh] overflow-y-auto border-b border-hairline px-4 pb-2 pt-1">
              <EstimateRows rows={rows} subtotal={subtotal} vat={vat} total={total} format={money} compact />
              <button type="button" onClick={goToDetails} className="btn btn-ember btn-sm mb-2 mt-1 w-full">
                Request detailed quote
              </button>
            </div>
          </Collapse>
          <button
            type="button"
            onClick={() => setSheetOpen((o) => !o)}
            aria-expanded={sheetOpen}
            className="flex min-h-14 w-full items-center justify-between gap-2 px-4 py-2 text-left"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-mute">Live estimate</span>
              <span className="num block truncate text-lg leading-tight text-ink">
                <AnimatedMoney usd={total} format={money} />
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-forest">
              {sheetOpen ? "Hide" : "Details"}
              <ChevronIcon className={`h-4 w-4 transition-transform duration-200 ${sheetOpen ? "rotate-180" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <Lightbox
        images={track.gallery.map((g) => g.src)}
        captions={track.gallery.map((g) => g.alt)}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Track switch with a sliding indicator                               */
/* ------------------------------------------------------------------ */

function TrackSwitch({ value, onChange }: { value: EventType; onChange: (t: EventType) => void }) {
  const options: EventType[] = ["wedding", "corporate"];
  const index = options.indexOf(value);
  return (
    <div
      role="tablist"
      aria-label="Event type"
      className="relative grid w-full grid-cols-2 rounded-2xl border border-hairline-strong bg-canvas p-1 shadow-sm md:w-auto"
    >
      <span
        aria-hidden
        className="absolute bottom-1 left-1 top-1 rounded-xl bg-forest shadow-md transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ width: "calc(50% - 4px)", transform: `translateX(${index * 100}%)` }}
      />
      {options.map((t) => {
        const active = t === value;
        const tr = TRACKS[t];
        return (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t)}
            className={`relative z-10 flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200 sm:px-5 ${
              active ? "text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            {t === "wedding" ? <RingsIcon className="h-4 w-4 shrink-0" /> : <BriefcaseIcon className="h-4 w-4 shrink-0" />}
            <span className="md:hidden">{tr.tabShort}</span>
            <span className="hidden whitespace-nowrap md:inline">{tr.tab}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estimate pieces                                                     */
/* ------------------------------------------------------------------ */

function EstimateRows({
  rows,
  subtotal,
  vat,
  total,
  format,
  compact = false,
}: {
  rows: Row[];
  subtotal: number;
  vat: number;
  total: number;
  format: (usd: number) => string;
  compact?: boolean;
}) {
  const pad = compact ? "py-2" : "py-3";
  return (
    <dl>
      {rows.map((r) => (
        <Collapse key={r.id} open={r.open}>
          <div className={`flex items-start justify-between gap-4 border-b border-hairline ${pad}`}>
            <dt className="min-w-0">
              <span key={r.label} className={`block text-sm text-ink animate-[ev-fade-up_260ms_cubic-bezier(0.2,0.7,0.2,1)_both]`}>
                {r.label}
              </span>
              <span className="num block text-xs text-ink-mute">{r.detail}</span>
            </dt>
            <dd className="num shrink-0 text-sm text-ink">{format(r.usd)}</dd>
          </div>
        </Collapse>
      ))}
      <div className={`flex justify-between gap-4 border-b border-hairline text-sm ${pad}`}>
        <dt className="text-ink-soft">Subtotal</dt>
        <dd className="num text-ink">{format(subtotal)}</dd>
      </div>
      <div className={`flex justify-between gap-4 border-b border-hairline text-sm ${pad}`}>
        <dt className="text-ink-soft">VAT ({Math.round(VAT_RATE * 100)}%)</dt>
        <dd className="num text-ink">{format(vat)}</dd>
      </div>
      <div className={`flex justify-between gap-4 ${compact ? "py-2.5" : "py-4"}`}>
        <dt className="font-semibold text-ink">Estimated total</dt>
        <dd className="num text-lg font-semibold text-ink">{format(total)}</dd>
      </div>
    </dl>
  );
}

/** Height + fade collapse using the grid-rows trick. */
function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/** Smoothly tweens a number toward its latest value. */
function useTween(target: number, duration = 520): number {
  const [value, setValue] = useState(target);
  const current = useRef(target);
  useEffect(() => {
    const from = current.current;
    if (from === target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = reduced ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      current.current = v;
      setValue(v);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

function AnimatedMoney({ usd, format }: { usd: number; format: (usd: number) => string }) {
  const value = useTween(usd);
  return <>{format(value)}</>;
}

/** Small "+$120" that floats up whenever the total changes. */
function DeltaFloat({ usd, resetKey, format }: { usd: number; resetKey: string; format: (usd: number) => string }) {
  const [delta, setDelta] = useState<{ amount: number; id: number } | null>(null);
  const prev = useRef({ usd, resetKey });
  useEffect(() => {
    const p = prev.current;
    prev.current = { usd, resetKey };
    if (p.resetKey !== resetKey || p.usd === usd) return;
    const amount = usd - p.usd;
    const frame = requestAnimationFrame(() => setDelta((d) => ({ amount, id: (d?.id ?? 0) + 1 })));
    return () => cancelAnimationFrame(frame);
  }, [usd, resetKey]);
  if (!delta) return null;
  const up = delta.amount > 0;
  return (
    <span
      key={delta.id}
      aria-hidden
      className={`num mb-1.5 text-sm font-semibold animate-[ev-delta_1500ms_ease-out_both] ${up ? "text-[#bfe3c9]" : "text-[#f3c9b3]"}`}
    >
      {up ? "+" : ""}
      {format(delta.amount)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Success state                                                       */
/* ------------------------------------------------------------------ */

function SuccessCard({
  submitted,
  callDays,
  onDay,
  onTime,
  onReset,
  estimate,
}: {
  submitted: Submitted;
  callDays: string[];
  onDay: (d: string) => void;
  onTime: (t: string) => void;
  onReset: () => void;
  estimate: string;
}) {
  const q = submitted.quote;
  return (
    <div className="card animate-pop-in overflow-hidden">
      <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:p-7">
        <DrawnCheck />
        <div className="min-w-0">
          <h3 className="display text-2xl text-ink sm:text-3xl">Quote request received</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            Reference <span className="num font-semibold text-ink">{submitted.ref}</span>. Our events team will email a
            detailed quote to <span className="break-all font-medium text-ink">{q.email}</span> within 24 hours.
          </p>
          <Specs
            className="mt-3"
            items={[formatDate(q.date, { year: true }), `${q.guests} guests`, q.packageName, <span key="e" className="num">{estimate}</span>]}
          />
        </div>
      </div>

      <div className="border-t border-hairline bg-linen/60 p-5 sm:p-7">
        <h4 className="text-sm font-semibold text-ink">Book a 15-minute call with our planner</h4>
        <p className="mt-1 text-xs text-ink-mute">Times are East Africa Time (EAT). We&apos;ll ring {q.phone}.</p>
        <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2" role="radiogroup" aria-label="Call day">
          {callDays.map((d) => {
            const active = d === submitted.callDay;
            const [wd, day, mon] = formatDate(d).split(" ");
            return (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onDay(d)}
                className={`min-w-0 rounded-xl border px-1 py-2.5 text-center transition-[background-color,border-color,color,box-shadow] duration-200 ${
                  active
                    ? "border-forest bg-forest text-white shadow-md shadow-forest/20"
                    : "border-hairline-strong bg-canvas text-ink hover:border-ink/30"
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
        <div key={submitted.callDay} className="mt-3 grid grid-cols-2 gap-2 animate-fade-in sm:grid-cols-4" role="radiogroup" aria-label="Call time">
          {CALL_TIMES.map((t) => {
            const active = t === submitted.callTime;
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onTime(t)}
                className={`num flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm transition-[background-color,border-color,color] duration-200 ${
                  active
                    ? "border-ember bg-ember text-white animate-[ev-pop_280ms_ease-out]"
                    : "border-hairline-strong bg-canvas text-ink hover:border-ink/30"
                }`}
              >
                {active && <CheckIcon className="h-3.5 w-3.5" />}
                {t}
              </button>
            );
          })}
        </div>
        {submitted.callTime && (
          <p
            key={`${submitted.callDay}-${submitted.callTime}`}
            className={`mt-4 flex items-start gap-2 rounded-xl bg-forest-soft px-4 py-3 text-sm text-forest animate-[ev-fade-up_300ms_cubic-bezier(0.2,0.7,0.2,1)_both]`}
          >
            <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Call booked for <strong>{formatDate(submitted.callDay, { year: true })}</strong> at{" "}
              <strong className="num">{submitted.callTime}</strong> EAT. A calendar invite is on its way.
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-hairline p-5 sm:flex-row sm:p-7">
        <a href={whatsappLink(submitted.summary)} target="_blank" rel="noopener noreferrer" className="btn btn-primary min-h-11">
          <WhatsAppIcon className="h-4 w-4" />
          Continue on WhatsApp
        </a>
        <button type="button" className="btn btn-secondary min-h-11" onClick={onReset}>
          Start a new quote
        </button>
      </div>
    </div>
  );
}

function DrawnCheck() {
  return (
    <svg viewBox="0 0 52 52" className="h-14 w-14 shrink-0 text-forest" fill="none" aria-hidden>
      <circle cx="26" cy="26" r="25" className="fill-forest-soft" />
      <circle
        cx="26"
        cy="26"
        r="23"
        stroke="currentColor"
        strokeWidth="2"
        style={{ strokeDasharray: 145, strokeDashoffset: 145, animation: "ev-draw 700ms cubic-bezier(0.65,0,0.45,1) forwards" }}
      />
      <path
        d="M16 27l7 7 14-15"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ strokeDasharray: 36, strokeDashoffset: 36, animation: "ev-draw 380ms cubic-bezier(0.65,0,0.45,1) 560ms forwards" }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

function GuestSlider({
  id,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const p = (value - min) / (max - min);
  const nudge = step === 1 ? 1 : step * 2;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="label">
          Guests
        </label>
        <span className="num text-xs text-ink-mute">
          {min}–{max}
        </span>
      </div>
      <div className="relative mt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-full mb-1 -translate-x-1/2"
          style={{ left: `calc(${p * 100}% + ${11 - 22 * p}px)` }}
        >
          <div
            className={`relative rounded-lg bg-forest px-2.5 py-1 text-white shadow-md transition-transform duration-150 ${
              dragging ? "scale-110" : ""
            }`}
          >
            <span className="num text-sm font-semibold">{value}</span>
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-forest" />
          </div>
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onBlur={() => setDragging(false)}
          aria-valuetext={`${value} guests`}
          className="ev-range"
          style={{ "--ev-fill": `${p * 100}%` } as CSSProperties}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          className="btn btn-secondary btn-sm h-10 w-10 px-0"
          aria-label="Fewer guests"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - nudge))}
        >
          <MinusIcon />
        </button>
        <span className="text-xs text-ink-mute">Drag or tap to adjust</span>
        <button
          type="button"
          className="btn btn-secondary btn-sm h-10 w-10 px-0"
          aria-label="More guests"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + nudge))}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div className="mt-8 border-t border-hairline pt-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ember-soft text-xs text-ember">{n}</span>
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
      {error && <p className="mt-1.5 animate-fade-in text-xs text-danger">{error}</p>}
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
    <div className={`transition-opacity duration-200 ${disabled ? "opacity-45" : ""}`}>
      <p className="label">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-secondary btn-sm h-10 w-10 px-0"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <MinusIcon />
        </button>
        <span key={value} className={`num w-8 text-center text-lg text-ink animate-[ev-fade-up_200ms_cubic-bezier(0.2,0.7,0.2,1)_both]`}>
          {value}
        </span>
        <button
          type="button"
          className="btn btn-secondary btn-sm h-10 w-10 px-0"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <PlusIcon />
        </button>
        {suffix && <span className="text-xs text-ink-mute">{suffix}</span>}
      </div>
    </div>
  );
}

/** Round (radio-like) or square (checkbox) indicator with a check that draws itself. */
function CheckBadge({ checked, square = false }: { checked: boolean; square?: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition-colors duration-200 ${square ? "rounded-md" : "rounded-full"} ${
        checked ? "border-forest bg-forest" : "border-ink/25 bg-canvas"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3.2">
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 24,
            strokeDashoffset: checked ? 0 : 24,
            transition: "stroke-dashoffset 260ms cubic-bezier(0.65,0,0.35,1) 60ms",
          }}
        />
      </svg>
    </span>
  );
}

function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200 ${
        checked ? "border-forest" : "border-ink/25"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full bg-forest transition-transform duration-200 ${checked ? "scale-100" : "scale-0"}`} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
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

function ExpandIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function RingsIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="14" r="5" />
      <circle cx="15" cy="14" r="5" />
      <path d="M10 5l2-2 2 2-2 2-2-2Z" strokeLinejoin="round" />
    </svg>
  );
}

function BriefcaseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 13h17" strokeLinecap="round" />
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
