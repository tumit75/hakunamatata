"use client";

import { useState, type FormEvent } from "react";
import { useResort } from "@/components/ResortProvider";
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
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
          <div>
            <a href="#top" className="inline-flex flex-col leading-none">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-ember-soft">FunCity</span>
              <span className="display mt-0.5 text-2xl">Hakuna Matata</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              A family-run nature resort in the hills north of Kampala. Five cottages, one garden restaurant and a lot of
              birdsong.
            </p>
            <button type="button" onClick={() => openBooking()} className="btn btn-ember mt-6">
              Book a stay
            </button>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-white/80 transition hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <button type="button" onClick={openAdmin} className="text-white/80 transition hover:text-white">
                  Staff portal
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Contact</p>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>
                <a href={`tel:${RESORT_PHONE.replace(/\s/g, "")}`} className="num transition hover:text-white">
                  {RESORT_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${RESORT_EMAIL}`} className="break-all transition hover:text-white">
                  {RESORT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink("Hello Hakuna Matata FunCity, I have a question about staying with you.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  WhatsApp concierge
                </a>
              </li>
              <li className="leading-relaxed text-white/60">
                Hakuna Matata FunCity
                <br />
                Gayaza–Zirobwe Road
                <br />
                Wakiso District, Uganda
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Letters from the garden</p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Seasonal offers, harvest menus and the occasional shoebill sighting. One email a month.
            </p>
            {subscribed ? (
              <p className="mt-4 rounded-[10px] bg-white/10 px-4 py-3 text-sm text-white" role="status">
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
                  className="min-w-0 flex-1 rounded-[10px] border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
                />
                <button type="submit" className="btn bg-white text-forest-deep hover:bg-linen">
                  Join
                </button>
              </form>
            )}
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">We accept</p>
            <p className="mt-2 text-sm text-white/80">
              MTN MoMo<span className="mx-1.5 text-white/40">·</span>Airtel Money<span className="mx-1.5 text-white/40">·</span>Visa
              <span className="mx-1.5 text-white/40">·</span>Mastercard
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <span className="num">{year}</span> Hakuna Matata FunCity. All rights reserved.
          </p>
          <p>Prices include breakfast. VAT 18% added at checkout.</p>
        </div>
      </div>
    </footer>
  );
}
