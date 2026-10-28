"use client";

import { useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Segmented, Specs } from "@/components/ui/Overlay";
import { Parallax, Reveal, useInView } from "@/components/ui/Motion";
import { IMG } from "@/lib/images";
import { RESORT_GPS } from "@/data/resortStorage";

type RouteKey = "kampala" | "entebbe";

type Leg = { title: string; detail: string; km: number; minutes: string };

const ROUTES: Record<RouteKey, { label: string; total: string; distance: string; legs: Leg[]; road: string }> = {
  kampala: {
    label: "From Kampala",
    total: "45–60 min",
    distance: "32 km",
    road: "Tarmac all the way to Gayaza, then 4 km of smooth murram. Fine for any saloon car. Friday evening traffic out of the city can add 30 minutes.",
    legs: [
      { title: "Kampala city centre to Northern Bypass", detail: "Head north via Bombo Road or Kira Road and join the Northern Bypass at Kalerwe.", km: 7, minutes: "10–20 min" },
      { title: "Northern Bypass to Gayaza Road", detail: "Exit at Kisaasi roundabout and follow Gayaza Road north past Kasangati.", km: 13, minutes: "15–20 min" },
      { title: "Gayaza town to the Zirobwe turn", detail: "Continue straight through Gayaza trading centre onto the Gayaza–Zirobwe Road.", km: 8, minutes: "10 min" },
      { title: "Final stretch to the gate", detail: "Turn left at our green signboard after Nakasajja primary school. Gate staff will wave you through.", km: 4, minutes: "8 min" },
    ],
  },
  entebbe: {
    label: "From Entebbe Airport",
    total: "75–90 min",
    distance: "68 km",
    road: "Expressway and bypass are dual carriageway with tolls payable by mobile money. Allow extra time on weekday afternoons around Kampala.",
    legs: [
      { title: "Entebbe International Airport to Kajjansi", detail: "Leave the airport and join the Kampala–Entebbe Expressway at Abaita Ababiri.", km: 22, minutes: "20 min" },
      { title: "Expressway to Northern Bypass", detail: "Stay on the expressway to Busega, then take the Northern Bypass eastbound.", km: 21, minutes: "25–30 min" },
      { title: "Northern Bypass to Gayaza", detail: "Exit at Kisaasi and follow Gayaza Road north through Kasangati.", km: 21, minutes: "25–30 min" },
      { title: "Gayaza to the resort gate", detail: "Continue onto the Gayaza–Zirobwe Road and turn left at our green signboard.", km: 4, minutes: "8 min" },
    ],
  },
};

const MAP_SRC = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
  `${RESORT_GPS.lng - 0.06},${RESORT_GPS.lat - 0.04},${RESORT_GPS.lng + 0.06},${RESORT_GPS.lat + 0.04}`,
)}&layer=mapnik&marker=${encodeURIComponent(`${RESORT_GPS.lat},${RESORT_GPS.lng}`)}`;

const GOOGLE_MAPS = `https://www.google.com/maps/search/?api=1&query=${RESORT_GPS.lat},${RESORT_GPS.lng}`;

/** Route legs; remounted per route so the line draws in again. */
function RouteTimeline({ legs }: { legs: Leg[] }) {
  const { ref, inView } = useInView<HTMLOListElement>({ threshold: 0.2 });
  return (
    <ol ref={ref} className="relative mt-6">
      <span
        aria-hidden
        className="absolute bottom-4 left-[15px] top-4 w-px origin-top bg-linear-to-b from-forest via-forest/60 to-ember/60 transition-transform duration-[1300ms] ease-out"
        style={{ transform: inView ? "scaleY(1)" : "scaleY(0)" }}
      />
      {legs.map((leg, i) => (
        <li
          key={leg.title}
          className="relative flex gap-4 pb-6 transition-all duration-700 ease-out last:pb-0"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "none" : "translateY(12px)",
            transitionDelay: `${150 + i * 180}ms`,
          }}
        >
          <span className="num relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-forest bg-canvas text-xs font-semibold text-forest shadow-[0_0_0_4px_var(--color-canvas)]">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <p className="font-semibold text-ink">{leg.title}</p>
              <p className="num text-xs text-ink-mute">
                {leg.km} km · {leg.minutes}
              </p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{leg.detail}</p>
          </div>
        </li>
      ))}
      <li
        className="relative flex items-center gap-4 pt-6 transition-all duration-700 ease-out"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "none" : "translateY(12px)",
          transitionDelay: `${150 + legs.length * 180}ms`,
        }}
      >
        <span className="relative isolate z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember text-white pulse-ring">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
            <circle cx="12" cy="10" r="2.2" />
          </svg>
        </span>
        <p className="font-semibold text-ink">Welcome to Hakuna Matata FunCity</p>
      </li>
    </ol>
  );
}

export function Location() {
  const { openConcierge } = useResort();
  const [route, setRoute] = useState<RouteKey>("kampala");
  const [copied, setCopied] = useState(false);
  const r = ROUTES[route];

  async function copyCoords() {
    try {
      await navigator.clipboard.writeText(`${RESORT_GPS.lat}, ${RESORT_GPS.lng}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="location" className="section bg-canvas">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <p className="eyebrow">Location & travel</p>
            <h2 className="display mt-3 text-[clamp(2.1rem,5vw,3.25rem)] [text-wrap:balance]">
              Close to the city, far from the noise
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-xl text-base leading-relaxed text-ink-soft lg:justify-self-end">
              We&apos;re in the green hills of Wakiso District, north of Kampala. Drive yourself, take a Safe Boda from
              Gayaza, or let our driver meet you at arrivals in Entebbe.
            </p>
          </Reveal>
        </div>

        {/* Banner */}
        <Reveal variant="scale" className="relative mt-10 h-[220px] overflow-hidden rounded-3xl sm:h-[300px] lg:h-[360px]">
          <Parallax speed={0.12} className="absolute inset-x-0 -top-[18%] -bottom-[18%]">
            <Photo src={IMG.countryRoad} alt="A red-earth road running through green fields" sizes="(min-width: 1280px) 1200px, 100vw" className="absolute inset-0" />
          </Parallax>
          <div className="absolute inset-0 bg-linear-to-r from-ink/70 via-ink/30 to-transparent" aria-hidden />
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 lg:p-10">
            <p className="display max-w-md text-[clamp(1.5rem,3.6vw,2.4rem)] text-white [text-wrap:balance]">
              Red-earth roads and green hills, all the way to the gate
            </p>
            <p className="mt-3 text-sm text-white/80">
              <span className="num">32 km</span> from Kampala <span className="mx-1.5 text-white/50">·</span>
              <span className="num">68 km</span> from Entebbe Airport
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          <Reveal>
            <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <Segmented
                value={route}
                onChange={setRoute}
                options={[
                  { value: "kampala", label: "From Kampala" },
                  { value: "entebbe", label: "From Entebbe Airport" },
                ]}
              />
            </div>

            <div key={route} className="animate-fade-in">
              <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <p className="display text-4xl">
                  <span className="num">{r.total}</span>
                </p>
                <Specs items={[<span key="d" className="num">{r.distance}</span>, "by car", "door to gate"]} />
              </div>

              <RouteTimeline legs={r.legs} />

              <div className="mt-8 rounded-xl border-l-2 border-ember bg-linen p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-ember">Road conditions</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{r.road}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={() => openConcierge("shuttle")} className="btn btn-primary min-h-11">
                Book an airport transfer
              </button>
              <a href={GOOGLE_MAPS} target="_blank" rel="noopener noreferrer" className="btn btn-secondary min-h-11">
                Open in Google Maps
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </Reveal>

          <Reveal delay={150} className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <iframe
                title="Map showing Hakuna Matata FunCity"
                src={MAP_SRC}
                loading="lazy"
                className="block aspect-[4/3] w-full border-0 lg:aspect-auto lg:h-[440px]"
              />
            </div>
            <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs font-semibold text-ink-mute">GPS coordinates</p>
                <p className="num mt-0.5 text-sm text-ink">{RESORT_GPS.label}</p>
              </div>
              <button
                type="button"
                onClick={copyCoords}
                className={`btn btn-sm min-h-10 ${copied ? "border border-forest bg-forest-soft text-forest" : "btn-secondary"}`}
                aria-live="polite"
              >
                {copied ? (
                  <span key="copied" className="inline-flex animate-pop-in items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copied
                  </span>
                ) : (
                  <span key="copy" className="inline-flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
                    </svg>
                    Copy coordinates
                  </span>
                )}
              </button>
            </div>
            <Specs className="text-xs!" items={["Free secure parking", "EV charging on request", "Boda drop-off at main gate"]} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
