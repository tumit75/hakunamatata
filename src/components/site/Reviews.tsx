"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { Specs } from "@/components/ui/Overlay";
import { CountUp, Lightbox, Reveal } from "@/components/ui/Motion";
import { IMG } from "@/lib/images";

const REVIEWS = [
  {
    name: "Esther Nabirye",
    from: "Kampala",
    stay: "Forest Garden Banda · 2 nights",
    rating: 5,
    quote:
      "Forty-five minutes from my office and it felt like another country. The luwombo was better than my grandmother's, and I will deny ever saying that.",
  },
  {
    name: "Tom & Marieke de Vries",
    from: "Utrecht",
    stay: "Sunset Horizon Loft · 4 nights",
    rating: 5,
    quote:
      "We came for a quiet end to our safari and got exactly that. Sunsets from the roof deck, blankets by the fire bowl, and a driver waiting at Entebbe on time.",
  },
  {
    name: "Patricia Auma",
    from: "Kampala Fintech Ltd",
    stay: "Corporate retreat · 45 guests",
    rating: 5,
    quote:
      "The team-building facilitator had our engineers and sales team actually talking to each other. Everything was paid by MoMo in one go. Already rebooked for next year.",
  },
  {
    name: "James Mugisha",
    from: "Mbarara",
    stay: "Acacia Family Pavilion · 3 nights",
    rating: 5,
    quote:
      "The kids disappeared into the fun park after breakfast and only came back when they smelled the campfire. My wife and I read two whole books.",
  },
  {
    name: "Ruth Tumusiime",
    from: "Entebbe",
    stay: "Garden wedding · 180 guests",
    rating: 5,
    quote:
      "Our wedding under the jacarandas was everything we pictured. The events team handled the décor, the band and three aunties with very strong opinions.",
  },
  {
    name: "Daniel Byaruhanga",
    from: "London & Fort Portal",
    stay: "Savannah Stone Villa · 3 nights",
    rating: 4,
    quote:
      "Home for Christmas and wanted somewhere my parents could rest. The plunge pool was a hit. Only wish we'd booked the birding trek earlier, it fills up.",
  },
];

const GALLERY = [
  { src: IMG.teaTerraces, alt: "Tea terraces on the green hills of western Uganda", className: "row-span-2 min-h-[280px] sm:min-h-0" },
  { src: IMG.elephants, alt: "An elephant and her calf among the borassus palms", className: "aspect-[4/3] sm:aspect-auto" },
  { src: IMG.archPool, alt: "The pool and acacia lawn through the old stone arch", className: "aspect-[4/3] sm:aspect-auto" },
  { src: IMG.weddingDance, alt: "Dancing at an outdoor wedding reception", className: "aspect-[4/3] sm:aspect-auto" },
  { src: IMG.sunsetTable, alt: "A long dinner table under string lights at sunset", className: "aspect-[4/3] sm:aspect-auto" },
  {
    src: IMG.acaciaSunset,
    alt: "An acacia tree silhouetted against the sunset",
    className: "col-span-2 aspect-[16/7] sm:col-span-1 sm:col-start-4 sm:row-span-2 sm:row-start-1 sm:aspect-auto",
  },
];

const GALLERY_SRCS = GALLERY.map((g) => g.src);
const GALLERY_CAPTIONS = GALLERY.map((g) => g.alt);
const ADVANCE_MS = 7000;

function Stars({ rating, size = "h-3.5 w-3.5" }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`${size} ${i <= rating ? "text-ember" : "text-stone-deep"}`} fill="currentColor" aria-hidden>
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z" />
        </svg>
      ))}
    </span>
  );
}

function initials(name: string) {
  return name
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Reviews() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const count = REVIEWS.length;
  const r = REVIEWS[index];

  const go = useCallback(
    (step: 1 | -1) => {
      setDir(step);
      setIndex((i) => (i + step + count) % count);
    },
    [count],
  );

  const pick = (i: number) => {
    if (i === index) return;
    setDir(i > index ? 1 : -1);
    setIndex(i);
  };

  // Auto-advance unless the visitor is hovering or focused inside.
  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => go(1), ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, go]);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  return (
    <section id="stories" className="section bg-linen">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <p className="eyebrow">Guest stories</p>
            <h2 className="display mt-3 text-[clamp(2.1rem,5vw,3.25rem)]">In their own words</h2>
          </Reveal>
          <Reveal delay={120} className="lg:justify-self-end">
            <div className="flex items-center gap-3">
              <span className="display text-5xl leading-none">
                <CountUp to={4.9} decimals={1} className="font-serif" />
              </span>
              <span>
                <Stars rating={5} size="h-4 w-4" />
                <span className="mt-1 block text-xs text-ink-mute">
                  from <span className="num">412</span> verified reviews
                </span>
              </span>
            </div>
            <Specs className="mt-3" items={["Booking.com 9.4", "Airbnb Guest Favourite", "Tripadvisor Travellers' Choice"]} />
          </Reveal>
        </div>

        {/* Testimonial carousel */}
        <Reveal className="mt-12 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
          <div
            className="card relative overflow-hidden p-6 sm:p-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
              setPaused(true);
            }}
            onTouchEnd={(e) => {
              if (touchX.current !== null) {
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
              }
              touchX.current = null;
              setPaused(false);
            }}
            aria-roledescription="carousel"
            aria-label="Guest reviews"
          >
            <span aria-hidden className="pointer-events-none absolute -top-6 right-6 font-serif text-[9rem] leading-none text-ember/15 sm:text-[11rem]">
              &rdquo;
            </span>
            <figure
              key={index}
              className="relative min-h-[260px] sm:min-h-[240px]"
              style={{
                animation: `${dir === 1 ? "slide-in" : "rise-in"} 520ms cubic-bezier(0.2,0.7,0.2,1) both`,
              }}
              aria-live="polite"
            >
              <Stars rating={r.rating} />
              <blockquote className="mt-5 font-serif text-[clamp(1.25rem,2.6vw,1.9rem)] leading-snug text-ink [text-wrap:pretty]">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white">
                  {initials(r.name)}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">{r.name}</span>
                  <span className="block text-sm text-ink-mute">
                    {r.from} · {r.stay}
                  </span>
                </span>
              </figcaption>
            </figure>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-hairline pt-5">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose a review">
                {REVIEWS.map((rv, i) => (
                  <button
                    key={rv.name}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`Review ${i + 1} of ${count}, ${rv.name}`}
                    onClick={() => pick(i)}
                    className="flex h-10 items-center px-1"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-300 ${
                        i === index ? "w-7 bg-forest" : "w-1.5 bg-hairline-strong hover:bg-ink-mute"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous review"
                  className="grid h-10 w-10 place-items-center rounded-full border border-hairline-strong text-ink transition hover:border-ink hover:bg-stone"
                >
                  <Chevron dir="left" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next review"
                  className="grid h-10 w-10 place-items-center rounded-full bg-forest text-white transition hover:bg-forest-deep"
                >
                  <Chevron dir="right" />
                </button>
              </div>
            </div>
          </div>

          {/* Reviewer list (desktop) */}
          <ul className="hidden flex-col gap-2 lg:flex">
            {REVIEWS.map((rv, i) => {
              const active = i === index;
              return (
                <li key={rv.name}>
                  <button
                    type="button"
                    onClick={() => pick(i)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition duration-200 ${
                      active
                        ? "border-forest/30 bg-canvas shadow-[0_10px_30px_-20px_rgba(31,61,43,0.5)]"
                        : "border-transparent hover:border-hairline hover:bg-canvas/70"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        active ? "bg-forest text-white" : "bg-forest-soft text-forest"
                      }`}
                    >
                      {initials(rv.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{rv.name}</span>
                      <span className="block truncate text-xs text-ink-mute">{rv.stay}</span>
                    </span>
                    <span className="relative h-8 w-0.5 overflow-hidden rounded-full bg-hairline" aria-hidden>
                      <span
                        className="absolute inset-x-0 top-0 block bg-forest"
                        style={{
                          height: active ? "100%" : "0%",
                          transition: active && !paused ? `height ${ADVANCE_MS}ms linear` : "height 200ms",
                        }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/* Gallery */}
        <div className="mt-20">
          <Reveal className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="display text-2xl sm:text-3xl">Moments from FunCity</h3>
            <p className="text-sm text-ink-mute">Share yours with #HakunaMatataFunCity</p>
          </Reveal>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-[repeat(2,200px)] sm:gap-4 lg:grid-rows-[repeat(2,260px)]">
            {GALLERY.map((g, i) => (
              <Reveal key={g.src} variant="scale" delay={i * 70} className={`relative ${g.className}`}>
                <button
                  type="button"
                  onClick={() => setLightbox(i)}
                  className="group absolute inset-0 cursor-zoom-in overflow-hidden rounded-2xl"
                  aria-label={`Open photo: ${g.alt}`}
                >
                  <Photo
                    src={g.src}
                    alt={g.alt}
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="absolute inset-0"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-3 p-4 text-left text-sm text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="line-clamp-2">{g.alt}</span>
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <Lightbox images={GALLERY_SRCS} captions={GALLERY_CAPTIONS} index={lightbox} onClose={closeLightbox} onIndex={setLightbox} />
    </section>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
