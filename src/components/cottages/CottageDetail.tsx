"use client";

import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Drawer } from "@/components/ui/Overlay";
import { Lightbox, Reveal } from "@/components/ui/Motion";
import { AvailabilityCalendar } from "@/components/cottages/AvailabilityCalendar";
import { PriceBreakdown, Stepper } from "@/components/booking/BookingDrawer";
import { AnimatedMoney } from "@/components/booking/fx";
import { diffDays, getCottage, quoteStay, type Cottage } from "@/data/resortStorage";

export function CottageDetail() {
  const { detailCottageId } = useResort();
  const cottage = detailCottageId ? getCottage(detailCottageId) : undefined;
  if (!cottage) return null;
  return <DetailDrawer key={cottage.id} cottage={cottage} />;
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function Svg({ children, className = "h-5 w-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, ReactNode> = {
  guests: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16 14.2a4.5 4.5 0 0 1 4.5 4.8" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18V7" />
      <path d="M3 13h18v5" />
      <path d="M21 13v-2a3 3 0 0 0-3-3h-7v5" />
      <circle cx="7" cy="10.5" r="1.8" />
    </>
  ),
  size: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9h5V4M20 15h-5v5" />
    </>
  ),
  view: (
    <>
      <path d="M3 18l5.5-7 4 5 3-3.5L21 18z" />
      <circle cx="16.5" cy="7" r="2" />
    </>
  ),
  water: <path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" />,
  wifi: (
    <>
      <path d="M2.5 9a14 14 0 0 1 19 0" />
      <path d="M5.5 12.5a9.5 9.5 0 0 1 13 0" />
      <path d="M8.7 15.8a5 5 0 0 1 6.6 0" />
      <circle cx="12" cy="19" r="0.9" fill="currentColor" />
    </>
  ),
  pool: (
    <>
      <path d="M3 17c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0" />
      <path d="M3 13.5c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0" />
      <path d="M8 11V5.5a2 2 0 0 1 4 0M16 11V5.5a2 2 0 0 0-4 0" />
    </>
  ),
  deck: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M12 2v1.5M5.6 4.6l1 1M18.4 4.6l-1 1M3 20h18M5 16.5h14" />
    </>
  ),
  cup: (
    <>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3.5c-.6.8-.6 1.7 0 2.5M12 3.5c-.6.8-.6 1.7 0 2.5" />
    </>
  ),
  snow: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5" />,
  sparkle: (
    <>
      <path d="M12 4l1.8 4.6L18.5 10l-4.7 1.6L12 16.5l-1.8-4.9L5.5 10l4.7-1.4z" />
      <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  screen: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M9 20h6" />
    </>
  ),
  flame: <path d="M12 21c3.5 0 6-2.4 6-5.8 0-3.6-2.8-5.6-3.7-9.2-1.6 1.4-2.3 3-2.3 4.6-1-1-1.6-2.2-1.7-3.4C8.4 9 6 11.6 6 15.2 6 18.6 8.5 21 12 21Z" />,
  home: (
    <>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" />
      <path d="M5 19l7-7" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
};

function iconFor(amenity: string): ReactNode {
  const a = amenity.toLowerCase();
  if (/(shower|bath|water)/.test(a)) return ICONS.water;
  if (/wi-?fi/.test(a)) return ICONS.wifi;
  if (/pool/.test(a)) return ICONS.pool;
  if (/(deck|terrace|veranda|hammock|sun)/.test(a)) return ICONS.deck;
  if (/(bed|cot|netted)/.test(a)) return ICONS.bed;
  if (/(coffee|tea|breakfast|minibar|kitchen)/.test(a)) return ICONS.cup;
  if (/air condition/.test(a)) return ICONS.snow;
  if (/(housekeeping|butler)/.test(a)) return ICONS.sparkle;
  if (/(tv|speaker)/.test(a)) return ICONS.screen;
  if (/(fire|thatch)/.test(a)) return ICONS.flame;
  if (/(lounge|bedroom|dining|nook|bathroom)/.test(a)) return ICONS.home;
  if (/(park|garden)/.test(a)) return ICONS.leaf;
  return ICONS.check;
}

/* ------------------------------------------------------------------ */
/* Drawer                                                              */
/* ------------------------------------------------------------------ */

function DetailDrawer({ cottage }: { cottage: Cottage }) {
  const { closeCottage, search, isRangeAvailable, rateFor, money, openBooking } = useResort();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [range, setRange] = useState<{ checkIn?: string; checkOut?: string }>(() =>
    diffDays(search.checkIn, search.checkOut) > 0 && isRangeAvailable(cottage.id, search.checkIn, search.checkOut)
      ? { checkIn: search.checkIn, checkOut: search.checkOut }
      : {},
  );
  const [guests, setGuests] = useState(Math.min(search.guests, cottage.guests));
  const touchX = useRef<number | null>(null);
  const count = cottage.images.length;

  // While the lightbox is open, Escape should close only the lightbox, not the drawer underneath.
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setLightbox(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [lightbox]);

  const { checkIn, checkOut } = range;
  const quote =
    checkIn && checkOut && diffDays(checkIn, checkOut) > 0
      ? quoteStay({ baseRateUSD: rateFor(cottage.id), checkIn, checkOut, guests, addonIds: [] })
      : null;
  const valid = !!quote && !!checkIn && !!checkOut && isRangeAvailable(cottage.id, checkIn, checkOut);

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) setActive((i) => (i + (dx < 0 ? 1 : -1) + count) % count);
  };

  const facts: { icon: ReactNode; label: string; value: string }[] = [
    { icon: ICONS.guests, label: "Sleeps", value: `${cottage.guests} guests` },
    { icon: ICONS.bed, label: "Beds", value: cottage.beds },
    { icon: ICONS.size, label: "Size", value: `${cottage.sizeSqm} m²` },
    { icon: ICONS.view, label: "View", value: cottage.view },
  ];

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        {quote ? (
          <>
            <AnimatedMoney usd={quote.totalUSD} className="block text-lg font-semibold text-ink" />
            <p className="text-xs text-ink-mute">
              <span className="num">{quote.nights}</span> {quote.nights === 1 ? "night" : "nights"} · incl. VAT
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-soft">
            from <span className="num font-semibold text-ink">{money(rateFor(cottage.id))}</span> / night
            <span className="block text-xs text-ink-mute">Pick dates to see the total</span>
          </p>
        )}
      </div>
      <button
        type="button"
        className="btn btn-primary min-h-11 shrink-0"
        disabled={!valid}
        onClick={() => openBooking({ cottageId: cottage.id, checkIn, checkOut, guests })}
      >
        <span className="sm:hidden">Reserve</span>
        <span className="hidden sm:inline">Reserve these dates</span>
      </button>
    </div>
  );

  return (
    <Drawer open onClose={closeCottage} size="xl" eyebrow={cottage.view} title={cottage.name} footer={footer}>
      {/* Gallery */}
      <div className="space-y-2">
        <div className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-stone" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <button
            type="button"
            onClick={() => setLightbox(active)}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={`Open photo ${active + 1} of ${count} full screen`}
          >
            <Photo
              key={active}
              src={cottage.images[active]}
              alt={`${cottage.name}, photo ${active + 1}`}
              className="absolute inset-0 animate-fade-in"
              imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(min-width: 640px) 820px, 100vw"
              priority
            />
          </button>
          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/45 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Svg className="h-3.5 w-3.5">{ICONS.expand}</Svg>
            <span className="num">
              {active + 1} / {count}
            </span>
          </span>
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActive((i) => (i - 1 + count) % count)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
              >
                <Svg className="h-4 w-4">
                  <path d="M15 6l-6 6 6 6" />
                </Svg>
              </button>
              <button
                type="button"
                onClick={() => setActive((i) => (i + 1) % count)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
              >
                <Svg className="h-4 w-4">
                  <path d="M9 6l6 6-6 6" />
                </Svg>
              </button>
            </>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cottage.images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              onDoubleClick={() => setLightbox(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              className={`group/thumb relative overflow-hidden rounded-lg transition duration-200 ${
                i === active ? "ring-2 ring-forest ring-offset-2" : "opacity-70 hover:opacity-100"
              }`}
            >
              <Photo
                src={src}
                alt=""
                className="aspect-[4/3]"
                imgClassName="transition-transform duration-300 group-hover/thumb:scale-[1.08]"
                sizes="200px"
              />
            </button>
          ))}
        </div>
      </div>

      <Lightbox
        images={cottage.images}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={(i) => {
          setLightbox(i);
          setActive(i);
        }}
        captions={cottage.images.map((_, i) => `${cottage.name} · photo ${i + 1} of ${count}`)}
      />

      {/* About */}
      <Reveal className="mt-8">
        <h3 className="display text-2xl text-ink sm:text-3xl">{cottage.tagline}</h3>
        <p className="mt-3 leading-relaxed text-ink-soft">{cottage.description}</p>
      </Reveal>

      <Reveal delay={60} className="mt-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-y border-hairline py-5 sm:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest-soft text-forest">
                <Svg>{f.icon}</Svg>
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-ink-mute">{f.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold leading-snug text-ink">{f.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Reveal>

      <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <p className="eyebrow">In the cottage</p>
          <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {cottage.amenities.map((a) => (
              <li key={a} className="flex items-center gap-3 text-sm text-ink-soft">
                <span className="text-forest">
                  <Svg className="h-[18px] w-[18px]">{iconFor(a)}</Svg>
                </span>
                {a}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={80} className="space-y-5">
          <div>
            <p className="eyebrow">House rules</p>
            <ul className="mt-3 space-y-2.5 text-sm text-ink-soft">
              <li className="flex items-start gap-3">
                <span className="mt-px text-forest">
                  <Svg className="h-[18px] w-[18px]">{ICONS.clock}</Svg>
                </span>
                <span>
                  Check-in from <span className="num">2:00 pm</span> · check-out by <span className="num">11:00 am</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-px text-forest">
                  <Svg className="h-[18px] w-[18px]">{ICONS.leaf}</Svg>
                </span>
                No smoking indoors · quiet hours from 10 pm
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-px text-forest">
                  <Svg className="h-[18px] w-[18px]">{ICONS.check}</Svg>
                </span>
                Free cancellation up to 7 days before arrival
              </li>
            </ul>
          </div>
        </Reveal>
      </div>

      {/* Availability */}
      <Reveal className="mt-10 border-t border-hairline pt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Availability</p>
            <h3 className="display mt-2 text-2xl text-ink">Pick your dates</h3>
          </div>
          <Stepper label="Guests" value={guests} min={1} max={cottage.guests} onChange={setGuests} />
        </div>
        <div className="card p-3 sm:p-5">
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
            <div key="quote" className="animate-fade-in">
              <PriceBreakdown quote={quote} />
            </div>
          ) : (
            <p className="text-sm text-ink-soft">Select your check-in and check-out dates to see the full price.</p>
          )}
        </div>
      </Reveal>
    </Drawer>
  );
}
