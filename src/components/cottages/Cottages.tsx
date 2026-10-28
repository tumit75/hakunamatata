"use client";

import { useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { Segmented, Specs } from "@/components/ui/Overlay";
import { ImageCarousel, Reveal } from "@/components/ui/Motion";
import { AnimatedMoney, PulseDot } from "@/components/booking/fx";
import { addDays, diffDays, formatRange, quoteStay, type Cottage } from "@/data/resortStorage";

type Filter = "all" | "couples" | "groups";
type Sort = "recommended" | "price-asc" | "price-desc";

const FILTERS: Record<Filter, (c: Cottage) => boolean> = {
  all: () => true,
  couples: (c) => c.guests <= 3,
  groups: (c) => c.guests >= 3,
};

export function Cottages() {
  const { cottages, rateFor } = useResort();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recommended");

  const list = cottages.filter(FILTERS[filter]);
  if (sort !== "recommended") {
    list.sort((a, b) => (sort === "price-asc" ? rateFor(a.id) - rateFor(b.id) : rateFor(b.id) - rateFor(a.id)));
  }
  // Feature the first card (2 columns wide) only when that fills the rows neatly.
  const featureFirst = list.length % 3 === 2;

  return (
    <section id="stay" className="section bg-canvas">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow">Stay</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">Five cottages, each with its own view</h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-4 leading-relaxed text-ink-soft">
                From a treetop hideaway to a stone villa with its own plunge pool, every cottage is set apart in the
                gardens, with breakfast included and live availability below.
              </p>
            </Reveal>
          </div>
          <Reveal delay={200} variant="fade" className="w-full lg:w-auto">
            <SearchSummary />
          </Reveal>
        </div>

        <Reveal delay={120} className="mt-10">
          <div className="flex flex-col gap-3 border-b border-hairline pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              className="w-full sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none"
              options={[
                { value: "all", label: "All" },
                { value: "couples", label: "Couples" },
                {
                  value: "groups",
                  label: (
                    <>
                      <span className="sm:hidden">Families</span>
                      <span className="hidden sm:inline">Families &amp; groups</span>
                    </>
                  ),
                },
              ]}
            />
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="text-sm text-ink-mute" aria-live="polite">
                <span className="num text-ink">{list.length}</span> {list.length === 1 ? "cottage" : "cottages"}
              </p>
              <label className="sr-only" htmlFor="stay-sort">
                Sort cottages
              </label>
              <select
                id="stay-sort"
                className="field w-auto py-2 pr-8 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>
        </Reveal>

        <div key={`${filter}-${sort}`} className="mt-8 grid animate-fade-in gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => {
            const featured = featureFirst && i === 0;
            return (
              <Reveal key={c.id} delay={Math.min(i, 4) * 90} className={featured ? "md:col-span-2" : ""}>
                <CottageCard cottage={c} featured={featured} />
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 border-t border-hairline pt-6" variant="fade">
          <Specs
            items={[
              "Green season (Feb–May, Sep–Nov): standard rates",
              "High season (Jun–Aug, Dec–Jan): +20%",
              "Friday & Saturday nights: +10%",
              "Breakfast included · 18% VAT added at checkout",
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

function SearchSummary() {
  const { search, setSearch, today } = useResort();
  const nights = diffDays(search.checkIn, search.checkOut);
  return (
    <div className="card grid w-full grid-cols-1 gap-3 p-3 min-[400px]:grid-cols-2 sm:grid-cols-[1fr_1fr_auto] lg:w-auto lg:min-w-[460px]">
      <div className="min-w-0">
        <label className="label" htmlFor="stay-in">
          Check-in
        </label>
        <input
          id="stay-in"
          type="date"
          className="field num min-w-0"
          min={today}
          value={search.checkIn}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return;
            setSearch({ checkIn: v, checkOut: search.checkOut <= v ? addDays(v, 2) : search.checkOut });
          }}
        />
      </div>
      <div className="min-w-0">
        <label className="label" htmlFor="stay-out">
          Check-out
          {nights > 0 && (
            <span className="ml-1.5 font-normal text-ink-mute">
              · <span className="num">{nights}</span> {nights === 1 ? "night" : "nights"}
            </span>
          )}
        </label>
        <input
          id="stay-out"
          type="date"
          className="field num min-w-0"
          min={addDays(search.checkIn, 1)}
          value={search.checkOut}
          onChange={(e) => {
            const v = e.target.value;
            if (v && v > search.checkIn) setSearch({ checkOut: v });
          }}
        />
      </div>
      <div className="min-w-0 min-[400px]:col-span-2 sm:col-span-1">
        <label className="label" htmlFor="stay-guests">
          Guests
        </label>
        <select
          id="stay-guests"
          className="field num sm:w-24"
          value={search.guests}
          onChange={(e) => setSearch({ guests: Number(e.target.value) })}
        >
          {[1, 2, 3, 4, 5, 6].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function CottageCard({ cottage: c, featured }: { cottage: Cottage; featured: boolean }) {
  const { search, rateFor, isRangeAvailable, openCottage, openBooking } = useResort();
  const nights = diffDays(search.checkIn, search.checkOut);
  const fits = search.guests <= c.guests;
  const valid = nights > 0;
  const available = valid && isRangeAvailable(c.id, search.checkIn, search.checkOut);
  const guests = Math.min(search.guests, c.guests);
  const quote = valid
    ? quoteStay({ baseRateUSD: rateFor(c.id), checkIn: search.checkIn, checkOut: search.checkOut, guests, addonIds: [] })
    : null;

  const reserve = () =>
    openBooking(
      available
        ? { cottageId: c.id, checkIn: search.checkIn, checkOut: search.checkOut, guests }
        : { cottageId: c.id, guests },
    );

  return (
    <article
      className={`card lift flex h-full flex-col overflow-hidden ${
        featured ? "lg:grid lg:grid-cols-[1.35fr_1fr]" : ""
      }`}
    >
      <ImageCarousel
        images={c.images}
        alt={c.name}
        onOpen={() => openCottage(c.id)}
        className={featured ? "aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[460px]" : "aspect-[4/3]"}
        sizes={featured ? "(min-width: 1024px) 760px, (min-width: 768px) 90vw, 100vw" : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"}
      />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-mute">
          {featured ? "Guest favourite · " : ""}
          {c.view}
        </p>
        <h3 className={`display mt-2 text-ink ${featured ? "text-3xl sm:text-[2.1rem]" : "text-2xl sm:text-[1.7rem]"}`}>
          <button
            type="button"
            onClick={() => openCottage(c.id)}
            className="link-grow text-left transition-colors hover:text-forest"
          >
            {c.name}
          </button>
        </h3>
        <p className="mt-1.5 text-ink-soft">{c.tagline}</p>
        {featured && <p className="mt-3 hidden text-sm leading-relaxed text-ink-soft lg:block">{c.description}</p>}
        <Specs items={c.specs.slice(0, 4)} className="mt-4" />

        <div className="mt-5 border-t border-hairline pt-4">
          <p className="text-sm text-ink-soft">
            from <AnimatedMoney usd={rateFor(c.id)} className="text-base font-semibold text-ink" /> / night
          </p>
          <div className="mt-2 min-h-[2.5rem] text-sm" aria-live="polite">
            {!fits ? (
              <p className="text-ember">Sleeps up to {c.guests}. Try a larger cottage for {search.guests} guests.</p>
            ) : available && quote ? (
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-2 text-forest">
                  <PulseDot />
                  Available <span className="num">{formatRange(search.checkIn, search.checkOut)}</span>
                </span>
                <span className="text-ink-mute">
                  <AnimatedMoney usd={quote.lodgingUSD} className="text-ink" /> for{" "}
                  <span className="num">{quote.nights}</span> {quote.nights === 1 ? "night" : "nights"}
                </span>
              </p>
            ) : (
              <p className="inline-flex items-start gap-2 text-ember">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ember" aria-hidden />
                Reserved on your dates. Pick other dates in the calendar.
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex gap-2 pt-5">
          <button type="button" className="btn btn-secondary min-h-11 flex-1" onClick={() => openCottage(c.id)}>
            View cottage
          </button>
          <button type="button" className="btn btn-primary group/btn min-h-11 flex-1" onClick={reserve}>
            Reserve
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
