import { Photo } from "@/components/ui/Photo";
import { CountUp, Reveal } from "@/components/ui/Motion";
import { IMG } from "@/lib/images";

const PILLARS = [
  {
    title: "Botanical Gardens",
    image: IMG.gardenGazebo,
    alt: "A thatched garden gazebo framed by pink bougainvillea",
    copy: "Twelve acres of indigenous trees, medicinal herbs and banana groves, with shaded paths down to the wetland boardwalk.",
    detail: "Over 140 bird species recorded",
  },
  {
    title: "Farm-to-Table Dining",
    image: IMG.gardenFeast,
    alt: "A long table in the garden laid with fresh dishes from the farm",
    copy: "Our kitchen garden and neighbouring farms supply almost everything on the plate, from morning matooke to evening Nile tilapia.",
    detail: "Menu changes with the harvest",
  },
  {
    title: "Wellness & Spa",
    image: IMG.spaHotStone,
    alt: "A hot stone massage with white flowers on the table",
    copy: "Shea butter massages, garden yoga at sunrise and a quiet reading pavilion where phones are politely put away.",
    detail: "Open daily, 8 am – 8 pm",
  },
  {
    title: "Adventure",
    image: IMG.rafting,
    alt: "A raft crashing through white-water rapids",
    copy: "Canopy walks, quad bike trails and guided birding at the resort, plus day trips to raft the Nile rapids at Jinja.",
    detail: "Nile rafting trips from Jinja",
  },
];

const STATS = [
  { to: 5, decimals: 0, suffix: "", label: "Nature cottages" },
  { to: 12, decimals: 0, suffix: "", label: "Acres of gardens" },
  { to: 4.9, decimals: 1, suffix: "", label: "Average guest rating" },
  { to: 1200, decimals: 0, suffix: "+", label: "Happy guests a year" },
];

export function ExperiencePillars() {
  return (
    <section id="experiences" className="section bg-canvas">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <Reveal>
            <p className="eyebrow">The FunCity experience</p>
            <h2 className="display mt-3 text-[clamp(2.1rem,5vw,3.25rem)] [text-wrap:balance]">
              A whole weekend, within the garden walls
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="max-w-xl text-base leading-relaxed text-ink-soft lg:justify-self-end">
              Most guests arrive planning to see everything and end up doing very little, which is exactly the point.
              Everything here is a short walk from your cottage door.
            </p>
          </Reveal>
        </div>

        {/* Swipe rail on phones, grid from sm up */}
        <div className="rail no-scrollbar -mx-4 mt-10 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal
              key={p.title}
              as="article"
              delay={i * 90}
              className={`group w-[80%] shrink-0 sm:w-auto ${i % 2 === 1 ? "lg:mt-12" : ""}`}
            >
              <div className="relative isolate aspect-[4/5] overflow-hidden rounded-2xl">
                <Photo
                  src={p.image}
                  alt={p.alt}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
                  className="absolute inset-0 -z-10"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-linear-to-t from-ink/80 via-ink/15 to-transparent transition-opacity duration-500 group-hover:from-forest-deep/90"
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="num text-xs text-white/70">0{i + 1}</p>
                  <h3 className="display mt-1 text-[1.7rem] text-white">{p.title}</h3>
                  {/* Slides up on hover-capable devices */}
                  <div className="hidden [@media(hover:hover)]:grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <p className="pt-2 text-sm leading-relaxed text-white/85 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        {p.copy}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-ember-soft">{p.detail}</p>
                </div>
              </div>
              {/* Touch devices: copy sits under the photo */}
              <p className="mt-4 text-sm leading-relaxed text-ink-soft [@media(hover:hover)]:hidden">{p.copy}</p>
            </Reveal>
          ))}
        </div>

        {/* Stats band */}
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-y border-hairline py-10 sm:mt-20 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} className="text-center lg:text-left">
              <p className="display text-[clamp(2.4rem,6vw,3.5rem)] leading-none text-forest">
                <CountUp to={s.to} decimals={s.decimals} suffix={s.suffix} className="font-serif" />
              </p>
              <p className="mt-2 text-sm text-ink-mute">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
