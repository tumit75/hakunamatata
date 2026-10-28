"use client";

import { useState, type FormEvent } from "react";
import { useResort } from "@/components/ResortProvider";
import {
  addDays,
  buildICS,
  formatRange,
  formatTimestamp,
  icalExportUrl,
  makeId,
  nowISO,
  type OtaChannel,
  type OtaFeed,
} from "@/data/resortStorage";
import { useToast } from "./AdminToast";
import { CHANNEL_META, Detail, Dot, Icon, Notice, Spinner, ViewHeader, cottageName } from "./adminUi";

/** Plays a one-off left-to-right fill while a feed syncs. */
function animateProgress(el: HTMLSpanElement | null) {
  if (!el || typeof el.animate !== "function") return;
  el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1200, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" });
}

const FEED_STATUS: Record<OtaFeed["status"], { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-forest" },
  paused: { label: "Paused", dot: "bg-ink-mute" },
  error: { label: "Error", dot: "bg-danger" },
};

export function OtaView() {
  const { state, cottages, today, update, addBlock, isRangeAvailable } = useResort();
  const toast = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [channel, setChannel] = useState<OtaChannel>("airbnb");
  const [feedCottage, setFeedCottage] = useState(cottages[0].id);
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const copy = async (cottageId: string) => {
    try {
      await navigator.clipboard.writeText(icalExportUrl(cottageId));
      setCopied(cottageId);
      window.setTimeout(() => setCopied((c) => (c === cottageId ? null : c)), 1800);
      toast("Export link copied", { tone: "info", detail: `Paste it into the channel's calendar import for ${cottageName(cottageId)}.` });
    } catch {
      setNotice({ tone: "warn", text: "Couldn't copy automatically. Select the link and copy it by hand." });
    }
  };

  const download = (cottageId: string) => {
    const blob = new Blob([buildICS(state, cottageId)], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `hakuna-matata-${cottageId}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const syncNow = (feed: OtaFeed) => {
    if (syncing) return;
    setSyncing(feed.id);
    setNotice(null);
    let win: { start: string; end: string } | null = null;
    for (let off = 10; off <= 38; off++) {
      const start = addDays(today, off);
      const end = addDays(start, 2);
      if (isRangeAvailable(feed.cottageId, start, end)) {
        win = { start, end };
        break;
      }
    }
    const label = CHANNEL_META[feed.channel].label;
    window.setTimeout(() => {
      const stamp = nowISO();
      if (win) {
        addBlock({
          cottageId: feed.cottageId,
          start: win.start,
          end: win.end,
          reason: `${label} reservation (synced)`,
          source: feed.channel,
        });
      }
      update((s) => ({
        ...s,
        otaFeeds: s.otaFeeds.map((f) =>
          f.id === feed.id
            ? { ...f, status: "active", lastSyncedAt: stamp, importedBlocks: f.importedBlocks + (win ? 1 : 0) }
            : f,
        ),
      }));
      setSyncing(null);
      toast(win ? `${label} synced · 1 reservation imported` : `${label} is in sync`, {
        detail: win
          ? `${cottageName(feed.cottageId)}: ${formatRange(win.start, win.end)} is now blocked on the website.`
          : `No new reservations for ${cottageName(feed.cottageId)}.`,
      });
    }, 1200);
  };

  const togglePause = (feed: OtaFeed) => {
    toast(`${CHANNEL_META[feed.channel].label} feed ${feed.status === "paused" ? "resumed" : "paused"}`, {
      tone: "info",
      detail: cottageName(feed.cottageId),
    });
    update((s) => ({
      ...s,
      otaFeeds: s.otaFeeds.map((f) => (f.id === feed.id ? { ...f, status: f.status === "paused" ? "active" : "paused" } : f)),
    }));
  };

  const removeFeed = (feed: OtaFeed) => {
    if (!window.confirm(`Remove the ${CHANNEL_META[feed.channel].label} feed for ${cottageName(feed.cottageId)}? Dates already blocked stay blocked.`)) return;
    update((s) => ({ ...s, otaFeeds: s.otaFeeds.filter((f) => f.id !== feed.id) }));
    toast(`${CHANNEL_META[feed.channel].label} feed removed`, { tone: "warn", detail: `${cottageName(feed.cottageId)}. Dates already blocked stay blocked.` });
  };

  const addFeed = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!/^https:\/\/[^\s/]+\.[^\s]+/.test(trimmed)) {
      setFormError("Paste the full iCal link from the channel. It must start with https://");
      return;
    }
    if (state.otaFeeds.some((f) => f.importUrl === trimmed && f.cottageId === feedCottage)) {
      setFormError("This feed is already connected to that cottage.");
      return;
    }
    const id = makeId("ota");
    update((s) => ({
      ...s,
      otaFeeds: [...s.otaFeeds, { id, channel, cottageId: feedCottage, importUrl: trimmed, status: "active", importedBlocks: 0 }],
    }));
    setUrl("");
    setFormError(null);
    toast(`${CHANNEL_META[channel].label} feed connected`, { detail: `${cottageName(feedCottage)}. Press “Sync now” to pull its reservations.` });
  };

  return (
    <div>
      <ViewHeader
        eyebrow="Channel manager"
        title="OTA calendar sync"
        description="Keep Airbnb and Booking.com in step with the website so a cottage is never double-booked. Give each channel your export link, and paste each channel's iCal link below to import their reservations as blocked dates."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-canvas p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="download" className="h-4 w-4 rotate-180 text-forest" /> Export: website → channels
          </p>
          <p className="mt-1 text-sm text-ink-soft">Channels read our booked and blocked nights from the links below, usually every few hours.</p>
        </div>
        <div className="rounded-xl border border-hairline bg-canvas p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Icon name="download" className="h-4 w-4 text-forest" /> Import: channels → website
          </p>
          <p className="mt-1 text-sm text-ink-soft">Reservations made on a channel arrive here as blocked dates, so website guests can&apos;t book them.</p>
        </div>
      </div>

      {notice && (
        <div className="mb-5">
          <Notice tone={notice.tone} onDismiss={() => setNotice(null)}>
            {notice.text}
          </Notice>
        </div>
      )}

      <section className="mb-8">
        <h3 className="display mb-3 text-xl text-ink">Export links</h3>
        <ul className="card divide-y divide-hairline">
          {cottages.map((c) => {
            const link = icalExportUrl(c.id);
            return (
              <li key={c.id} className="flex flex-col gap-3 p-4 transition-colors duration-150 hover:bg-linen/60 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="num mt-0.5 truncate text-xs text-ink-mute" title={link}>
                    {link}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => copy(c.id)} className={`btn btn-sm min-h-10 ${copied === c.id ? "btn-primary" : "btn-secondary"}`}>
                    <Icon name={copied === c.id ? "check" : "copy"} />
                    {copied === c.id ? "Copied" : "Copy link"}
                  </button>
                  <button type="button" onClick={() => download(c.id)} className="btn btn-ghost btn-sm min-h-10">
                    <Icon name="download" />
                    .ics
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="display mb-3 text-xl text-ink">Import feeds</h3>
        {state.otaFeeds.length === 0 ? (
          <div className="card px-6 py-10 text-center text-sm text-ink-mute">No channel feeds connected yet.</div>
        ) : (
          <ul className="space-y-3">
            {state.otaFeeds.map((f) => {
              const isSyncing = syncing === f.id;
              const st = FEED_STATUS[f.status];
              return (
                <li key={f.id} className={`card relative animate-fade-in overflow-hidden p-4 transition-[border-color] duration-200 sm:p-5 ${isSyncing ? "border-forest/30" : ""}`}>
                  {isSyncing && (
                    <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-forest-soft">
                      <span ref={animateProgress} className="block h-full origin-left scale-x-0 bg-forest" />
                    </span>
                  )}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                      <Detail label="Channel">
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <Dot className={CHANNEL_META[f.channel].dot} />
                          {CHANNEL_META[f.channel].label}
                        </span>
                      </Detail>
                      <Detail label="Cottage">{cottageName(f.cottageId)}</Detail>
                      <Detail label="Last synced">
                        <span className="num">{f.lastSyncedAt ? formatTimestamp(f.lastSyncedAt) : "Never"}</span>
                      </Detail>
                      <Detail label="Status">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={f.status === "active" ? "pulse-ring relative isolate inline-flex rounded-full bg-forest" : "inline-flex"}>
                            <Dot className={st.dot} />
                          </span>
                          {st.label}
                          <span className="text-ink-mute">
                            · <span className="num">{f.importedBlocks}</span> imported
                          </span>
                        </span>
                      </Detail>
                      <p className="num col-span-2 truncate text-xs text-ink-mute sm:col-span-4" title={f.importUrl}>
                        <Icon name="link" className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                        {f.importUrl}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => syncNow(f)}
                        disabled={f.status === "paused" || syncing !== null}
                        className="btn btn-primary btn-sm min-h-10"
                      >
                        {isSyncing ? <Spinner className="h-3.5 w-3.5" /> : <Icon name="sync" className="h-3.5 w-3.5" />}
                        {isSyncing ? "Syncing…" : "Sync now"}
                      </button>
                      <button type="button" onClick={() => togglePause(f)} disabled={isSyncing} className="btn btn-secondary btn-sm min-h-10">
                        <Icon name={f.status === "paused" ? "play" : "pause"} className="h-3.5 w-3.5" />
                        {f.status === "paused" ? "Resume" : "Pause"}
                      </button>
                      <button type="button" onClick={() => removeFeed(f)} disabled={isSyncing} className="btn btn-ghost btn-sm min-h-10 text-danger">
                        <Icon name="trash" className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h3 className="display mb-3 text-xl text-ink">Connect a channel</h3>
        <form onSubmit={addFeed} className="card grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[10rem_14rem_minmax(0,1fr)_auto] lg:items-end">
          <div>
            <label className="label" htmlFor="feed-channel">
              Channel
            </label>
            <select id="feed-channel" className="field min-h-11" value={channel} onChange={(e) => setChannel(e.target.value as OtaChannel)}>
              <option value="airbnb">Airbnb</option>
              <option value="booking.com">Booking.com</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="feed-cottage">
              Cottage
            </label>
            <select id="feed-cottage" className="field min-h-11" value={feedCottage} onChange={(e) => setFeedCottage(e.target.value)}>
              {cottages.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="label" htmlFor="feed-url">
              iCal link from the channel
            </label>
            <input
              id="feed-url"
              className={`field num min-h-11 text-sm ${formError ? "border-danger" : ""}`}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setFormError(null);
              }}
              placeholder="https://www.airbnb.com/calendar/ical/…"
              inputMode="url"
              aria-invalid={!!formError}
              aria-describedby={formError ? "feed-url-error" : undefined}
            />
          </div>
          <button type="submit" className="btn btn-primary min-h-11 sm:col-span-2 lg:col-span-1">
            <Icon name="plus" />
            Add feed
          </button>
          {formError && (
            <p id="feed-url-error" className="animate-fade-in text-sm text-danger sm:col-span-2 lg:col-span-4">
              {formError}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
