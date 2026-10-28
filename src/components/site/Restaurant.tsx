"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Modal, Segmented, Specs } from "@/components/ui/Overlay";
import { Parallax, Reveal } from "@/components/ui/Motion";
import { IMG } from "@/lib/images";
import { formatDate, type TableReservation } from "@/data/resortStorage";

type Dish = { name: string; note: string; priceUSD: number };
type MenuKey = "breakfast" | "mains" | "fire";

const MENU: Record<MenuKey, { title: string; hours: string; image: string; alt: string; dishes: Dish[] }> = {
  breakfast: {
    title: "Breakfast",
    hours: "7:00 – 10:30",
    image: IMG.breakfastSpread,
    alt: "Fresh peppers, beans and greens from the kitchen garden",
    dishes: [
      { name: "Garden rolex", note: "Chapati rolled with free-range eggs, tomato, cabbage and avocado", priceUSD: 6 },
      { name: "Katogo", note: "Matooke stewed with groundnut sauce and offal or beans", priceUSD: 7 },
      { name: "Tropical fruit plate", note: "Pineapple, passion fruit, pawpaw and sweet bananas from the farm", priceUSD: 5 },
      { name: "Mount Elgon coffee", note: "Single-origin arabica, pour-over or French press", priceUSD: 3 },
    ],
  },
  mains: {
    title: "Lunch & Dinner",
    hours: "12:30 – 21:30",
    image: IMG.diningStew,
    alt: "Slow-cooked stew served in a clay pot",
    dishes: [
      { name: "Chicken luwombo", note: "Slow-steamed in banana leaves with groundnut sauce and matooke", priceUSD: 16 },
      { name: "Whole Nile tilapia", note: "Pan-fried with lemon, kachumbari and garden greens", priceUSD: 18 },
      { name: "Malakwang & millet", note: "Sour leaf stew with simsim paste, a northern Uganda classic", priceUSD: 11 },
      { name: "Beef pilau", note: "Spiced rice with tender beef, served with fresh chilli salsa", priceUSD: 13 },
    ],
  },
  fire: {
    title: "From the Fire",
    hours: "Evenings from 18:30",
    image: IMG.diningGrill,
    alt: "Charcoal-grilled meat and vegetables on the table",
    dishes: [
      { name: "Goat muchomo skewers", note: "Charcoal-grilled with roasted gonja and pili pili", priceUSD: 14 },
      { name: "Fire-roasted gonja", note: "Sweet plantain with honey butter and toasted groundnuts", priceUSD: 6 },
      { name: "Lakeside fish platter", note: "Tilapia, Nile perch and silverfish for two to share", priceUSD: 32 },
      { name: "Campfire pineapple", note: "Grilled with cinnamon and vanilla ice cream", priceUSD: 7 },
    ],
  },
};

const MENU_TABS: { value: MenuKey; label: ReactNode }[] = [
  { value: "breakfast", label: "Breakfast" },
  {
    value: "mains",
    label: (
      <>
        <span className="sm:hidden">Mains</span>
        <span className="hidden sm:inline">Lunch &amp; Dinner</span>
      </>
    ),
  },
  {
    value: "fire",
    label: (
      <>
        <span className="sm:hidden">The fire</span>
        <span className="hidden sm:inline">From the Fire</span>
      </>
    ),
  },
];

const TIME_SLOTS = ["07:30", "08:30", "09:30", "12:30", "13:30", "14:30", "18:30", "19:30", "20:30"];
const SEATING = ["Garden", "Veranda", "Fireside"];

type FormState = { name: string; phone: string; date: string; time: string; partySize: number; seating: string; notes: string };

export function Restaurant() {
  const { money, today, addTableReservation } = useResort();
  const [tab, setTab] = useState<MenuKey>("mains");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmed, setConfirmed] = useState<TableReservation | null>(null);
  const [drawn, setDrawn] = useState(false);
  const menu = MENU[tab];

  const current: FormState = form ?? {
    name: "",
    phone: "",
    date: today,
    time: "19:30",
    partySize: 2,
    seating: "Garden",
    notes: "",
  };

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm({ ...current, [key]: value });
  }

  function openModal() {
    setConfirmed(null);
    setDrawn(false);
    setForm(null);
    setOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const created = addTableReservation({
      name: current.name.trim(),
      phone: current.phone.trim(),
      date: current.date,
      time: current.time,
      partySize: current.partySize,
      seating: current.seating,
      notes: current.notes.trim() || undefined,
    });
    setConfirmed(created);
    setDrawn(false);
    // Two frames so the check starts undrawn, then draws in.
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
  }

  return (
    <section id="dining" className="section overflow-hidden bg-canvas">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          {/* Collage */}
          <Reveal variant="left" className="relative">
            <div className="grid grid-cols-5 gap-3 sm:gap-4">
              <div className="group relative col-span-3 row-span-2 min-h-[300px] overflow-hidden rounded-2xl sm:min-h-[460px]">
                <Parallax speed={0.06} className="absolute inset-x-0 -top-[15%] -bottom-[15%]">
                  <Photo
                    src={IMG.bushDinner}
                    alt="A candlelit dinner table set by the water at dusk"
                    sizes="(min-width: 1024px) 30vw, 60vw"
                    className="absolute inset-0"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </Parallax>
              </div>
              <div className="group relative col-span-2 aspect-square overflow-hidden rounded-2xl">
                <Photo
                  src={IMG.diningClayPots}
                  alt="Ugandan stews served in clay pots"
                  sizes="(min-width: 1024px) 20vw, 40vw"
                  className="absolute inset-0"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </div>
              <div className="group relative col-span-2 aspect-square overflow-hidden rounded-2xl">
                <Photo
                  src={IMG.diningFeast}
                  alt="Grilled fish, skewers and spiced rice laid out to share"
                  sizes="(min-width: 1024px) 20vw, 40vw"
                  className="absolute inset-0"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </div>
            </div>
            <div className="card absolute -bottom-6 left-4 hidden items-center gap-3 px-4 py-3 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.35)] sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-soft text-forest">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5V12l3 2" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block text-xs text-ink-mute">Open daily</span>
                <span className="num block text-sm font-semibold">07:00 – 22:00</span>
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow">The Garden Restaurant</p>
            <h2 className="display mt-3 text-[clamp(2.1rem,5vw,3.25rem)] [text-wrap:balance]">
              Cooked over wood, picked this morning
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Chef Joseline Nansubuga cooks the food she grew up with in Masaka, made with what our kitchen garden and
              neighbouring farms bring in each day. Tables sit under the jacaranda, on the veranda, or close to the
              evening fire.
            </p>
            <Specs
              className="mt-5"
              items={["Open to day visitors", "Vegetarian & halal options", "Kids' menu", "Book ahead on weekends"]}
            />
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={openModal} className="btn btn-primary min-h-11">
                Reserve a garden table
              </button>
              <a href="#activities" className="btn btn-secondary min-h-11">
                Pair it with an activity
              </a>
            </div>
          </Reveal>
        </div>

        {/* Menu */}
        <Reveal className="mt-20 border-t border-hairline pt-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="display text-3xl">Today&apos;s menu</h3>
              <p className="mt-1 text-sm text-ink-mute">
                {menu.title} · <span className="num">{menu.hours}</span>
              </p>
            </div>
            <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <Segmented value={tab} onChange={setTab} options={MENU_TABS} />
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-12">
            <ul key={tab} className="grid content-start gap-x-10 gap-y-7 md:grid-cols-2">
              {menu.dishes.map((d, i) => (
                <li
                  key={d.name}
                  style={{ animation: `rise-in 420ms cubic-bezier(0.2,0.7,0.2,1) ${i * 60}ms both` }}
                  className="group"
                >
                  <div className="flex items-baseline gap-3">
                    <p className="font-semibold text-ink transition-colors group-hover:text-forest">{d.name}</p>
                    <span className="flex-1 translate-y-[-3px] border-b border-dotted border-hairline-strong" aria-hidden />
                    <p className="num text-sm text-forest">{money(d.priceUSD)}</p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink-mute">{d.note}</p>
                </li>
              ))}
            </ul>
            <div className="relative hidden aspect-[5/4] overflow-hidden rounded-2xl lg:block">
              {MENU_TABS.map((t) => (
                <div
                  key={t.value}
                  className={`absolute inset-0 transition-opacity duration-500 ${t.value === tab ? "opacity-100" : "opacity-0"}`}
                  aria-hidden={t.value !== tab}
                >
                  <Photo
                    src={MENU[t.value].image}
                    alt={t.value === tab ? MENU[t.value].alt : ""}
                    sizes="300px"
                    className="absolute inset-0"
                    imgClassName={`transition-transform duration-[1200ms] ease-out ${t.value === tab ? "scale-100" : "scale-105"}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="The Garden Restaurant"
        title={confirmed ? "Your table is reserved" : "Reserve a garden table"}
        size="md"
      >
        {confirmed ? (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-forest-soft p-6 text-center">
              <svg viewBox="0 0 52 52" className="h-14 w-14 text-forest" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <circle
                  cx="26"
                  cy="26"
                  r="23"
                  strokeOpacity="0.25"
                  style={{
                    strokeDasharray: 145,
                    strokeDashoffset: drawn ? 0 : 145,
                    transition: "stroke-dashoffset 600ms cubic-bezier(0.65,0,0.35,1)",
                  }}
                />
                <path
                  d="M15 27l7 7 15-16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 40,
                    strokeDashoffset: drawn ? 0 : 40,
                    transition: "stroke-dashoffset 450ms cubic-bezier(0.65,0,0.35,1) 420ms",
                  }}
                />
              </svg>
              <p className="text-sm text-forest">
                Thank you, {confirmed.name.split(" ")[0]}. We&apos;ve sent a confirmation by SMS to{" "}
                <span className="num">{confirmed.phone}</span>.
              </p>
            </div>
            <dl
              className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm"
              style={{ animation: "rise-in 420ms cubic-bezier(0.2,0.7,0.2,1) 300ms both" }}
            >
              <dt className="text-ink-mute">Date</dt>
              <dd className="num text-right font-semibold">{formatDate(confirmed.date, { year: true })}</dd>
              <dt className="text-ink-mute">Time</dt>
              <dd className="num text-right font-semibold">{confirmed.time}</dd>
              <dt className="text-ink-mute">Party</dt>
              <dd className="num text-right font-semibold">
                {confirmed.partySize} {confirmed.partySize === 1 ? "guest" : "guests"}
              </dd>
              <dt className="text-ink-mute">Seating</dt>
              <dd className="text-right font-semibold">{confirmed.seating}</dd>
            </dl>
            <p className="text-xs text-ink-mute">
              We hold tables for 20 minutes. Running late? Call the restaurant and we&apos;ll keep the fire going.
            </p>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-primary min-h-11 w-full">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="tbl-name" className="label">
                Full name
              </label>
              <input
                id="tbl-name"
                className="field"
                required
                autoComplete="name"
                value={current.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Sarah Namukasa"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="tbl-phone" className="label">
                Phone
              </label>
              <input
                id="tbl-phone"
                className="field num"
                required
                type="tel"
                autoComplete="tel"
                value={current.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+256 7XX XXX XXX"
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="tbl-date" className="label">
                Date
              </label>
              <input
                id="tbl-date"
                type="date"
                className="field num px-2.5"
                required
                min={today}
                value={current.date}
                onChange={(e) => e.target.value && set("date", e.target.value)}
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="tbl-time" className="label">
                Time
              </label>
              <select id="tbl-time" className="field num" value={current.time} onChange={(e) => set("time", e.target.value)}>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="tbl-party" className="label">
                Party size
              </label>
              <select
                id="tbl-party"
                className="field"
                value={current.partySize}
                onChange={(e) => set("partySize", Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="label">Seating</span>
              <div className="grid grid-cols-3 gap-1.5">
                {SEATING.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("seating", s)}
                    aria-pressed={current.seating === s}
                    className={`min-h-10 rounded-[10px] border px-2 text-xs font-semibold transition duration-150 ${
                      current.seating === s
                        ? "border-forest bg-forest-soft text-forest"
                        : "border-hairline-strong text-ink-soft hover:border-ink"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label htmlFor="tbl-notes" className="label">
                Notes (optional)
              </label>
              <textarea
                id="tbl-notes"
                className="field min-h-[80px]"
                value={current.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Birthday, allergies, high chair…"
              />
            </div>
            <button type="submit" className="btn btn-primary col-span-2 min-h-11">
              Confirm reservation
            </button>
          </form>
        )}
      </Modal>
    </section>
  );
}
