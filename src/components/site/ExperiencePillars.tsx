import { Photo } from "@/components/ui/Photo";
import { IMG } from "@/lib/images";

const PILLARS = [
  {
    title: "Botanical Gardens",
    image: IMG.gardenTropical,
    alt: "Lush botanical garden with flowering beds",
    copy: "Twelve acres of indigenous trees, medicinal herbs and banana groves, with shaded paths that lead down to the wetland boardwalk.",
    detail: "Over 140 bird species recorded",
  },
  {
    title: "Farm-to-Table Dining",
    image: IMG.diningMarket,
    alt: "Fresh produce from the resort farm",
    copy: "Our kitchen garden and neighbouring farms supply almost everything on the plate, from morning matooke to evening Nile tilapia.",
    detail: "Menu changes with the harvest",
  },
  {
    title: "Wellness & Spa",
    image: IMG.spaMassage,
    alt: "Massage treatment in a calm spa room",
    copy: "Shea butter massages, garden yoga at sunrise and a quiet reading pavilion where phones are politely put away.",
    detail: "Open daily, 8 am – 8 pm",
  },
  {
    title: "Adventure",
    image: IMG.canopyWalk,
    alt: "Hikers on a trail through the hills",
    copy: "Canopy walks, quad bike trails, guided birding and campfire evenings for the curious, the energetic and the kids.",
    detail: "Guides for every age",
  },
];

export function ExperiencePillars() {
  return (
    <section id="experiences" className="section bg-canvas">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow">The FunCity experience</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">A whole weekend, within the garden walls</h2>
          </div>
          <p className="max-w-xl text-base leading-relaxed text-ink-soft lg:justify-self-end">
            Most guests arrive planning to see everything and end up doing very little, which is exactly the point.
            Everything here is a short walk from your cottage door.
          </p>
        </div>

        <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <article key={p.title} className="group">
              <Photo
                src={p.image}
                alt={p.alt}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className={`rounded-2xl ${i % 2 === 1 ? "aspect-[4/5] lg:mt-10" : "aspect-[4/5]"}`}
                imgClassName="transition duration-500 group-hover:scale-[1.04]"
              />
              <div className="mt-5">
                <p className="num text-xs text-ink-mute">0{i + 1}</p>
                <h3 className="display mt-1 text-2xl">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{p.copy}</p>
                <p className="mt-3 text-xs font-semibold text-forest">{p.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
