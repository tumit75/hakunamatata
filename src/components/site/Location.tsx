"use client";

import { useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { Segmented, Specs } from "@/components/ui/Overlay";
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
      { title: "Final stretch to the gate", detail: "Turn left at our green signboard after the Nakasajja primary school. Gate staff will wave you through.", km: 4, minutes: "8 min" },
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
          <div>
            <p className="eyebrow">Location & travel</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Close to the city, far from the noise</h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-ink-soft lg:justify-self-end">
            We&apos;re in the green hills of Wakiso District, north of Kampala. Drive yourself, take a Safe Boda from
            Gayaza, or let our driver meet you at arrivals in Entebbe.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Segmented
              value={route}
              onChange={setRoute}
              options={[
                { value: "kampala", label: "From Kampala" },
                { value: "entebbe", label: "From Entebbe Airport" },
              ]}
            />

            <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <p className="display text-3xl">
                <span className="num">{r.total}</span>
              </p>
              <Specs items={[<span key="d" className="num">{r.distance}</span>, "by car", "door to gate"]} />
            </div>

            <ol className="mt-6 space-y-0">
              {r.legs.map((leg, i) => (
                <li key={leg.title} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < r.legs.length - 1 && (
                    <span className="absolute left-[13px] top-8 bottom-0 w-px bg-hairline-strong" aria-hidden />
                  )}
                  <span className="num relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-forest bg-canvas text-xs font-semibold text-forest">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-semibold text-ink">{leg.title}</p>
                      <p className="num text-xs text-ink-mute">
                        {leg.km} km · {leg.minutes}
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{leg.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-7 rounded-xl bg-linen p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ember">Road conditions</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{r.road}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={() => openConcierge("shuttle")} className="btn btn-primary">
                Book an airport transfer
              </button>
              <a href={GOOGLE_MAPS} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Open in Google Maps
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
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
              <button type="button" onClick={copyCoords} className="btn btn-secondary btn-sm" aria-live="polite">
                {copied ? (
                  <>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-forest" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                      <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
                    </svg>
                    Copy coordinates
                  </>
                )}
              </button>
            </div>
            <Specs
              className="text-xs!"
              items={["Free secure parking", "EV charging on request", "Boda drop-off at main gate"]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
