"use client";

import { useResort } from "@/components/ResortProvider";
import { Specs } from "@/components/ui/Overlay";
import { formatDate, formatTimestamp, type EventQuote } from "@/data/resortStorage";
import { useToast } from "./AdminToast";
import { Detail, Dot, Icon, ViewHeader } from "./adminUi";

const QUOTE_STATUS: Record<EventQuote["status"], { label: string; dot: string }> = {
  new: { label: "New", dot: "bg-ember" },
  contacted: { label: "Contacted", dot: "bg-[#4f8f68]" },
  booked: { label: "Booked", dot: "bg-forest" },
};

export function EnquiriesView() {
  const { state, money, update } = useResort();
  const toast = useToast();
  const quotes = [...state.eventQuotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tables = [...state.tableReservations].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const setQuoteStatus = (id: string, status: EventQuote["status"]) => {
    const q = state.eventQuotes.find((x) => x.id === id);
    update((s) => ({ ...s, eventQuotes: s.eventQuotes.map((x) => (x.id === id ? { ...x, status } : x)) }));
    toast(`Enquiry marked ${QUOTE_STATUS[status].label.toLowerCase()}`, { detail: q?.name });
  };

  return (
    <div>
      <ViewHeader
        eyebrow="Sales"
        title="Enquiries"
        description="Wedding and corporate quote requests from the events planner, plus garden restaurant table reservations."
      />

      <section className="mb-10">
        <h3 className="display mb-3 text-xl text-ink">
          Event quotes <span className="num text-base text-ink-mute">({quotes.length})</span>
        </h3>
        {quotes.length === 0 ? (
          <div className="card px-6 py-10 text-center text-sm text-ink-mute">No event enquiries yet.</div>
        ) : (
          <ul className="space-y-3">
            {quotes.map((q) => (
              <li key={q.id} className="card lift p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-mute">
                      <Dot className={q.type === "wedding" ? "bg-ember" : "bg-forest"} />
                      {q.type === "wedding" ? "Wedding & celebration" : "Corporate & team building"}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {q.name}
                      {q.organisation && <span className="font-normal text-ink-soft"> · {q.organisation}</span>}
                    </p>
                    <Specs
                      className="mt-1"
                      items={[
                        <span key="d" className="num">{formatDate(q.date, { year: true })}</span>,
                        <span key="g" className="num">{q.guests} guests</span>,
                        q.packageName,
                        q.cateringTier,
                      ]}
                    />
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 sm:flex-col sm:items-end">
                    <p className="num text-xl font-semibold text-ink">{money(q.estimateUSD)}</p>
                    <label className="inline-flex items-center gap-2">
                      <Dot className={QUOTE_STATUS[q.status].dot} />
                      <span className="sr-only">Status</span>
                      <select
                        value={q.status}
                        onChange={(e) => setQuoteStatus(q.id, e.target.value as EventQuote["status"])}
                        className="field min-h-10 w-auto py-1.5 pl-2 pr-7 text-xs font-semibold"
                      >
                        {(Object.keys(QUOTE_STATUS) as EventQuote["status"][]).map((s) => (
                          <option key={s} value={s}>
                            {QUOTE_STATUS[s].label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 border-t border-hairline pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Detail label="Phone">
                    <a href={`tel:${q.phone.replace(/\s/g, "")}`} className="num inline-flex items-center gap-1.5 text-forest hover:underline">
                      <Icon name="phone" className="h-3.5 w-3.5" />
                      {q.phone}
                    </a>
                  </Detail>
                  <Detail label="Email">
                    <a href={`mailto:${q.email}`} className="inline-flex items-center gap-1.5 text-forest hover:underline">
                      <Icon name="mail" className="h-3.5 w-3.5" />
                      {q.email}
                    </a>
                  </Detail>
                  <Detail label="Extras">{q.extras.length ? q.extras.join(", ") : <span className="text-ink-mute">None</span>}</Detail>
                  <Detail label="Received">
                    <span className="num">{formatTimestamp(q.createdAt)}</span>
                  </Detail>
                  {q.notes && (
                    <div className="sm:col-span-2 lg:col-span-4">
                      <Detail label="Notes">{q.notes}</Detail>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="display mb-3 text-xl text-ink">
          Table reservations <span className="num text-base text-ink-mute">({tables.length})</span>
        </h3>
        {tables.length === 0 ? (
          <div className="card px-6 py-10 text-center text-sm text-ink-mute">
            No garden restaurant reservations yet. They appear here when guests book a table on the website.
          </div>
        ) : (
          <ul className="card divide-y divide-hairline">
            {tables.map((t) => (
              <li key={t.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{t.name}</p>
                  <Specs
                    items={[
                      <span key="d" className="num">{formatDate(t.date, { year: true })}</span>,
                      <span key="t" className="num">{t.time}</span>,
                      <span key="p" className="num">{t.partySize} {t.partySize === 1 ? "guest" : "guests"}</span>,
                      t.seating,
                    ]}
                  />
                  {t.notes && <p className="mt-1 text-sm text-ink-soft">{t.notes}</p>}
                </div>
                <a href={`tel:${t.phone.replace(/\s/g, "")}`} className="num shrink-0 text-sm text-forest hover:underline">
                  {t.phone}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
