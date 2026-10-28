"use client";

import { useState } from "react";
import { useResort, type ConciergeTopic } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Modal, Segmented, Specs } from "@/components/ui/Overlay";
import { Reveal } from "@/components/ui/Motion";
import { IMG } from "@/lib/images";
import { weekdayOf } from "@/data/resortStorage";

type Category = "adventure" | "family" | "nature" | "evenings";
type Filter = "all" | Category;

type Activity = {
  id: string;
  name: string;
  image: string;
  alt: string;
  copy: string;
  long: string;
  includes: string[];
  schedule: string;
  duration: string;
  priceUSD: number;
  ages: string;
  categories: Category[];
  topic: ConciergeTopic;
};

const ACTIVITIES: Activity[] = [
  {
    id: "canopy",
    name: "Canopy walk",
    image: IMG.canopyWalk,
    alt: "A rope canopy walkway strung through the rainforest",
    copy: "Rope bridges strung between mvule and fig trees, twelve metres above the forest floor.",
    long: "Cross seven rope bridges strung between mvule and fig trees, twelve metres above the forest floor. Your guide points out colobus monkeys, sunbirds and the odd great blue turaco, then leads you down past the medicinal plant trail.",
    includes: ["Harness and safety briefing", "Resident forest guide", "Binoculars on loan"],
    schedule: "Daily · 9:00 & 15:30",
    duration: "90 min",
    priceUSD: 15,
    ages: "Ages 8+",
    categories: ["adventure", "nature"],
    topic: "general",
  },
  {
    id: "quad",
    name: "Quad bike trails",
    image: IMG.atvRide,
    alt: "A guest riding a red quad bike along a dirt trail",
    copy: "Red-earth tracks through village farmland and woodland, with a tea stop halfway.",
    long: "Ride red-earth tracks through village farmland, eucalyptus woodland and over the ridge with views to the lake. A guide leads at an easy pace and the route stops for tea and roasted groundnuts at a neighbour's farm.",
    includes: ["Helmet, goggles and gloves", "Lead guide and sweep rider", "Tea stop at a local farm"],
    schedule: "Tue–Sun · 10:00 & 14:00",
    duration: "2 hours",
    priceUSD: 45,
    ages: "Ages 16+, no licence needed",
    categories: ["adventure"],
    topic: "general",
  },
  {
    id: "campfire",
    name: "Campfire evenings",
    image: IMG.campfire,
    alt: "Friends gathered around a campfire at night",
    copy: "Drummers, storytellers and roasted gonja around the big fire pit.",
    long: "As the hills cool after dark, the big fire pit comes alive with adungu music, drummers and a storyteller from the village. Roast gonja and marshmallows, and stay as long as the fire lasts.",
    includes: ["Live music and storytelling", "Roasted gonja and hot chocolate", "Blankets provided"],
    schedule: "Fri & Sat · 19:00",
    duration: "Until late",
    priceUSD: 10,
    ages: "All ages",
    categories: ["evenings", "family"],
    topic: "general",
  },
  {
    id: "funpark",
    name: "Kids' fun park",
    image: IMG.playground,
    alt: "A wooden play fort and slides under the trees",
    copy: "Swings, a treehouse fort, trampolines and a splash zone, with a minder on duty.",
    long: "A shaded play lawn with swings, a treehouse fort, trampolines, a sandpit and a splash zone for hot afternoons. A trained minder is on duty all day, so parents can have lunch in peace on the veranda next door.",
    includes: ["Trained minder all day", "Splash zone (towels provided)", "Free for cottage guests under 5"],
    schedule: "Daily · 9:00 – 18:00",
    duration: "Drop in",
    priceUSD: 5,
    ages: "Ages 2–12",
    categories: ["family"],
    topic: "general",
  },
  {
    id: "birding",
    name: "Guided birding treks",
    image: IMG.hornbill,
    alt: "A yellow-billed hornbill perched on a branch",
    copy: "The wetland boardwalk at dawn: turacos, hornbills and, with luck, a shoebill.",
    long: "Walk the wetland boardwalk at first light with our resident guide Moses, who has logged over 140 species on the property. Expect great blue turacos, hornbills and kingfishers, and if you're lucky, a shoebill on the papyrus edge.",
    includes: ["Resident birding guide", "Binoculars and field guide", "Coffee and mandazi on return"],
    schedule: "Daily · 6:30",
    duration: "2 hours",
    priceUSD: 18,
    ages: "Ages 10+",
    categories: ["nature"],
    topic: "general",
  },
  {
    id: "team",
    name: "Team challenges",
    image: IMG.ropesCourse,
    alt: "A team working together on a planning exercise",
    copy: "Raft-building races, orienteering and trust courses for groups of 10 to 120.",
    long: "Facilitated challenges built around your goals: raft-building races on the pond, orienteering through the gardens, trust courses and a closing debrief by the fire. Our facilitators tailor the day for groups of 10 to 120.",
    includes: ["Lead facilitator and assistants", "All equipment", "Debrief session and photos"],
    schedule: "By arrangement",
    duration: "Half or full day",
    priceUSD: 25,
    ages: "Groups of 10+",
    categories: ["adventure"],
    topic: "corporate",
  },
];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "adventure", label: "Adventure" },
  { value: "family", label: "Family" },
  { value: "nature", label: "Nature" },
  { value: "evenings", label: "Evenings" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Times per day (Mon..Sun); empty string = not running. */
const WEEK: { name: string; times: string[] }[] = [
  { name: "Birding trek", times: ["06:30", "06:30", "06:30", "06:30", "06:30", "06:30", "06:30"] },
  { name: "Garden yoga", times: ["07:00", "", "07:00", "", "07:00", "07:00", "07:00"] },
  { name: "Canopy walk", times: ["09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30", "09:00 · 15:30"] },
  { name: "Kids' fun park", times: ["09–18", "09–18", "09–18", "09–18", "09–18", "09–18", "09–18"] },
  { name: "Quad bikes", times: ["", "10:00 · 14:00", "10:00 · 14:00", "10:00 · 14:00", "10:00 · 14:00", "10:00 · 14:00", "10:00 · 14:00"] },
  { name: "Campfire evening", times: ["", "", "", "", "19:00", "19:00", ""] },
];

export function Activities() {
  const { money, openConcierge, today } = useResort();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);

  const todayIdx = (weekdayOf(today) + 6) % 7;
  const dayIdx = day ?? todayIdx;
  const shown = filter === "all" ? ACTIVITIES : ACTIVITIES.filter((a) => a.categories.includes(filter));
  const selected = ACTIVITIES.find((a) => a.id === openId) ?? null;
  const daySessions = WEEK.filter((row) => row.times[dayIdx]);

  function ask(topic: ConciergeTopic) {
    setOpenId(null);
    openConcierge(topic);
  }

  return (
    <section id="activities" className="section bg-linen">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <Reveal>
            <p className="eyebrow">Outdoor activities & team building</p>
            <h2 className="display mt-3 text-[clamp(2.1rem,5vw,3.25rem)] [text-wrap:balance]">
              Plenty to do, if you feel like it
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-xl text-base leading-relaxed text-ink-soft lg:justify-self-end">
              Every activity starts from the main lawn and is led by our own guides. Book at reception on the day, or
              add them to your stay when you reserve.
            </p>
          </Reveal>
        </div>

        <Reveal delay={150} className="no-scrollbar -mx-4 mt-10 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Segmented value={filter} onChange={setFilter} options={FILTERS} />
        </Reveal>

        <div key={filter} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setOpenId(a.id)}
              className="group card lift flex flex-col overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              style={{ animation: `rise-in 460ms cubic-bezier(0.2,0.7,0.2,1) ${i * 70}ms both` }}
              aria-label={`${a.name}: view details`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Photo
                  src={a.image}
                  alt={a.alt}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <span className="absolute right-3 top-3 rounded-lg bg-white/92 px-2.5 py-1.5 text-xs font-semibold text-ink shadow-sm backdrop-blur">
                  <span className="num text-forest">{money(a.priceUSD)}</span>
                  <span className="text-ink-mute"> pp</span>
                </span>
              </div>
              <div className="flex w-full flex-1 flex-col p-5">
                <h3 className="display text-2xl">{a.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{a.copy}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <Specs className="text-xs!" items={[a.schedule, a.duration]} />
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-forest">
                    Details
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Schedule */}
        <Reveal className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="display text-2xl sm:text-3xl">This week on the lawn</h3>
              <p className="mt-1 text-sm text-ink-mute">Times can shift with the weather. Reception keeps the latest board.</p>
            </div>
            <button type="button" onClick={() => openConcierge("corporate")} className="btn btn-secondary btn-sm min-h-10 self-start sm:self-auto">
              Plan a team day
            </button>
          </div>

          {/* Day view: phones and tablets */}
          <div className="mt-6 lg:hidden">
            <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <Segmented
                value={String(dayIdx)}
                onChange={(v) => setDay(Number(v))}
                size="sm"
                options={DAYS.map((d, i) => ({
                  value: String(i),
                  label:
                    i === todayIdx ? (
                      <span className="inline-flex items-center gap-1">
                        {d}
                        <span className="h-1 w-1 rounded-full bg-current" aria-label="today" />
                      </span>
                    ) : (
                      d
                    ),
                }))}
              />
            </div>
            <ul key={dayIdx} className="card mt-4 divide-y divide-hairline">
              {daySessions.map((row, i) => (
                <li
                  key={row.name}
                  className="flex items-center justify-between gap-4 px-4 py-3.5"
                  style={{ animation: `rise-in 360ms cubic-bezier(0.2,0.7,0.2,1) ${i * 45}ms both` }}
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-forest" aria-hidden />
                    {row.name}
                  </span>
                  <span className="num text-sm text-ink-soft">{row.times[dayIdx]}</span>
                </li>
              ))}
            </ul>
            {dayIdx === todayIdx && <p className="mt-2 text-xs text-ink-mute">Showing today&apos;s sessions.</p>}
          </div>

          {/* Full week: desktop */}
          <div className="card mt-6 hidden overflow-hidden lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-stone/60 text-left">
                  <th className="px-5 py-3.5 font-semibold text-ink-soft">Activity</th>
                  {DAYS.map((d, i) => (
                    <th
                      key={d}
                      className={`px-3 py-3.5 text-center font-semibold ${i === todayIdx ? "text-forest" : "text-ink-soft"}`}
                    >
                      {d}
                      {i === todayIdx && <span className="ml-1 text-[0.65rem] font-medium uppercase tracking-wider">today</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEK.map((row) => (
                  <tr key={row.name} className="border-b border-hairline transition-colors last:border-b-0 hover:bg-linen">
                    <td className="px-5 py-3.5 font-medium text-ink">{row.name}</td>
                    {row.times.map((t, i) => (
                      <td
                        key={i}
                        className={`num px-3 py-3.5 text-center text-xs ${i === todayIdx ? "bg-forest-soft/50 text-forest" : "text-ink-soft"}`}
                      >
                        {t || <span className="text-ink-mute/50">–</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setOpenId(null)}
        eyebrow="Activities"
        title={selected?.name}
        size="lg"
      >
        {selected && (
          <div className="space-y-6">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
              <Photo src={selected.image} alt={selected.alt} sizes="(min-width: 768px) 720px, 100vw" className="absolute inset-0" imgClassName="ken-burns" />
            </div>
            <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
              <div>
                <p className="text-base leading-relaxed text-ink-soft">{selected.long}</p>
                <ul className="mt-5 space-y-2">
                  {selected.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-forest" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                        <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <dl className="h-fit rounded-xl bg-linen p-4 text-sm">
                {[
                  ["When", selected.schedule],
                  ["Duration", selected.duration],
                  ["Who", selected.ages],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-hairline py-2.5 first:pt-0">
                    <dt className="text-ink-mute">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 pt-3">
                  <dt className="text-ink-mute">Price</dt>
                  <dd className="text-right">
                    <span className="num text-lg font-semibold text-forest">{money(selected.priceUSD)}</span>
                    <span className="text-ink-mute"> per person</span>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-col gap-3 border-t border-hairline pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setOpenId(null)} className="btn btn-secondary min-h-11">
                Back to activities
              </button>
              <button type="button" onClick={() => ask(selected.topic)} className="btn btn-primary min-h-11">
                Ask the concierge
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
