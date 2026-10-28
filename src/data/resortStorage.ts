import { IMG } from "@/lib/images";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Currency = "USD" | "UGX";

export type Cottage = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  guests: number;
  beds: string;
  sizeSqm: number;
  baseRateUSD: number;
  view: string;
  /** Short spec phrases, shown as quiet text separated by middots. */
  specs: string[];
  amenities: string[];
  images: string[];
};

export type AddonUnit = "stay" | "night" | "guest";
export type Addon = {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  unit: AddonUnit;
};

export type BookingStatus = "pending" | "confirmed" | "checked-in" | "completed" | "cancelled";
export type PaymentMethod = "mtn" | "airtel" | "card" | "cash" | "pay-on-arrival";
export type BookingSource = "website" | "walk-in" | "phone" | "airbnb" | "booking.com";

export type Booking = {
  id: string;
  code: string;
  cottageId: string;
  /** ISO YYYY-MM-DD. */
  checkIn: string;
  /** ISO YYYY-MM-DD, exclusive (departure day). */
  checkOut: string;
  guests: number;
  guestName: string;
  email: string;
  phone: string;
  addons: string[];
  specialRequests?: string;
  totalUSD: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  source: BookingSource;
  /** ISO timestamp. */
  createdAt: string;
  notifyEmail?: boolean;
  notifySms?: boolean;
};

export type BlockSource = "maintenance" | "private-buyout" | "airbnb" | "booking.com" | "other";
export type BlockedRange = {
  id: string;
  cottageId: string;
  /** ISO, first blocked night. */
  start: string;
  /** ISO, exclusive. */
  end: string;
  reason: string;
  source: BlockSource;
};

export type EventType = "wedding" | "corporate";
export type EventQuote = {
  id: string;
  type: EventType;
  name: string;
  email: string;
  phone: string;
  organisation?: string;
  date: string;
  guests: number;
  packageName: string;
  cateringTier: string;
  extras: string[];
  estimateUSD: number;
  notes?: string;
  status: "new" | "contacted" | "booked";
  createdAt: string;
};

export type TableReservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  seating: string;
  notes?: string;
  createdAt: string;
};

export type OtaChannel = "airbnb" | "booking.com";
export type OtaFeed = {
  id: string;
  channel: OtaChannel;
  cottageId: string;
  importUrl: string;
  status: "active" | "paused" | "error";
  lastSyncedAt?: string;
  importedBlocks: number;
};

export type ResortState = {
  version: 1;
  /** Current nightly base rate per cottage (USD), editable by staff. */
  rates: Record<string, number>;
  bookings: Booking[];
  blocked: BlockedRange[];
  eventQuotes: EventQuote[];
  tableReservations: TableReservation[];
  otaFeeds: OtaFeed[];
};

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

export const UGX_PER_USD = 3700;
export const VAT_RATE = 0.18;
export const HIGH_SEASON_MONTHS = [1, 6, 7, 8, 12];
export const HIGH_SEASON_UPLIFT = 0.2;
export const WEEKEND_UPLIFT = 0.1;
export const ADMIN_PIN = "2580";
export const WHATSAPP_NUMBER = "256772000123";
export const RESORT_PHONE = "+256 772 000 123";
export const RESORT_EMAIL = "stay@hakunamatatafuncity.ug";
export const RESORT_GPS = { lat: 0.2316, lng: 32.4581, label: "0.2316° N, 32.4581° E" };
export const STORAGE_KEY = "hmf-resort-v1";
export const CURRENCY_KEY = "hmf-currency";
/** Used before the browser tells us the real date (keeps prerender deterministic). */
export const FALLBACK_TODAY = "2026-10-28";

export const COTTAGES: Cottage[] = [
  {
    id: "nile-canopy",
    name: "Nile Canopy Cottage",
    tagline: "A treetop hideaway above the forest canopy",
    description:
      "Raised on timber stilts among old mvule trees, the Nile Canopy Cottage opens onto a wraparound deck where hornbills pass at eye level. Mornings start with Ugandan coffee and mist lifting off the valley.",
    guests: 2,
    beds: "1 king bed",
    sizeSqm: 48,
    baseRateUSD: 180,
    view: "Forest canopy",
    specs: ["2 guests", "1 king bed", "48 m²", "Wraparound deck", "Breakfast included"],
    amenities: [
      "Outdoor rain shower",
      "Private deck with hammock",
      "Fast Wi-Fi",
      "Solar hot water",
      "Mosquito-netted king bed",
      "Coffee & tea station",
      "Daily housekeeping",
      "Breakfast included",
    ],
    images: [IMG.treehouseCliff, IMG.roomCanopyView, IMG.roomJungle, IMG.hornbillLeaves],
  },
  {
    id: "savannah-stone",
    name: "Savannah Stone Villa",
    tagline: "Hand-laid stone, a private plunge pool, wide open sky",
    description:
      "Our most private retreat. Thick stone walls keep the villa cool through the afternoon, while the plunge pool and sun terrace look out over the savannah garden toward the evening sun.",
    guests: 4,
    beds: "2 queen beds",
    sizeSqm: 96,
    baseRateUSD: 320,
    view: "Savannah garden",
    specs: ["4 guests", "2 queen beds", "96 m²", "Private plunge pool", "Breakfast included"],
    amenities: [
      "Private plunge pool",
      "Sun terrace with loungers",
      "Two en-suite bathrooms",
      "Air conditioning",
      "Fast Wi-Fi",
      "Kitchenette",
      "Butler on call",
      "Breakfast included",
    ],
    images: [IMG.lodgeDeck, IMG.lodgeSuite, IMG.heroPool, IMG.acaciaSunset],
  },
  {
    id: "acacia-family",
    name: "Acacia Family Pavilion",
    tagline: "Room for the whole family under the acacias",
    description:
      "Two bedrooms around a shared lounge and a broad veranda that steps straight onto the lawn and the kids' fun park. Built for long weekends with grandparents, cousins and plenty of board games.",
    guests: 6,
    beds: "1 king, 2 twins, 1 sofa bed",
    sizeSqm: 120,
    baseRateUSD: 280,
    view: "Lawn & fun park",
    specs: ["6 guests", "1 king · 2 twins · sofa bed", "120 m²", "Steps from fun park", "Breakfast included"],
    amenities: [
      "Two bedrooms",
      "Family lounge",
      "Veranda with dining table",
      "Kids' fun park access",
      "Fast Wi-Fi",
      "Smart TV",
      "Baby cot on request",
      "Breakfast included",
    ],
    images: [IMG.lodgeLounge, IMG.roomCanopyBalcony, IMG.playground, IMG.roomCanopy],
  },
  {
    id: "sunset-horizon",
    name: "Sunset Horizon Loft",
    tagline: "A rooftop deck made for golden hour",
    description:
      "A double-height loft with floor-to-ceiling glass and a rooftop deck facing west. Couples come for the sunsets and stay for the stargazing, wrapped in blankets beside the fire bowl.",
    guests: 2,
    beds: "1 king bed",
    sizeSqm: 60,
    baseRateUSD: 220,
    view: "West-facing hills",
    specs: ["2 guests", "1 king bed", "60 m²", "Rooftop deck", "Breakfast included"],
    amenities: [
      "Rooftop sunset deck",
      "Fire bowl & blankets",
      "Freestanding bathtub",
      "Air conditioning",
      "Fast Wi-Fi",
      "Bluetooth speaker",
      "Minibar",
      "Breakfast included",
    ],
    images: [IMG.heroLodge, IMG.roomRomance, IMG.giraffePool, IMG.giraffeSunset],
  },
  {
    id: "forest-garden",
    name: "Forest Garden Banda",
    tagline: "A thatched banda in the heart of the botanical garden",
    description:
      "Inspired by the traditional Ugandan banda, this thatched cottage sits inside the botanical garden, surrounded by banana groves and birdsong. Simple, warm and wonderfully quiet.",
    guests: 3,
    beds: "1 queen, 1 single",
    sizeSqm: 40,
    baseRateUSD: 140,
    view: "Botanical garden",
    specs: ["3 guests", "1 queen · 1 single", "40 m²", "Garden veranda", "Breakfast included"],
    amenities: [
      "Thatched roof, naturally cool",
      "Garden veranda",
      "Hot shower",
      "Fast Wi-Fi",
      "Reading nook",
      "Coffee & tea station",
      "Daily housekeeping",
      "Breakfast included",
    ],
    images: [IMG.thatchedCottage, IMG.roomTimber, IMG.gardenPath, IMG.gardenHeliconia],
  },
];

export const ADDONS: Addon[] = [
  {
    id: "airport-transfer",
    name: "Entebbe airport transfer",
    description: "Private 4x4 pickup with chilled water and Wi-Fi. Return trip.",
    priceUSD: 90,
    unit: "stay",
  },
  {
    id: "campfire-bbq",
    name: "Campfire BBQ evening",
    description: "Open-fire grill of Nile tilapia, goat skewers and roasted matooke.",
    priceUSD: 28,
    unit: "guest",
  },
  {
    id: "nature-trek",
    name: "Guided nature trek",
    description: "Two-hour forest and wetland walk with a resident birding guide.",
    priceUSD: 18,
    unit: "guest",
  },
  {
    id: "veranda-breakfast",
    name: "Veranda breakfast upgrade",
    description: "Rolex, tropical fruit and fresh Ugandan coffee served at your cottage.",
    priceUSD: 15,
    unit: "night",
  },
  {
    id: "romance-setup",
    name: "Romance setup",
    description: "Petals, candles and sparkling wine waiting on arrival.",
    priceUSD: 60,
    unit: "stay",
  },
  {
    id: "late-checkout",
    name: "Late check-out (4 pm)",
    description: "Linger over lunch and leave when you're ready.",
    priceUSD: 40,
    unit: "stay",
  },
];

/* ------------------------------------------------------------------ */
/* Dates (UTC-based ISO strings to avoid timezone drift)               */
/* ------------------------------------------------------------------ */

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** Monday-first headers for calendar grids. */
export const CAL_WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const pad = (n: number) => String(n).padStart(2, "0");

export function parseISO(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function toISO(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** The visitor's local date. Call only in effects or event handlers, never during render. */
export function localTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Current timestamp. Call only in effects or event handlers, never during render. */
export function nowISO(): string {
  return new Date().toISOString();
}

export function addDays(iso: string, n: number): string {
  const d = parseISO(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
}

export function diffDays(fromISO: string, toISODate: string): number {
  return Math.round((parseISO(toISODate).getTime() - parseISO(fromISO).getTime()) / 86_400_000);
}

/** Every night of a stay (check-out day excluded). */
export function nightsBetween(checkIn: string, checkOut: string): string[] {
  const n = diffDays(checkIn, checkOut);
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(addDays(checkIn, i));
  return out;
}

export function weekdayOf(iso: string): number {
  return parseISO(iso).getUTCDay();
}

/** "Fri 30 Oct", or "30 Oct 2026" with { year: true, weekday: false }. */
export function formatDate(iso: string, opts: { weekday?: boolean; year?: boolean } = {}): string {
  const { weekday = true, year = false } = opts;
  const d = parseISO(iso);
  const parts = [
    weekday ? WEEKDAYS_SHORT[d.getUTCDay()] : null,
    String(d.getUTCDate()),
    MONTHS_SHORT[d.getUTCMonth()],
    year ? String(d.getUTCFullYear()) : null,
  ].filter(Boolean);
  return parts.join(" ");
}

/** "30 Oct – 2 Nov 2026" */
export function formatRange(checkIn: string, checkOut: string): string {
  return `${formatDate(checkIn, { weekday: false })} – ${formatDate(checkOut, { weekday: false, year: true })}`;
}

/** "28 Oct 2026, 14:05" from an ISO timestamp (UTC). */
export function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** Calendar grid for a month, Monday-first. null = padding cell. */
export function monthGrid(year: number, month0: number): (string | null)[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const daysInMonth = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${pad(month0 + 1)}-${pad(d)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ------------------------------------------------------------------ */
/* Money & pricing                                                     */
/* ------------------------------------------------------------------ */

function groupDigits(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function usdToUgx(usd: number): number {
  return Math.round((usd * UGX_PER_USD) / 1000) * 1000;
}

/** "$1,240" or "USh 4,588,000". */
export function formatMoney(usd: number, currency: Currency): string {
  const sign = usd < 0 ? "−" : "";
  const abs = Math.abs(usd);
  return currency === "USD" ? `${sign}$${groupDigits(abs)}` : `${sign}USh ${groupDigits(usdToUgx(abs))}`;
}

export function isHighSeason(iso: string): boolean {
  return HIGH_SEASON_MONTHS.includes(parseISO(iso).getUTCMonth() + 1);
}

export function isWeekendNight(iso: string): boolean {
  const d = weekdayOf(iso);
  return d === 5 || d === 6;
}

export function seasonLabel(iso: string): string {
  return isHighSeason(iso) ? "High season" : "Green season";
}

/** Nightly price for a given night after seasonal and weekend uplifts. */
export function nightlyRateUSD(baseUSD: number, iso: string): number {
  let r = baseUSD;
  if (isHighSeason(iso)) r *= 1 + HIGH_SEASON_UPLIFT;
  if (isWeekendNight(iso)) r *= 1 + WEEKEND_UPLIFT;
  return Math.round(r);
}

export type StayQuote = {
  nights: number;
  nightly: { date: string; rateUSD: number }[];
  lodgingUSD: number;
  addonLines: { addon: Addon; qty: number; totalUSD: number }[];
  addonsUSD: number;
  subtotalUSD: number;
  taxUSD: number;
  totalUSD: number;
};

export function addonQty(addon: Addon, nights: number, guests: number): number {
  if (addon.unit === "night") return nights;
  if (addon.unit === "guest") return guests;
  return 1;
}

export function quoteStay(args: {
  baseRateUSD: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  addonIds: string[];
}): StayQuote {
  const nights = nightsBetween(args.checkIn, args.checkOut);
  const nightly = nights.map((date) => ({ date, rateUSD: nightlyRateUSD(args.baseRateUSD, date) }));
  const lodgingUSD = nightly.reduce((s, n) => s + n.rateUSD, 0);
  const addonLines = ADDONS.filter((a) => args.addonIds.includes(a.id)).map((addon) => {
    const qty = addonQty(addon, nights.length, args.guests);
    return { addon, qty, totalUSD: addon.priceUSD * qty };
  });
  const addonsUSD = addonLines.reduce((s, l) => s + l.totalUSD, 0);
  const subtotalUSD = lodgingUSD + addonsUSD;
  const taxUSD = Math.round(subtotalUSD * VAT_RATE);
  return {
    nights: nights.length,
    nightly,
    lodgingUSD,
    addonLines,
    addonsUSD,
    subtotalUSD,
    taxUSD,
    totalUSD: subtotalUSD + taxUSD,
  };
}

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

export type NightStatus =
  | { kind: "booked"; booking: Booking }
  | { kind: "blocked"; block: BlockedRange }
  | null;

export function getNightStatus(state: ResortState, cottageId: string, iso: string): NightStatus {
  const booking = state.bookings.find(
    (b) => b.cottageId === cottageId && b.status !== "cancelled" && b.checkIn <= iso && iso < b.checkOut,
  );
  if (booking) return { kind: "booked", booking };
  const block = state.blocked.find((b) => b.cottageId === cottageId && b.start <= iso && iso < b.end);
  if (block) return { kind: "blocked", block };
  return null;
}

export function isRangeAvailable(
  state: ResortState,
  cottageId: string,
  checkIn: string,
  checkOut: string,
  ignoreBookingId?: string,
): boolean {
  if (diffDays(checkIn, checkOut) <= 0) return false;
  return nightsBetween(checkIn, checkOut).every((iso) => {
    const s = getNightStatus(state, cottageId, iso);
    if (!s) return true;
    return s.kind === "booked" && s.booking.id === ignoreBookingId;
  });
}

export function getCottage(id: string): Cottage | undefined {
  return COTTAGES.find((c) => c.id === id);
}

/* ------------------------------------------------------------------ */
/* IDs (random: call only in event handlers or effects)                */
/* ------------------------------------------------------------------ */

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function makeConfirmationCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `HMF-${s}`;
}

/* ------------------------------------------------------------------ */
/* OTA / iCal                                                          */
/* ------------------------------------------------------------------ */

export function icalExportUrl(cottageId: string): string {
  return `https://hakunamatatafuncity.ug/ical/${cottageId}.ics?key=hmf-${cottageId.length * 7919}`;
}

/** Builds an .ics calendar of booked and blocked nights for one cottage. */
export function buildICS(state: ResortState, cottageId: string): string {
  const fmt = (iso: string) => iso.replaceAll("-", "");
  const events: string[] = [];
  for (const b of state.bookings) {
    if (b.cottageId !== cottageId || b.status === "cancelled") continue;
    events.push(
      ["BEGIN:VEVENT", `UID:${b.id}@hakunamatatafuncity.ug`, `DTSTART;VALUE=DATE:${fmt(b.checkIn)}`, `DTEND;VALUE=DATE:${fmt(b.checkOut)}`, `SUMMARY:Reserved (${b.code})`, "END:VEVENT"].join("\r\n"),
    );
  }
  for (const k of state.blocked) {
    if (k.cottageId !== cottageId) continue;
    events.push(
      ["BEGIN:VEVENT", `UID:${k.id}@hakunamatatafuncity.ug`, `DTSTART;VALUE=DATE:${fmt(k.start)}`, `DTEND;VALUE=DATE:${fmt(k.end)}`, `SUMMARY:Blocked – ${k.reason}`, "END:VEVENT"].join("\r\n"),
    );
  }
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hakuna Matata FunCity//Booking Engine//EN", ...events, "END:VCALENDAR"].join("\r\n");
}

/* ------------------------------------------------------------------ */
/* Seed data & persistence                                             */
/* ------------------------------------------------------------------ */

type SeedBooking = [cottageId: string, startOffset: number, nights: number, guests: number, name: string, phone: string, method: PaymentMethod, source: BookingSource, addons: string[], code: string];

const SEED_BOOKINGS: SeedBooking[] = [
  ["nile-canopy", -2, 3, 2, "Sarah Namukasa", "+256 772 418 220", "mtn", "website", ["veranda-breakfast"], "HMF-7K2Q9A"],
  ["nile-canopy", 4, 2, 2, "Hannah Becker", "+49 151 2233 4410", "card", "airbnb", [], "HMF-B8M4TX"],
  ["nile-canopy", 15, 4, 2, "Peter Ssempijja", "+256 701 556 812", "airtel", "website", ["romance-setup", "nature-trek"], "HMF-PZ6W3R"],
  ["savannah-stone", 1, 3, 4, "David Okello", "+256 782 900 114", "card", "website", ["airport-transfer", "campfire-bbq"], "HMF-Q4N7HD"],
  ["savannah-stone", 9, 5, 3, "Olivia Martin", "+44 7700 900 412", "card", "booking.com", ["airport-transfer"], "HMF-J3V8LC"],
  ["acacia-family", -1, 2, 6, "Grace Achieng", "+256 757 331 090", "mtn", "walk-in", ["campfire-bbq"], "HMF-T9R2KE"],
  ["acacia-family", 6, 3, 5, "James Mugisha", "+256 774 128 665", "airtel", "website", ["nature-trek"], "HMF-W5H6ZP"],
  ["acacia-family", 20, 2, 6, "Aisha Nakato", "+256 703 448 911", "pay-on-arrival", "phone", [], "HMF-M2D9QS"],
  ["sunset-horizon", 2, 2, 2, "Michael Otim", "+256 789 602 337", "mtn", "website", ["romance-setup"], "HMF-C7X4NB"],
  ["sunset-horizon", 12, 3, 2, "Lucy Wanjiru", "+254 712 448 309", "card", "airbnb", ["airport-transfer"], "HMF-H8K3FU"],
  ["forest-garden", 0, 2, 2, "Brian Kato", "+256 704 219 554", "cash", "walk-in", [], "HMF-R6P2YG"],
  ["forest-garden", 8, 3, 3, "Esther Nabirye", "+256 776 330 812", "airtel", "website", ["nature-trek", "veranda-breakfast"], "HMF-L4T7VA"],
  ["savannah-stone", -12, 3, 2, "Daniel Byaruhanga", "+256 772 980 441", "card", "website", [], "HMF-S3G8MK"],
];

export function buildSeedState(today: string): ResortState {
  const rates: Record<string, number> = {};
  for (const c of COTTAGES) rates[c.id] = c.baseRateUSD;

  const bookings: Booking[] = SEED_BOOKINGS.map(
    ([cottageId, startOffset, nights, guests, guestName, phone, paymentMethod, source, addons, code], i) => {
      const checkIn = addDays(today, startOffset);
      const checkOut = addDays(checkIn, nights);
      const q = quoteStay({ baseRateUSD: rates[cottageId], checkIn, checkOut, guests, addonIds: addons });
      const status: BookingStatus =
        checkOut <= today ? "completed" : checkIn <= today ? "checked-in" : i % 5 === 3 ? "pending" : "confirmed";
      return {
        id: `seed_${i + 1}`,
        code,
        cottageId,
        checkIn,
        checkOut,
        guests,
        guestName,
        email: `${guestName.split(" ")[0].toLowerCase()}@example.com`,
        phone,
        addons,
        totalUSD: q.totalUSD,
        paymentMethod,
        status,
        source,
        createdAt: `${addDays(today, Math.min(startOffset, 0) - 10)}T09:30:00.000Z`,
        notifyEmail: true,
        notifySms: true,
      };
    },
  );

  const blocked: BlockedRange[] = [
    { id: "blk_1", cottageId: "sunset-horizon", start: addDays(today, 6), end: addDays(today, 9), reason: "Deck re-varnishing", source: "maintenance" },
    { id: "blk_2", cottageId: "forest-garden", start: addDays(today, 17), end: addDays(today, 21), reason: "Thatch renewal", source: "maintenance" },
    { id: "blk_3", cottageId: "savannah-stone", start: addDays(today, 24), end: addDays(today, 27), reason: "Private buyout – Kampala family reunion", source: "private-buyout" },
    { id: "blk_4", cottageId: "nile-canopy", start: addDays(today, 27), end: addDays(today, 29), reason: "Airbnb reservation (synced)", source: "airbnb" },
  ];

  const otaFeeds: OtaFeed[] = [
    { id: "ota_1", channel: "airbnb", cottageId: "nile-canopy", importUrl: "https://www.airbnb.com/calendar/ical/48213377.ics?s=9f2c1", status: "active", lastSyncedAt: `${today}T06:00:00.000Z`, importedBlocks: 1 },
    { id: "ota_2", channel: "booking.com", cottageId: "savannah-stone", importUrl: "https://admin.booking.com/hotel/hoteladmin/ical.html?t=7c1e-41a9", status: "active", lastSyncedAt: `${today}T06:00:00.000Z`, importedBlocks: 0 },
  ];

  const eventQuotes: EventQuote[] = [
    {
      id: "evq_1",
      type: "wedding",
      name: "Ruth & Samuel Tumusiime",
      email: "ruth.samuel@example.com",
      phone: "+256 772 115 803",
      date: addDays(today, 64),
      guests: 180,
      packageName: "Garden Ceremony & Reception",
      cateringTier: "Signature Ugandan Feast",
      extras: ["Décor & florals", "Live band"],
      estimateUSD: 14200,
      status: "new",
      createdAt: `${addDays(today, -2)}T11:12:00.000Z`,
    },
    {
      id: "evq_2",
      type: "corporate",
      name: "Patricia Auma",
      organisation: "Kampala Fintech Ltd",
      email: "patricia@example.com",
      phone: "+256 704 662 190",
      date: addDays(today, 21),
      guests: 45,
      packageName: "Two-Day Strategy Retreat",
      cateringTier: "Full Board",
      extras: ["Team-building facilitator", "Projector & PA"],
      estimateUSD: 9850,
      status: "contacted",
      createdAt: `${addDays(today, -5)}T08:40:00.000Z`,
    },
  ];

  return { version: 1, rates, bookings, blocked, eventQuotes, tableReservations: [], otaFeeds };
}

/** Reads saved state from localStorage, or seeds it. Browser only. */
export function loadState(today: string): ResortState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ResortState;
      if (parsed && parsed.version === 1 && Array.isArray(parsed.bookings)) return parsed;
    }
  } catch {
    /* storage unavailable or corrupt: fall through to seed */
  }
  const seeded = buildSeedState(today);
  saveState(seeded);
  return seeded;
}

export function saveState(state: ResortState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy mode errors */
  }
}

export function clearSavedState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** wa.me link with a pre-filled message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
