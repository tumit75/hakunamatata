"use client";

import { useState, type FormEvent } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Modal, Specs } from "@/components/ui/Overlay";
import { IMG } from "@/lib/images";
import { formatDate, type TableReservation } from "@/data/resortStorage";

type Dish = { name: string; note: string; priceUSD: number };

const MENU: { title: string; hours: string; dishes: Dish[] }[] = [
  {
    title: "Breakfast",
    hours: "7:00 – 10:30",
    dishes: [
      { name: "Garden rolex", note: "Chapati rolled with free-range eggs, tomato, cabbage and avocado", priceUSD: 6 },
      { name: "Katogo", note: "Matooke stewed with groundnut sauce and offal or beans", priceUSD: 7 },
      { name: "Tropical fruit plate", note: "Pineapple, passion fruit, pawpaw and sweet bananas from the farm", priceUSD: 5 },
      { name: "Mount Elgon coffee", note: "Single-origin arabica, pour-over or French press", priceUSD: 3 },
    ],
  },
  {
    title: "Lunch & Dinner",
    hours: "12:30 – 21:30",
    dishes: [
      { name: "Chicken luwombo", note: "Slow-steamed in banana leaves with groundnut sauce and matooke", priceUSD: 16 },
      { name: "Whole Nile tilapia", note: "Pan-fried with lemon, kachumbari and garden greens", priceUSD: 18 },
      { name: "Malakwang & millet", note: "Sour leaf stew with simsim paste, a northern Uganda classic", priceUSD: 11 },
      { name: "Beef pilau", note: "Spiced rice with tender beef, served with fresh chilli salsa", priceUSD: 13 },
    ],
  },
  {
    title: "From the Fire",
    hours: "Evenings from 18:30",
    dishes: [
      { name: "Goat muchomo skewers", note: "Charcoal-grilled with roasted gonja and pili pili", priceUSD: 14 },
      { name: "Fire-roasted gonja", note: "Sweet plantain with honey butter and toasted groundnuts", priceUSD: 6 },
      { name: "Lakeside fish platter", note: "Tilapia, Nile perch and silverfish for two to share", priceUSD: 32 },
      { name: "Campfire pineapple", note: "Grilled with cinnamon and vanilla ice cream", priceUSD: 7 },
    ],
  },
];

const TIME_SLOTS = ["07:30", "08:30", "09:30", "12:30", "13:30", "14:30", "18:30", "19:30", "20:30"];
const SEATING = ["Garden", "Veranda", "Fireside"];

type FormState = { name: string; phone: string; date: string; time: string; partySize: number; seating: string; notes: string };

export function Restaurant() {
  const { money, today, addTableReservation } = useResort();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmed, setConfirmed] = useState<TableReservation | null>(null);

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
  }

  return (
    <section id="dining" className="section bg-canvas">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
          {/* Collage */}
          <div className="grid grid-cols-5 grid-rows-[auto_auto] gap-3 sm:gap-4">
            <div className="group col-span-3 row-span-2">
              <Photo
                src={IMG.lodgeLounge}
                alt="Outdoor restaurant terrace set for dinner"
                sizes="(min-width: 1024px) 30vw, 60vw"
                className="h-full min-h-[320px] rounded-2xl sm:min-h-[440px]"
                imgClassName="transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="group col-span-2">
              <Photo
                src={IMG.diningClayPots}
                alt="A plated farm-to-table dish"
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="aspect-square rounded-2xl"
                imgClassName="transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
            <div className="group col-span-2">
              <Photo
                src={IMG.diningFeast}
                alt="Food cooking over an open grill"
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="aspect-square rounded-2xl"
                imgClassName="transition duration-500 group-hover:scale-[1.04]"
              />
            </div>
          </div>

          <div>
            <p className="eyebrow">The Garden Restaurant</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Cooked over wood, picked this morning</h2>
            <p className="mt-5 text-base leading-relaxed text-ink-soft">
              Chef Joseline Nansubuga cooks the food she grew up with in Masaka, made with what our kitchen garden and
              neighbouring farms bring in each day. Tables sit under the jacaranda, on the veranda, or close to the
              evening fire.
            </p>
            <Specs className="mt-5" items={["Open to day visitors", "Vegetarian & halal options", "Kids' menu", "Reservations recommended on weekends"]} />
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={openModal} className="btn btn-primary">
                Reserve a garden table
              </button>
              <a href="#activities" className="btn btn-secondary">
                Pair it with an activity
              </a>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="mt-16 grid gap-10 border-t border-hairline pt-12 md:grid-cols-3 md:gap-8">
          {MENU.map((col) => (
            <div key={col.title}>
              <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-3">
                <h3 className="display text-2xl">{col.title}</h3>
                <p className="num text-xs text-ink-mute">{col.hours}</p>
              </div>
              <ul className="mt-4 space-y-5">
                {col.dishes.map((d) => (
                  <li key={d.name}>
                    <div className="flex items-baseline gap-3">
                      <p className="font-semibold text-ink">{d.name}</p>
                      <span className="flex-1 border-b border-dotted border-hairline-strong" aria-hidden />
                      <p className="num text-sm text-forest">{money(d.priceUSD)}</p>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-mute">{d.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
            <div className="flex items-center gap-3 rounded-xl bg-forest-soft p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-sm text-forest">
                Thank you, {confirmed.name.split(" ")[0]}. We&apos;ve sent a confirmation by SMS to{" "}
                <span className="num">{confirmed.phone}</span>.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
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
            <button type="button" onClick={() => setOpen(false)} className="btn btn-primary w-full">
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
            <div>
              <label htmlFor="tbl-date" className="label">
                Date
              </label>
              <input
                id="tbl-date"
                type="date"
                className="field num"
                required
                min={today}
                value={current.date}
                onChange={(e) => e.target.value && set("date", e.target.value)}
              />
            </div>
            <div>
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
            <div>
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
            <div>
              <span className="label">Seating</span>
              <div className="grid grid-cols-3 gap-1.5">
                {SEATING.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("seating", s)}
                    aria-pressed={current.seating === s}
                    className={`rounded-[10px] border px-2 py-2.5 text-xs font-semibold transition ${
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
            <button type="submit" className="btn btn-primary col-span-2">
              Confirm reservation
            </button>
          </form>
        )}
      </Modal>
    </section>
  );
}
