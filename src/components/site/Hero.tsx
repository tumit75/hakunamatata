"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Marquee, Parallax, SplitWords } from "@/components/ui/Motion";
import { IMG } from "@/lib/images";
import { addDays, diffDays } from "@/data/resortStorage";

const SLIDES = [
  { src: IMG.hero, alt: "The resort pool and sunken lounge on a lawn shaded by acacias", label: "The acacia lawn" },
  { src: IMG.heroPool, alt: "A round plunge pool on a timber deck above the savanna", label: "Plunge pool views" },
  { src: IMG.heroLodge, alt: "A thatched timber cottage on a green, forested hillside", label: "Thatched cottages" },
];

const SLIDE_MS = 6500;

const FACTS = [
  "45 min from Kampala",
  "MTN MoMo & Airtel Money",
  "Breakfast included",
  "5 nature cottages",
  "Weddings up to 300 guests",
  "Free Wi-Fi",
];

/** Fade-and-rise entrance used for the hero copy. */
const enter = (delay: number, duration = 900): CSSProperties => ({
  animation: `rise-in ${duration}ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms both`,
});

export function Hero() {
  const { today, search, setSearch, cottages, openBooking, money, rateFor } = useResort();
  const lowestRate = Math.min(...cottages.map((c) => rateFor(c.id)));
  const nights = Math.max(0, diffDays(search.checkIn, search.checkOut));

  const [slide, setSlide] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [armed, setArmed] = useState(false);

  // Advance the slideshow; restarts whenever the slide changes (manual or automatic).
  useEffect(() => {
    const t = window.setTimeout(() => {
      setPrev(slide);
      setSlide((slide + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [slide]);

  // Start the progress bar one frame after mount so the first fill animates too.
  useEffect(() => {
    const r = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(r);
  }, []);

  function goTo(i: number) {
    if (i === slide) return;
    setPrev(slide);
    setSlide(i);
  }

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
      <div className="relative isolate flex min-h-[min(100svh,860px)] items-end overflow-hidden pb-44 pt-28 sm:pb-40 lg:h-[100svh] lg:max-h-[980px] lg:min-h-[620px] lg:pb-44">
        {/* Slideshow */}
        <Parallax speed={0.18} className="absolute inset-x-0 -top-[14%] -bottom-[14%] -z-10">
          {SLIDES.map((s, i) => {
            const isActive = i === slide;
            const moving = isActive || i === prev;
            return (
              <div
                key={s.src}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${isActive ? "opacity-100" : "opacity-0"}`}
              >
                <Photo
                  src={s.src}
                  alt={isActive ? s.alt : ""}
                  priority={i === 0}
                  sizes="100vw"
                  className="absolute inset-0"
                  imgClassName={moving ? "ken-burns" : ""}
                />
              </div>
            );
          })}
        </Parallax>
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-ink/45 via-ink/15 to-ink/70" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-linear-to-t from-forest-deep/75 via-forest-deep/25 to-transparent" aria-hidden />
        <div className="absolute inset-y-0 left-0 -z-10 hidden w-2/3 bg-linear-to-r from-ink/35 to-transparent md:block" aria-hidden />

        <div className="container-x w-full">
          <div className="max-w-3xl">
            <p className="eyebrow text-ember-soft" style={enter(80, 700)}>
              Nature resort · Wakiso, Uganda
            </p>
            <h1 className="display mt-4 text-[clamp(2.35rem,7.2vw,4.75rem)] text-white [text-wrap:balance]">
              <SplitWords text="Slow mornings, birdsong" baseDelay={150} />{" "}
              <SplitWords text="and nowhere" baseDelay={360} className="italic text-ember-soft" wordClassName="pr-[0.05em]" />{" "}
              <SplitWords text="you need to be." baseDelay={500} />
            </h1>
            <p
              className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-white/85 sm:text-lg"
              style={enter(700)}
            >
              Five hand-built cottages in botanical gardens just outside Kampala. Wake to hornbills, eat what the farm
              grew this week, and let the evening end around the fire.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3" style={enter(820)}>
              <a href="#stay" className="btn btn-ember min-h-11 shadow-[0_10px_30px_-12px_rgba(200,125,85,0.8)]">
                Explore the cottages
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#events"
                className="btn min-h-11 border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                Plan a wedding or retreat
              </a>
            </div>

            {/* Slide indicators */}
            <div className="mt-9 flex max-w-md gap-3" style={enter(950)}>
              {SLIDES.map((s, i) => {
                const isActive = i === slide;
                return (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show photo ${i + 1}: ${s.label}`}
                    aria-current={isActive ? "true" : undefined}
                    className="group min-h-10 flex-1 py-2 text-left"
                  >
                    <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/25">
                      <span
                        className="absolute inset-0 origin-left rounded-full bg-white"
                        style={{
                          transform: armed && isActive ? "scaleX(1)" : "scaleX(0)",
                          transition: armed && isActive ? `transform ${SLIDE_MS}ms linear` : "none",
                        }}
                      />
                    </span>
                    <span
                      className={`mt-2 hidden text-xs font-medium transition-colors duration-200 sm:block ${
                        isActive ? "text-white" : "text-white/60 group-hover:text-white/90"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <a
          href="#experiences"
          aria-label="Scroll to experiences"
          className="absolute bottom-48 right-6 hidden flex-col items-center gap-3 text-white/70 transition-colors hover:text-white md:flex lg:right-10"
          style={enter(1300)}
        >
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] [writing-mode:vertical-rl]">Scroll</span>
          <span className="relative block h-12 w-px overflow-hidden bg-white/25">
            <span className="float-y absolute inset-x-0 top-0 block h-1/2 bg-white" />
          </span>
        </a>
      </div>

      {/* Booking search bar overlapping the hero */}
      <div className="container-x relative z-10 -mt-32 sm:-mt-24">
        <form
          onSubmit={onSubmit}
          style={enter(650, 800)}
          className="card grid grid-cols-2 gap-3 p-4 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)] sm:p-5 md:grid-cols-4 lg:grid-cols-[1fr_1fr_0.75fr_1.3fr_auto] lg:items-end lg:gap-4"
          aria-label="Check availability"
        >
          <div className="min-w-0">
            <label htmlFor="hero-checkin" className="label">
              Check-in
            </label>
            <input
              id="hero-checkin"
              type="date"
              className="field num min-h-11 px-2.5 sm:px-3"
              min={today}
              value={search.checkIn}
              onChange={(e) => onCheckIn(e.target.value)}
              required
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="hero-checkout" className="label">
              Check-out
            </label>
            <input
              id="hero-checkout"
              type="date"
              className="field num min-h-11 px-2.5 sm:px-3"
              min={addDays(search.checkIn, 1)}
              value={search.checkOut}
              onChange={(e) => e.target.value && setSearch({ checkOut: e.target.value })}
              required
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="hero-guests" className="label">
              Guests
            </label>
            <select
              id="hero-guests"
              className="field min-h-11"
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
          <div className="min-w-0">
            <label htmlFor="hero-cottage" className="label">
              Cottage
            </label>
            <select
              id="hero-cottage"
              className="field min-h-11 truncate"
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
          <button type="submit" className="btn btn-primary col-span-2 min-h-11 md:col-span-4 lg:col-span-1 lg:h-[46px]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4-4" strokeLinecap="round" />
            </svg>
            {search.cottageId === "any" ? "Check availability" : "Reserve dates"}
          </button>
          <p className="col-span-2 text-xs text-ink-mute md:col-span-4 lg:col-span-5">
            <span className="num">{nights}</span> {nights === 1 ? "night" : "nights"} · Cottages from{" "}
            <span className="num font-semibold text-ink">{money(lowestRate)}</span> a night · No booking fees
          </p>
        </form>
      </div>

      {/* Facts ticker */}
      <div className="mt-8 border-y border-hairline bg-canvas/70 py-3.5 sm:mt-10">
        <Marquee speed={48} className="text-sm text-ink-soft [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
          {[...FACTS, ...FACTS].map((f, i) => (
            <span key={`${f}-${i}`} className="flex items-center gap-5 whitespace-nowrap pr-5">
              <LeafIcon />
              <span>{f}</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-forest/55" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" strokeLinejoin="round" />
      <path d="M5 19 13 11" strokeLinecap="round" />
    </svg>
  );
}
