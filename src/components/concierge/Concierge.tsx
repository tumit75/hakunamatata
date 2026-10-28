"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useResort, type ConciergeTopic, type SearchState } from "@/components/ResortProvider";
import { RESORT_EMAIL, RESORT_PHONE, formatDate, getCottage, whatsappLink } from "@/data/resortStorage";

/* ------------------------------------------------------------------ */
/* Topics & message templates                                          */
/* ------------------------------------------------------------------ */

const TOPICS: { id: ConciergeTopic; title: string; hint: string; icon: ReactNode }[] = [
  {
    id: "cottage",
    title: "Cottage reservation",
    hint: "Check dates and rates",
    icon: (
      <path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    id: "wedding",
    title: "Wedding quote",
    hint: "Packages, dates and venues",
    icon: (
      <>
        <circle cx="9" cy="14" r="5" />
        <circle cx="15" cy="14" r="5" />
        <path d="M10 5l2-2 2 2-2 2-2-2Z" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: "corporate",
    title: "Corporate retreat",
    hint: "Team building and conferences",
    icon: (
      <>
        <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
        <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 13h17" strokeLinecap="round" />
      </>
    ),
  },
  {
    id: "shuttle",
    title: "Airport shuttle (Entebbe)",
    hint: "Private pickup from EBB",
    icon: (
      <>
        <path d="M4 16V8a2 2 0 0 1 2-2h9l4 4.5V16" strokeLinejoin="round" />
        <path d="M3 16h18M14 6v4.5h5" strokeLinejoin="round" />
        <circle cx="7.5" cy="17.5" r="1.8" />
        <circle cx="16.5" cy="17.5" r="1.8" />
      </>
    ),
  },
  {
    id: "general",
    title: "General question",
    hint: "Anything else, just ask",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4M12 16.8v.2" strokeLinecap="round" />
      </>
    ),
  },
];

function templateFor(topic: ConciergeTopic, search: SearchState): string {
  switch (topic) {
    case "cottage": {
      const cottage = search.cottageId !== "any" ? getCottage(search.cottageId) : undefined;
      const guests = `${search.guests} ${search.guests === 1 ? "guest" : "guests"}`;
      return `Hello Hakuna Matata FunCity! I'd like to reserve ${cottage ? `the ${cottage.name}` : "a cottage"} from ${formatDate(
        search.checkIn,
        { year: true },
      )} to ${formatDate(search.checkOut, { year: true })} for ${guests}. Is it available, and what would the total be?`;
    }
    case "wedding":
      return "Hello! We're planning a wedding at Hakuna Matata FunCity for about ___ guests around ___ (month/year). Could you share your wedding packages and available dates?";
    case "corporate":
      return "Hello! I'm organising a team-building retreat for about ___ colleagues from ___ (company). Could you send options for the venue, meals and overnight cottages?";
    case "shuttle":
      return "Hello! I'd like to book a transfer from Entebbe International Airport to Hakuna Matata FunCity.\nFlight number: ___\nArrival date & time: ___\nPassengers: ___";
    default:
      return "Hello Hakuna Matata FunCity! I have a question: ";
  }
}

/* ------------------------------------------------------------------ */
/* Floating button + panel                                             */
/* ------------------------------------------------------------------ */

export function Concierge() {
  const { concierge, openConcierge, closeConcierge, search } = useResort();
  const [labelHidden, setLabelHidden] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 md:bottom-6 md:right-6">
        {!labelHidden && !concierge.open && (
          <div className="hidden animate-pop-in items-center gap-0.5 rounded-xl border border-hairline bg-canvas py-1 pl-3 pr-1 shadow-lg shadow-black/10 md:flex">
            <button type="button" onClick={() => openConcierge()} className="py-1 text-sm font-semibold text-ink">
              Chat with us
            </button>
            <button
              type="button"
              aria-label="Hide chat label"
              onClick={() => setLabelHidden(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-mute transition hover:bg-stone hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => (concierge.open ? closeConcierge() : openConcierge())}
          aria-label={concierge.open ? "Close concierge" : "Chat with us on WhatsApp"}
          aria-expanded={concierge.open}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-black/20 transition duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
        >
          {concierge.open ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <WhatsAppGlyph className="h-7 w-7" />
          )}
        </button>
      </div>

      {concierge.open && (
        <ConciergePanel key={concierge.topic} initialTopic={concierge.topic} search={search} onClose={closeConcierge} />
      )}
    </>
  );
}

function ConciergePanel({
  initialTopic,
  search,
  onClose,
}: {
  initialTopic: ConciergeTopic;
  search: SearchState;
  onClose: () => void;
}) {
  const [topic, setTopic] = useState<ConciergeTopic>(initialTopic);
  const [message, setMessage] = useState(() => templateFor(initialTopic, search));
  const [name, setName] = useState("");

  // Escape to close; lock page scroll while the bottom sheet covers a phone screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    const prevOverflow = document.body.style.overflow;
    if (isPhone) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      if (isPhone) document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const pick = (t: ConciergeTopic) => {
    setTopic(t);
    setMessage(templateFor(t, search));
  };

  const finalMessage = name.trim() ? `${message.trim()}\n\nFrom: ${name.trim()}` : message.trim();
  const topicTitle = TOPICS.find((t) => t.id === topic)?.title ?? "Enquiry";

  return (
    <div
      className="fixed inset-0 z-50 md:inset-auto md:bottom-24 md:right-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="concierge-title"
    >
      <div className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[2px] md:hidden" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] animate-rise-in flex-col overflow-hidden rounded-t-2xl bg-canvas shadow-2xl md:static md:max-h-[calc(100dvh-8rem)] md:w-[392px] md:animate-pop-in md:rounded-2xl md:border md:border-hairline">
        {/* Header */}
        <div className="flex items-center gap-3 bg-forest px-5 py-4 text-white">
          <span className="display flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ember text-xl text-white">
            N
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="concierge-title" className="text-base font-semibold leading-tight">
              Concierge
            </h2>
            <p className="text-xs text-white/75">Naome, guest relations</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/75">
              <span className="h-1.5 w-1.5 rounded-full bg-whatsapp" aria-hidden />
              Online 7 am – 10 pm EAT
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close concierge"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-stone px-4 py-3 text-sm leading-relaxed text-ink-soft">
            Habari! Pick what you need and I&apos;ll draft the message for you. Edit anything you like, then send it to us
            on WhatsApp. We usually reply within 10 minutes.
          </div>

          <p className="label mt-5">How can we help?</p>
          <div className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline-strong">
            {TOPICS.map((t) => {
              const active = t.id === topic;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pick(t.id)}
                  className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition ${
                    active ? "bg-forest-soft" : "bg-canvas hover:bg-linen"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      active ? "bg-forest text-white" : "bg-stone text-forest"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                      {t.icon}
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink">{t.title}</span>
                    <span className="block text-xs text-ink-mute">{t.hint}</span>
                  </span>
                  {active ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-forest" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-ink-mute" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <label htmlFor="concierge-name" className="label">
              Your name <span className="font-normal text-ink-mute">(optional)</span>
            </label>
            <input
              id="concierge-name"
              className="field"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="concierge-message" className="label">
              Message · {topicTitle}
            </label>
            <textarea
              id="concierge-message"
              className="field min-h-[124px] resize-y text-sm leading-relaxed"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-hairline bg-linen px-5 py-4">
          <a
            href={whatsappLink(finalMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-primary w-full ${message.trim() ? "" : "pointer-events-none opacity-45"}`}
            aria-disabled={!message.trim()}
          >
            <WhatsAppGlyph className="h-4 w-4" />
            Open WhatsApp
          </a>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a href={`tel:${RESORT_PHONE.replace(/\s/g, "")}`} className="btn btn-secondary btn-sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                <path
                  d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4Z"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="truncate">Call {RESORT_PHONE}</span>
            </a>
            <a
              href={`mailto:${RESORT_EMAIL}?subject=${encodeURIComponent(topicTitle)}&body=${encodeURIComponent(finalMessage)}`}
              className="btn btn-secondary btn-sm"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
                <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Email us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
