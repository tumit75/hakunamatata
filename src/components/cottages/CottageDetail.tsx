"use client";

import { useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Drawer, Specs } from "@/components/ui/Overlay";
import { AvailabilityCalendar } from "@/components/cottages/AvailabilityCalendar";
import { PriceBreakdown, Stepper } from "@/components/booking/BookingDrawer";
import { diffDays, getCottage, quoteStay, type Cottage } from "@/data/resortStorage";

export function CottageDetail() {
  const { detailCottageId } = useResort();
  const cottage = detailCottageId ? getCottage(detailCottageId) : undefined;
  if (!cottage) return null;
  return <DetailDrawer key={cottage.id} cottage={cottage} />;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-forest" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DetailDrawer({ cottage }: { cottage: Cottage }) {
  const { closeCottage, search, isRangeAvailable, rateFor, money, openBooking } = useResort();
  const [active, setActive] = useState(0);
  const [range, setRange] = useState<{ checkIn?: string; checkOut?: string }>(() =>
    diffDays(search.checkIn, search.checkOut) > 0 && isRangeAvailable(cottage.id, search.checkIn, search.checkOut)
      ? { checkIn: search.checkIn, checkOut: search.checkOut }
      : {},
  );
  const [guests, setGuests] = useState(Math.min(search.guests, cottage.guests));

  const { checkIn, checkOut } = range;
  const quote =
    checkIn && checkOut && diffDays(checkIn, checkOut) > 0
      ? quoteStay({ baseRateUSD: rateFor(cottage.id), checkIn, checkOut, guests, addonIds: [] })
      : null;
  const valid = !!quote && !!checkIn && !!checkOut && isRangeAvailable(cottage.id, checkIn, checkOut);

  const footer = (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        {quote ? (
          <>
            <p className="num text-lg font-semibold text-ink">{money(quote.totalUSD)}</p>
            <p className="text-xs text-ink-mute">
              <span className="num">{quote.nights}</span> {quote.nights === 1 ? "night" : "nights"} · incl. VAT
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-soft">
            from <span className="num font-semibold text-ink">{money(rateFor(cottage.id))}</span> / night
          </p>
        )}
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!valid}
        onClick={() => openBooking({ cottageId: cottage.id, checkIn, checkOut, guests })}
      >
        Reserve these dates
      </button>
    </div>
  );

  return (
    <Drawer open onClose={closeCottage} size="xl" eyebrow={cottage.view} title={cottage.name} footer={footer}>
      {/* Gallery */}
      <div className="space-y-2">
        <Photo
          src={cottage.images[active]}
          alt={`${cottage.name}, photo ${active + 1}`}
          className="aspect-[16/10] rounded-xl"
          sizes="(min-width: 640px) 820px, 100vw"
          priority
        />
        <div className="grid grid-cols-4 gap-2">
          {cottage.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              className={`group overflow-hidden rounded-lg transition ${
                i === active ? "ring-2 ring-forest ring-offset-2" : "opacity-80 hover:opacity-100"
              }`}
            >
              <Photo
                src={src}
                alt=""
                className="aspect-[4/3]"
                imgClassName="transition-transform duration-300 group-hover:scale-[1.06]"
                sizes="200px"
              />
            </button>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="mt-8">
        <h3 className="display text-2xl text-ink sm:text-3xl">{cottage.tagline}</h3>
        <p className="mt-3 leading-relaxed text-ink-soft">{cottage.description}</p>
        <Specs items={cottage.specs} className="mt-4" />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">In the cottage</p>
          <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {cottage.amenities.map((a) => (
              <li key={a} className="flex items-start gap-2 text-sm text-ink-soft">
                <CheckIcon />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-5">
          <div>
            <p className="eyebrow">The view</p>
            <p className="mt-2 text-sm text-ink-soft">{cottage.view}</p>
          </div>
          <div>
            <p className="eyebrow">House rules</p>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
              <li>
                Check-in from <span className="num">2:00 pm</span> · check-out by <span className="num">11:00 am</span>
              </li>
              <li>No smoking indoors · quiet hours from 10 pm</li>
              <li>Free cancellation up to 7 days before arrival</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="mt-10 border-t border-hairline pt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Availability</p>
            <h3 className="display mt-2 text-2xl text-ink">Pick your dates</h3>
          </div>
          <Stepper label="Guests" value={guests} min={1} max={cottage.guests} onChange={setGuests} />
        </div>
        <div className="card p-4 sm:p-5">
          <AvailabilityCalendar
            cottageId={cottage.id}
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(a, b) => setRange({ checkIn: a, checkOut: b })}
            months={2}
          />
        </div>

        <div className="mt-5 rounded-xl bg-linen p-4 sm:p-5">
          {quote ? (
            <PriceBreakdown quote={quote} />
          ) : (
            <p className="text-sm text-ink-soft">Select your check-in and check-out dates to see the full price.</p>
          )}
        </div>
      </div>
    </Drawer>
  );
}
