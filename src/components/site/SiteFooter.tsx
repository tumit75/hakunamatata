"use client";

import { useState, type FormEvent } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Parallax, Reveal } from "@/components/ui/Motion";
import { IMG } from "@/lib/images";
import { RESORT_EMAIL, RESORT_PHONE, whatsappLink } from "@/data/resortStorage";

const LINKS = [
  { href: "#stay", label: "Cottages" },
  { href: "#experiences", label: "Experiences" },
  { href: "#events", label: "Weddings & retreats" },
  { href: "#dining", label: "Garden Restaurant" },
  { href: "#activities", label: "Activities" },
  { href: "#location", label: "Getting here" },
  { href: "#stories", label: "Guest stories" },
];

export function SiteFooter() {
  const { openAdmin, openBooking, today } = useResort();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const year = today.slice(0, 4);

  function onSubscribe(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  return (
    <footer className="bg-forest-deep text-white">
      {/* Closing call to action */}
      <div className="container-x pt-16 sm:pt-20">
        <Reveal variant="scale" className="relative isolate overflow-hidden rounded-3xl">
          <Parallax speed={0.1} className="absolute inset-x-0 -top-[20%] -bottom-[20%] -z-10">
            <Photo src={IMG.lakeBunyonyi} alt="Terraced green hills around a lake in Uganda" sizes="(min-width: 1280px) 1200px, 100vw" className="absolute inset-0" />
          </Parallax>
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-forest-deep/90 via-forest-deep/60 to-forest-deep/20" aria-hidden />
          <div className="flex flex-col gap-6 px-6 py-12 sm:px-10 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:px-14">
            <div className="max-w-xl">
              <p className="eyebrow text-ember-soft">Your cottage is waiting</p>
              <p className="display mt-3 text-[clamp(1.9rem,4.4vw,3rem)] [text-wrap:balance]">
                Trade the city for birdsong this weekend
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
                Breakfast included, pay with MTN MoMo, Airtel Money or card, and free cancellation up to 7 days before you arrive.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => openBooking()} className="btn btn-ember min-h-11">
                Book a stay
              </button>
              <a
                href={whatsappLink("Hello Hakuna Matata FunCity, I'd like to plan a stay.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn min-h-11 border border-white/35 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="container-x py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr] lg:gap-10">
          <Reveal>
            <a href="#top" className="inline-flex flex-col leading-none">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-ember-soft">FunCity</span>
              <span className="display mt-0.5 text-2xl">Hakuna Matata</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              A family-run nature resort in the hills north of Kampala. Five cottages, one garden restaurant and a lot of
              birdsong.
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">We accept</p>
            <p className="mt-2 text-sm text-white/80">
              MTN MoMo<span className="mx-1.5 text-white/40">·</span>Airtel Money<span className="mx-1.5 text-white/40">·</span>Visa
              <span className="mx-1.5 text-white/40">·</span>Mastercard
            </p>
          </Reveal>

          <Reveal delay={80}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Explore</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="link-grow inline-block py-1.5 text-white/80 transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <button type="button" onClick={openAdmin} className="link-grow inline-block py-1.5 text-left text-white/80 transition-colors hover:text-white">
                  Staff portal
                </button>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>
                <a href={`tel:${RESORT_PHONE.replace(/\s/g, "")}`} className="num inline-flex items-center gap-2.5 py-0.5 transition hover:text-white">
                  <FooterIcon kind="phone" />
                  {RESORT_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${RESORT_EMAIL}`} className="inline-flex items-center gap-2.5 break-all py-0.5 transition hover:text-white">
                  <FooterIcon kind="mail" />
                  {RESORT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink("Hello Hakuna Matata FunCity, I have a question about staying with you.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 py-0.5 transition hover:text-white"
                >
                  <FooterIcon kind="chat" />
                  WhatsApp concierge
                </a>
              </li>
              <li className="flex gap-2.5 leading-relaxed text-white/60">
                <FooterIcon kind="pin" />
                <span>
                  Gayaza–Zirobwe Road
                  <br />
                  Wakiso District, Uganda
                </span>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={240}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Letters from the garden</p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Seasonal offers, harvest menus and the occasional shoebill sighting. One email a month.
            </p>
            {subscribed ? (
              <p className="mt-4 animate-pop-in rounded-[10px] bg-white/10 px-4 py-3 text-sm text-white" role="status">
                Webale! You&apos;re on the list. Look out for our next letter.
              </p>
            ) : (
              <form onSubmit={onSubscribe} className="mt-4 flex gap-2">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-h-11 min-w-0 flex-1 rounded-[10px] border border-white/20 bg-white/10 px-3.5 text-sm text-white transition-colors placeholder:text-white/40 focus:border-white/60 focus:outline-none"
                />
                <button type="submit" className="btn min-h-11 bg-white text-forest-deep hover:bg-linen">
                  Join
                </button>
              </form>
            )}
          </Reveal>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <span className="num">{year}</span> Hakuna Matata FunCity. All rights reserved.
            <span className="mx-1.5 hidden sm:inline">·</span>
            <span className="block sm:inline">Prices include breakfast. VAT 18% added at checkout.</span>
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex min-h-10 items-center gap-2 self-start rounded-full border border-white/20 px-4 text-white/80 transition hover:border-white/50 hover:text-white sm:self-auto"
          >
            Back to top
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M12 19V5M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterIcon({ kind }: { kind: "phone" | "mail" | "chat" | "pin" }) {
  const paths: Record<typeof kind, string> = {
    phone: "M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z",
    mail: "M4 6h16v12H4zM4 7l8 6 8-6",
    chat: "M4 19.5 5.4 15A8 8 0 1 1 9 18.6Z",
    pin: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11ZM12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z",
  };
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-ember-soft" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d={paths[kind]} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
