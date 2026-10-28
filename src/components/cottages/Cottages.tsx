"use client";

import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Specs } from "@/components/ui/Overlay";
import { addDays, diffDays, formatRange, quoteStay, type Cottage } from "@/data/resortStorage";

export function Cottages() {
  const { cottages } = useResort();

  return (
    <section id="stay" className="section bg-canvas">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Stay</p>
            <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">Five cottages, each with its own view</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              From a treetop hideaway to a stone villa with its own plunge pool, every cottage is set apart in the
              gardens, with breakfast included and live availability below.
            </p>
          </div>
          <SearchSummary />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cottages.map((c, i) => (
            <CottageCard key={c.id} cottage={c} featured={i === 0} />
          ))}
        </div>

        <div className="mt-10 border-t border-hairline pt-6">
          <Specs
            items={[
              "Green season (Feb–May, Sep–Nov): standard rates",
              "High season (Jun–Aug, Dec–Jan): +20%",
              "Friday & Saturday nights: +10%",
              "Breakfast included · 18% VAT added at checkout",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function SearchSummary() {
  const { search, setSearch, today } = useResort();
  return (
    <div className="card grid w-full grid-cols-2 gap-3 p-3 sm:grid-cols-[1fr_1fr_auto] lg:w-auto lg:min-w-[440px]">
      <div>
        <label className="label" htmlFor="stay-in">
          Check-in
        </label>
        <input
          id="stay-in"
          type="date"
          className="field num"
          min={today}
          value={search.checkIn}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return;
            setSearch({ checkIn: v, checkOut: search.checkOut <= v ? addDays(v, 2) : search.checkOut });
          }}
        />
      </div>
      <div>
        <label className="label" htmlFor="stay-out">
          Check-out
        </label>
        <input
          id="stay-out"
          type="date"
          className="field num"
          min={addDays(search.checkIn, 1)}
          value={search.checkOut}
          onChange={(e) => {
            const v = e.target.value;
            if (v && v > search.checkIn) setSearch({ checkOut: v });
          }}
        />
      </div>
      <div className="col-span-2 sm:col-span-1">
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
  const { search, money, rateFor, isRangeAvailable, openCottage, openBooking } = useResort();
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
      className={`group card flex flex-col overflow-hidden ${
        featured ? "md:col-span-2 lg:grid lg:grid-cols-[1.35fr_1fr]" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => openCottage(c.id)}
        className="block h-full w-full text-left"
        aria-label={`View ${c.name}`}
      >
        <Photo
          src={c.images[0]}
          alt={`${c.name} at Hakuna Matata FunCity`}
          className={featured ? "aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[460px]" : "aspect-[4/3]"}
          imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes={featured ? "(min-width: 1024px) 760px, 100vw" : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"}
        />
      </button>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-mute">{c.view}</p>
        <h3 className={`display mt-2 text-ink ${featured ? "text-3xl sm:text-[2.1rem]" : "text-2xl sm:text-[1.7rem]"}`}>
          {c.name}
        </h3>
        <p className="mt-1.5 text-ink-soft">{c.tagline}</p>
        {featured && <p className="mt-3 hidden text-sm leading-relaxed text-ink-soft lg:block">{c.description}</p>}
        <Specs items={c.specs.slice(0, 4)} className="mt-4" />

        <div className="mt-5 border-t border-hairline pt-4">
          <p className="text-sm text-ink-soft">
            from <span className="num text-base font-semibold text-ink">{money(rateFor(c.id))}</span> / night
          </p>
          <div className="mt-2 text-sm" aria-live="polite">
            {!fits ? (
              <p className="text-ember">Sleeps up to {c.guests}. Try a larger cottage for {search.guests} guests.</p>
            ) : available && quote ? (
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5 text-forest">
                  <span className="h-1.5 w-1.5 rounded-full bg-forest" aria-hidden />
                  Available <span className="num">{formatRange(search.checkIn, search.checkOut)}</span>
                </span>
                <span className="text-ink-mute">
                  <span className="num text-ink">{money(quote.lodgingUSD)}</span> for{" "}
                  <span className="num">{quote.nights}</span> {quote.nights === 1 ? "night" : "nights"}
                </span>
              </p>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-ember">
                <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden />
                Reserved on your dates. Pick other dates in the calendar.
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex gap-2 pt-5">
          <button type="button" className="btn btn-secondary flex-1" onClick={() => openCottage(c.id)}>
            View cottage
          </button>
          <button type="button" className="btn btn-primary flex-1" onClick={reserve}>
            Reserve
          </button>
        </div>
      </div>
    </article>
  );
}
