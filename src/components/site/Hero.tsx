"use client";

import type { FormEvent } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Specs } from "@/components/ui/Overlay";
import { IMG } from "@/lib/images";
import { addDays, diffDays } from "@/data/resortStorage";

export function Hero() {
  const { today, search, setSearch, cottages, openBooking, money, rateFor } = useResort();
  const lowestRate = Math.min(...cottages.map((c) => rateFor(c.id)));
  const nights = Math.max(0, diffDays(search.checkIn, search.checkOut));

  function onCheckIn(value: string) {
    if (!value) return;
    const patch: { checkIn: string; checkOut?: string } = { checkIn: value };
    if (search.checkOut <= value) patch.checkOut = addDays(value, 1);
    setSearch(patch);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (search.cottageId !== "any") {
      openBooking({
        cottageId: search.cottageId,
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: search.guests,
      });
      return;
    }
    document.getElementById("stay")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="top" className="relative bg-linen">
      <div className="relative isolate flex min-h-[88svh] items-end overflow-hidden pb-36 pt-28 sm:pb-40 lg:min-h-[92svh]">
        <Photo
          src={IMG.hero}
          alt="Mist rising over green forested hills at sunrise"
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10"
          imgClassName="scale-[1.02]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/35 via-ink/20 to-ink/75" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-forest-deep/60 to-transparent" aria-hidden />

        <div className="container-x">
          <div className="max-w-3xl animate-rise-in">
            <p className="eyebrow text-ember-soft">Nature resort · Wakiso, Uganda</p>
            <h1 className="display mt-4 text-[2.6rem] text-white sm:text-6xl lg:text-[4.6rem]">
              Slow mornings, birdsong <span className="italic text-ember-soft">and nowhere</span> you need to be.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Five hand-built cottages set in botanical gardens just outside Kampala. Wake to hornbills, eat what the
              farm grew this week, and let the evening end around the fire.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#stay" className="btn btn-ember">
                Explore the cottages
              </a>
              <a
                href="#events"
                className="btn border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                Plan a wedding or retreat
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Booking search bar overlapping the hero */}
      <div className="container-x relative z-10 -mt-24 pb-10 sm:-mt-20">
        <form
          onSubmit={onSubmit}
          className="card grid grid-cols-2 gap-3 p-4 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.35)] sm:p-5 lg:grid-cols-[1fr_1fr_0.7fr_1.3fr_auto] lg:items-end lg:gap-4"
          aria-label="Check availability"
        >
          <div>
            <label htmlFor="hero-checkin" className="label">
              Check-in
            </label>
            <input
              id="hero-checkin"
              type="date"
              className="field num"
              min={today}
              value={search.checkIn}
              onChange={(e) => onCheckIn(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="hero-checkout" className="label">
              Check-out
            </label>
            <input
              id="hero-checkout"
              type="date"
              className="field num"
              min={addDays(search.checkIn, 1)}
              value={search.checkOut}
              onChange={(e) => e.target.value && setSearch({ checkOut: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="hero-guests" className="label">
              Guests
            </label>
            <select
              id="hero-guests"
              className="field"
              value={search.guests}
              onChange={(e) => setSearch({ guests: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  {g} {g === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hero-cottage" className="label">
              Cottage
            </label>
            <select
              id="hero-cottage"
              className="field"
              value={search.cottageId}
              onChange={(e) => setSearch({ cottageId: e.target.value })}
            >
              <option value="any">Any cottage</option>
              {cottages.map((c) => (
                <option key={c.id} value={c.id} disabled={c.guests < search.guests}>
                  {c.name}
                  {c.guests < search.guests ? ` (max ${c.guests})` : ""}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary col-span-2 h-[46px] lg:col-span-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" strokeLinecap="round" />
            </svg>
            {search.cottageId === "any" ? "Check availability" : "Reserve dates"}
          </button>
          <p className="col-span-2 text-xs text-ink-mute lg:col-span-5">
            <span className="num">{nights}</span> {nights === 1 ? "night" : "nights"} · Cottages from{" "}
            <span className="num font-semibold text-ink">{money(lowestRate)}</span> a night · No booking fees
          </p>
        </form>

        <Specs
          className="mt-6 text-center"
          items={["45 min from Kampala", "5 cottages", "MTN MoMo & Airtel Money accepted", "Breakfast included"]}
        />
      </div>
    </section>
  );
}
