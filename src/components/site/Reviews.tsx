import { Photo } from "@/components/ui/Photo";
import { Specs } from "@/components/ui/Overlay";
import { IMG } from "@/lib/images";

const REVIEWS = [
  {
    name: "Esther Nabirye",
    from: "Kampala",
    stay: "Forest Garden Banda · 2 nights",
    rating: 5,
    quote:
      "Forty-five minutes from my office and it felt like another country. The luwombo was better than my grandmother's, and I will deny ever saying that.",
  },
  {
    name: "Tom & Marieke de Vries",
    from: "Utrecht",
    stay: "Sunset Horizon Loft · 4 nights",
    rating: 5,
    quote:
      "We came for a quiet end to our safari and got exactly that. Sunsets from the roof deck, blankets by the fire bowl, and a driver waiting at Entebbe on time.",
  },
  {
    name: "Patricia Auma",
    from: "Kampala Fintech Ltd",
    stay: "Corporate retreat · 45 guests",
    rating: 5,
    quote:
      "The team-building facilitator had our engineers and sales team actually talking to each other. Everything was paid by MoMo in one go. Already rebooked for next year.",
  },
  {
    name: "James Mugisha",
    from: "Mbarara",
    stay: "Acacia Family Pavilion · 3 nights",
    rating: 5,
    quote:
      "The kids disappeared into the fun park after breakfast and only came back when they smelled the campfire. My wife and I read two whole books.",
  },
  {
    name: "Ruth Tumusiime",
    from: "Entebbe",
    stay: "Garden wedding · 180 guests",
    rating: 5,
    quote:
      "Our wedding under the jacarandas was everything we pictured. The events team handled the décor, the band and three aunties with very strong opinions.",
  },
  {
    name: "Daniel Byaruhanga",
    from: "London & Fort Portal",
    stay: "Savannah Stone Villa · 3 nights",
    rating: 4,
    quote:
      "Home for Christmas and wanted somewhere my parents could rest. The plunge pool was a hit. Only wish we'd booked the birding trek earlier, it fills up.",
  },
];

const GALLERY = [
  { src: IMG.lakeIslands, alt: "Still lake reflecting the hills at dawn", className: "row-span-2" },
  { src: IMG.safariDrive, alt: "Giraffes on the savannah at golden hour", className: "aspect-[4/3] sm:aspect-auto" },
  { src: IMG.poolThatch, alt: "Swimming pool lined with palm trees", className: "aspect-[4/3] sm:aspect-auto" },
  { src: IMG.weddingDance, alt: "An outdoor garden wedding ceremony", className: "aspect-[4/3] sm:aspect-auto" },
  { src: IMG.campfireLake, alt: "Tents glowing under a night sky", className: "aspect-[4/3] sm:aspect-auto" },
  {
    src: IMG.acaciaSunset,
    alt: "Acacia tree silhouetted against an orange sunset",
    className: "col-span-2 aspect-[16/7] sm:col-span-1 sm:col-start-4 sm:row-span-2 sm:row-start-1 sm:aspect-auto",
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${i <= rating ? "text-ember" : "text-stone-deep"}`} fill="currentColor" aria-hidden>
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8z" />
        </svg>
      ))}
    </span>
  );
}

function initials(name: string) {
  return name
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Reviews() {
  return (
    <section id="stories" className="section bg-linen">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Guest stories</p>
            <h2 className="display mt-3 text-4xl sm:text-5xl">In their own words</h2>
          </div>
          <div className="lg:justify-self-end">
            <div className="flex items-center gap-3">
              <span className="display num text-4xl">4.9</span>
              <Stars rating={5} />
            </div>
            <Specs
              className="mt-2"
              items={["412 verified reviews", "Booking.com 9.4", "Airbnb Guest Favourite", "Tripadvisor Travellers' Choice"]}
            />
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="card flex flex-col p-6">
              <Stars rating={r.rating} />
              <blockquote className="mt-4 flex-1 font-serif text-[1.05rem] leading-relaxed text-ink">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-hairline pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-soft text-sm font-semibold text-forest">
                  {initials(r.name)}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{r.name}</span>
                  <span className="block truncate text-xs text-ink-mute">
                    {r.from} · {r.stay}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="display text-2xl">Moments from FunCity</h3>
            <p className="text-sm text-ink-mute">Share yours with #HakunaMatataFunCity</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-[repeat(2,200px)] sm:gap-4 lg:grid-rows-[repeat(2,260px)]">
            {GALLERY.map((g) => (
              <div key={g.src} className={`group overflow-hidden rounded-2xl ${g.className}`}>
                <Photo
                  src={g.src}
                  alt={g.alt}
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="h-full w-full"
                  imgClassName="transition duration-500 group-hover:scale-[1.04]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
