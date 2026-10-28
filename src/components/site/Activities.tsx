"use client";

import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Specs } from "@/components/ui/Overlay";
import { IMG } from "@/lib/images";

type Activity = {
  id: string;
  name: string;
  image: string;
  alt: string;
  copy: string;
  schedule: string;
  duration: string;
  priceUSD: number;
  ages: string;
};

const ACTIVITIES: Activity[] = [
  {
    id: "canopy",
    name: "Canopy walk",
    image: IMG.canopyWalk,
    alt: "A trail leading into a sunlit forest",
    copy: "Rope bridges strung between mvule and fig trees, twelve metres above the forest floor. Look out for colobus monkeys.",
    schedule: "Daily · 9:00 & 15:30",
    duration: "90 min",
    priceUSD: 15,
    ages: "Ages 8+",
  },
  {
    id: "quad",
    name: "Quad bike trails",
    image: IMG.atvTrail,
    alt: "A red dirt road through open countryside",
    copy: "Ride red-earth tracks through village farmland and pine woodland, with a guide leading and a tea stop halfway.",
    schedule: "Tue–Sun · 10:00 & 14:00",
    duration: "2 hours",
    priceUSD: 45,
    ages: "Ages 16+, licence not needed",
  },
  {
    id: "campfire",
    name: "Campfire evenings",
    image: IMG.campfire,
    alt: "Friends gathered around a campfire at night",
    copy: "Drummers, storytellers and roasted gonja around the big fire pit. Bring a jumper, the hills cool quickly after dark.",
    schedule: "Fri & Sat · 19:00",
    duration: "Until late",
    priceUSD: 10,
    ages: "All ages",
  },
  {
    id: "funpark",
    name: "Kids' fun park",
    image: IMG.playSlide,
    alt: "A wide green lawn surrounded by trees",
    copy: "Swings, a treehouse fort, trampolines and a splash zone on the lawn, with a trained minder on duty all day.",
    schedule: "Daily · 9:00 – 18:00",
    duration: "Drop in",
    priceUSD: 5,
    ages: "Ages 2–12",
  },
  {
    id: "birding",
    name: "Guided birding treks",
    image: IMG.hornbill,
    alt: "Tall trees in a quiet forest",
    copy: "Walk the wetland boardwalk with our resident guide Moses. Great blue turacos, hornbills and, if you're lucky, a shoebill.",
    schedule: "Daily · 6:30",
    duration: "2 hours",
    priceUSD: 18,
    ages: "Ages 10+",
  },
  {
    id: "team",
    name: "Team challenges",
    image: IMG.campfireLake,
    alt: "A team working together around a table",
    copy: "Facilitated rafting-build races, orienteering and trust courses designed for groups of 10 to 120.",
    schedule: "By arrangement",
    duration: "Half or full day",
    priceUSD: 25,
    ages: "Groups of 10+",
  },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Times per day (Mon..Sun); empty string = not running. */
const WEEK: { name: string; times: string[] }[] = [
  { name: "Birding trek", times: ["06:30", "06:30", "06:30", "06:30", "06:30", "06:30", "06:30"] },
  { name: "Canopy walk", times: ["09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30"] },
  { name: "Quad bikes", times: ["", "10:00 · 14:00", "10:00 · 14:00", "10:00 · 14:00", "10:00 · 14:00", "10:00 · 14:00", "10:00 · 14:00"] },
  { name: "Garden yoga", times: ["07:00", "", "07:00", "", "07:00", "07:00", "07:00"] },
  { name: "Campfire evening", times: ["", "", "", "", "19:00", "19:00", ""] },
  { name: "Kids' fun park", times: ["09–18", "09–18", "09–18", "09–18", "09–18", "09–18", "09–18"] },
];

export function Activities() {
  const { money, openConcierge } = useResort();

  return (
    <section id="activities" className="section bg-linen">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Outdoor activities & team building</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">Plenty to do, if you feel like it</h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-ink-soft lg:justify-self-end">
            Every activity starts from the main lawn and is led by our own guides. Book at reception on the day, or add
            them to your stay when you reserve.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITIES.map((a) => (
            <article key={a.id} className="group card flex flex-col overflow-hidden">
              <Photo
                src={a.image}
                alt={a.alt}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="aspect-[16/10]"
                imgClassName="transition duration-500 group-hover:scale-[1.04]"
              />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="display text-2xl">{a.name}</h3>
                  <p className="shrink-0 text-sm">
                    <span className="num font-semibold text-forest">{money(a.priceUSD)}</span>
                    <span className="text-ink-mute"> pp</span>
                  </p>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{a.copy}</p>
                <Specs className="mt-4 text-xs!" items={[a.schedule, a.duration, a.ages]} />
              </div>
            </article>
          ))}
        </div>

        {/* Weekly schedule */}
        <div className="mt-14 hidden md:block">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="display text-2xl">This week on the lawn</h3>
              <p className="mt-1 text-sm text-ink-mute">Times can shift with the weather. Reception keeps the latest board.</p>
            </div>
            <button type="button" onClick={() => openConcierge("corporate")} className="btn btn-secondary btn-sm">
              Plan a team day
            </button>
          </div>
          <div className="card mt-5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-stone/60 text-left">
                  <th className="px-4 py-3 font-semibold text-ink-soft">Activity</th>
                  {DAYS.map((d) => (
                    <th key={d} className="px-3 py-3 text-center font-semibold text-ink-soft">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEK.map((row) => (
                  <tr key={row.name} className="border-b border-hairline last:border-b-0">
                    <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                    {row.times.map((t, i) => (
                      <td key={i} className="num px-3 py-3 text-center text-xs text-ink-soft">
                        {t || <span className="text-ink-mute/50">–</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 md:hidden">
          <button type="button" onClick={() => openConcierge("corporate")} className="btn btn-secondary w-full">
            Plan a team day
          </button>
        </div>
      </div>
    </section>
  );
}
