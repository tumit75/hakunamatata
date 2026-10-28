"use client";

import { useState } from "react";
import { useResort } from "@/components/ResortProvider";
import { Photo } from "@/components/ui/Photo";
import { Specs } from "@/components/ui/Overlay";
import { UGX_PER_USD, nightlyRateUSD, usdToUgx, type Cottage } from "@/data/resortStorage";
import { Icon, ViewHeader } from "./adminUi";

// Fixed sample nights so previews are deterministic.
const SAMPLES = [
  { label: "Green · weekday", iso: "2026-10-28" },
  { label: "Green · Fri/Sat", iso: "2026-10-30" },
  { label: "High · weekday", iso: "2026-07-15" },
  { label: "High · Fri/Sat", iso: "2026-07-17" },
];

export function RatesView() {
  const { cottages, currency } = useResort();
  return (
    <div>
      <ViewHeader
        eyebrow="Revenue"
        title="Cottage rates"
        description="Set the base nightly rate for each cottage. Seasonal and weekend pricing is applied on top automatically, and guests see new prices immediately."
      />

      <div className="mb-5 grid gap-3 rounded-xl border border-hairline bg-canvas p-4 text-sm text-ink-soft sm:grid-cols-3">
        <p>
          <span className="font-semibold text-ink">High season +20%</span>
          <br />
          December–January and June–August.
        </p>
        <p>
          <span className="font-semibold text-ink">Weekend +10%</span>
          <br />
          Friday and Saturday nights, stacked on season.
        </p>
        <p>
          <span className="font-semibold text-ink">VAT 18%</span>
          <br />
          Added at checkout. Existing bookings keep their price.
        </p>
      </div>

      <div className="space-y-3">
        {cottages.map((c) => (
          <RateRow key={`${c.id}-${currency}`} cottage={c} />
        ))}
      </div>
    </div>
  );
}

function RateRow({ cottage }: { cottage: Cottage }) {
  const { currency, rateFor, setRate, money } = useResort();
  const current = rateFor(cottage.id);
  const shown = currency === "USD" ? current : usdToUgx(current);
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const value = draft ?? String(shown);
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  const valid = value.trim() !== "" && Number.isFinite(parsed) && parsed > 0;
  const draftUSD = valid ? Math.round(currency === "USD" ? parsed : parsed / UGX_PER_USD) : current;
  const dirty = draft !== null && valid && draftUSD !== current;
  const changedFromList = current !== cottage.baseRateUSD;

  const save = () => {
    if (!valid) return;
    setRate(cottage.id, draftUSD);
    setDraft(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const resetToList = () => {
    setRate(cottage.id, cottage.baseRateUSD);
    setDraft(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="card grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.7fr)] lg:items-center">
      <div className="flex min-w-0 items-center gap-3.5">
        <Photo src={cottage.images[0]} alt={cottage.name} className="h-16 w-20 shrink-0 rounded-lg" sizes="80px" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{cottage.name}</p>
          <Specs items={[`${cottage.guests} guests`, `${cottage.sizeSqm} m²`]} className="text-xs" />
          <p className="mt-0.5 text-xs text-ink-mute">
            List price <span className="num">{money(cottage.baseRateUSD)}</span>
            {changedFromList && (
              <button type="button" onClick={resetToList} className="ml-2 font-semibold text-forest underline-offset-2 hover:underline">
                Restore
              </button>
            )}
          </p>
        </div>
      </div>

      <div>
        <label className="label" htmlFor={`rate-${cottage.id}`}>
          Base rate per night ({currency})
        </label>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-mute">
              {currency === "USD" ? "$" : "USh"}
            </span>
            <input
              id={`rate-${cottage.id}`}
              inputMode="numeric"
              value={value}
              onChange={(e) => {
                setSaved(false);
                setDraft(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
              className={`field num ${currency === "USD" ? "pl-7" : "pl-12"} ${!valid ? "border-danger" : ""}`}
              aria-invalid={!valid}
            />
          </div>
          <button type="button" onClick={save} disabled={!dirty} className="btn btn-primary btn-sm h-[42px]">
            Save
          </button>
        </div>
        <p className="mt-1.5 h-4 text-xs" aria-live="polite">
          {saved ? (
            <span className="inline-flex items-center gap-1 font-semibold text-forest">
              <Icon name="check" className="h-3.5 w-3.5" /> Saved
            </span>
          ) : !valid ? (
            <span className="text-danger">Enter a price above zero</span>
          ) : dirty ? (
            <span className="text-ember-deep">Unsaved change</span>
          ) : null}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SAMPLES.map((s) => (
          <div key={s.label} className="rounded-lg bg-linen px-3 py-2">
            <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink-mute">{s.label}</p>
            <p className="num mt-0.5 truncate text-sm font-semibold text-ink">{money(nightlyRateUSD(draftUSD, s.iso))}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
