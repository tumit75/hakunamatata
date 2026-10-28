"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  COTTAGES,
  CURRENCY_KEY,
  FALLBACK_TODAY,
  addDays,
  buildSeedState,
  clearSavedState,
  formatMoney,
  getNightStatus,
  isRangeAvailable as rangeAvailable,
  loadState,
  localTodayISO,
  makeConfirmationCode,
  makeId,
  nightlyRateUSD,
  nowISO,
  saveState,
  type BlockedRange,
  type Booking,
  type BookingStatus,
  type Cottage,
  type Currency,
  type EventQuote,
  type NightStatus,
  type ResortState,
  type TableReservation,
} from "@/data/resortStorage";

export type ConciergeTopic = "cottage" | "wedding" | "corporate" | "shuttle" | "general";

export type BookingRequest = {
  cottageId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

export type SearchState = {
  checkIn: string;
  checkOut: string;
  guests: number;
  /** "any" or a cottage id */
  cottageId: string;
};

export type NewBooking = Omit<Booking, "id" | "code" | "createdAt"> & { code?: string };

type ResortContextValue = {
  /** True once localStorage state and the real date have loaded in the browser. */
  ready: boolean;
  /** Visitor's local date (ISO). FALLBACK_TODAY until ready. */
  today: string;

  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Formats a USD amount in the active currency. */
  money: (usd: number) => string;

  state: ResortState;
  cottages: Cottage[];
  /** Current base nightly rate (USD) for a cottage, as set by staff. */
  rateFor: (cottageId: string) => number;
  /** Price of one specific night incl. seasonal/weekend uplift. */
  nightly: (cottageId: string, iso: string) => number;
  nightStatus: (cottageId: string, iso: string) => NightStatus;
  isRangeAvailable: (cottageId: string, checkIn: string, checkOut: string, ignoreBookingId?: string) => boolean;

  addBooking: (b: NewBooking) => Booking;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  setRate: (cottageId: string, usd: number) => void;
  addBlock: (b: Omit<BlockedRange, "id">) => BlockedRange;
  removeBlock: (id: string) => void;
  addEventQuote: (q: Omit<EventQuote, "id" | "createdAt" | "status">) => EventQuote;
  addTableReservation: (r: Omit<TableReservation, "id" | "createdAt">) => TableReservation;
  /** Escape hatch for anything else (OTA feeds, quote status...). */
  update: (fn: (s: ResortState) => ResortState) => void;
  resetDemo: () => void;

  search: SearchState;
  setSearch: (patch: Partial<SearchState>) => void;

  booking: BookingRequest & { open: boolean };
  openBooking: (req?: BookingRequest) => void;
  closeBooking: () => void;

  detailCottageId: string | null;
  openCottage: (id: string) => void;
  closeCottage: () => void;

  adminOpen: boolean;
  openAdmin: () => void;
  closeAdmin: () => void;

  concierge: { open: boolean; topic: ConciergeTopic };
  openConcierge: (topic?: ConciergeTopic) => void;
  closeConcierge: () => void;
};

const ResortContext = createContext<ResortContextValue | null>(null);

export function useResort(): ResortContextValue {
  const ctx = useContext(ResortContext);
  if (!ctx) throw new Error("useResort must be used inside <ResortProvider>");
  return ctx;
}

export function ResortProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(FALLBACK_TODAY);
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [state, setState] = useState<ResortState>(() => buildSeedState(FALLBACK_TODAY));
  const [search, setSearchState] = useState<SearchState>({
    checkIn: addDays(FALLBACK_TODAY, 7),
    checkOut: addDays(FALLBACK_TODAY, 9),
    guests: 2,
    cottageId: "any",
  });
  const [booking, setBooking] = useState<BookingRequest & { open: boolean }>({ open: false });
  const [detailCottageId, setDetailCottageId] = useState<string | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [concierge, setConcierge] = useState<{ open: boolean; topic: ConciergeTopic }>({
    open: false,
    topic: "general",
  });
  const loaded = useRef(false);

  // Load real date + saved data in the browser only.
  useEffect(() => {
    const t = localTodayISO();
    const saved = loadState(t);
    let cur: Currency = "USD";
    try {
      const c = window.localStorage.getItem(CURRENCY_KEY);
      if (c === "UGX" || c === "USD") cur = c;
    } catch {
      /* ignore */
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setToday(t);
    setState(saved);
    setCurrencyState(cur);
    setSearchState((s) => ({ ...s, checkIn: addDays(t, 7), checkOut: addDays(t, 9) }));
    setReady(true);
  }, []);

  useEffect(() => {
    if (loaded.current) saveState(state);
  }, [state]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(CURRENCY_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const money = useCallback((usd: number) => formatMoney(usd, currency), [currency]);

  const rateFor = useCallback(
    (cottageId: string) => state.rates[cottageId] ?? COTTAGES.find((c) => c.id === cottageId)?.baseRateUSD ?? 0,
    [state.rates],
  );
  const nightly = useCallback((cottageId: string, iso: string) => nightlyRateUSD(rateFor(cottageId), iso), [rateFor]);
  const nightStatus = useCallback((cottageId: string, iso: string) => getNightStatus(state, cottageId, iso), [state]);
  const isRangeAvailable = useCallback(
    (cottageId: string, checkIn: string, checkOut: string, ignoreBookingId?: string) =>
      rangeAvailable(state, cottageId, checkIn, checkOut, ignoreBookingId),
    [state],
  );

  const update = useCallback((fn: (s: ResortState) => ResortState) => setState(fn), []);

  const addBooking = useCallback((b: NewBooking): Booking => {
    const created: Booking = { ...b, id: makeId("bk"), code: b.code ?? makeConfirmationCode(), createdAt: nowISO() };
    setState((s) => ({ ...s, bookings: [created, ...s.bookings] }));
    return created;
  }, []);

  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  }, []);

  const setBookingStatus = useCallback(
    (id: string, status: BookingStatus) => updateBooking(id, { status }),
    [updateBooking],
  );

  const setRate = useCallback((cottageId: string, usd: number) => {
    setState((s) => ({ ...s, rates: { ...s.rates, [cottageId]: Math.max(0, Math.round(usd)) } }));
  }, []);

  const addBlock = useCallback((b: Omit<BlockedRange, "id">): BlockedRange => {
    const created = { ...b, id: makeId("blk") };
    setState((s) => ({ ...s, blocked: [...s.blocked, created] }));
    return created;
  }, []);

  const removeBlock = useCallback((id: string) => {
    setState((s) => ({ ...s, blocked: s.blocked.filter((b) => b.id !== id) }));
  }, []);

  const addEventQuote = useCallback((q: Omit<EventQuote, "id" | "createdAt" | "status">): EventQuote => {
    const created: EventQuote = { ...q, id: makeId("evq"), createdAt: nowISO(), status: "new" };
    setState((s) => ({ ...s, eventQuotes: [created, ...s.eventQuotes] }));
    return created;
  }, []);

  const addTableReservation = useCallback((r: Omit<TableReservation, "id" | "createdAt">): TableReservation => {
    const created: TableReservation = { ...r, id: makeId("tbl"), createdAt: nowISO() };
    setState((s) => ({ ...s, tableReservations: [created, ...s.tableReservations] }));
    return created;
  }, []);

  const resetDemo = useCallback(() => {
    clearSavedState();
    setState(buildSeedState(today));
  }, [today]);

  const setSearch = useCallback((patch: Partial<SearchState>) => setSearchState((s) => ({ ...s, ...patch })), []);

  const openBooking = useCallback((req: BookingRequest = {}) => {
    setDetailCottageId(null);
    setBooking({ ...req, open: true });
  }, []);
  const closeBooking = useCallback(() => setBooking((b) => ({ ...b, open: false })), []);

  const openCottage = useCallback((id: string) => setDetailCottageId(id), []);
  const closeCottage = useCallback(() => setDetailCottageId(null), []);
  const openAdmin = useCallback(() => setAdminOpen(true), []);
  const closeAdmin = useCallback(() => setAdminOpen(false), []);
  const openConcierge = useCallback((topic: ConciergeTopic = "general") => setConcierge({ open: true, topic }), []);
  const closeConcierge = useCallback(() => setConcierge((c) => ({ ...c, open: false })), []);

  const value = useMemo<ResortContextValue>(
    () => ({
      ready,
      today,
      currency,
      setCurrency,
      money,
      state,
      cottages: COTTAGES,
      rateFor,
      nightly,
      nightStatus,
      isRangeAvailable,
      addBooking,
      updateBooking,
      setBookingStatus,
      setRate,
      addBlock,
      removeBlock,
      addEventQuote,
      addTableReservation,
      update,
      resetDemo,
      search,
      setSearch,
      booking,
      openBooking,
      closeBooking,
      detailCottageId,
      openCottage,
      closeCottage,
      adminOpen,
      openAdmin,
      closeAdmin,
      concierge,
      openConcierge,
      closeConcierge,
    }),
    [
      ready, today, currency, setCurrency, money, state, rateFor, nightly, nightStatus, isRangeAvailable,
      addBooking, updateBooking, setBookingStatus, setRate, addBlock, removeBlock, addEventQuote,
      addTableReservation, update, resetDemo, search, setSearch, booking, openBooking, closeBooking,
      detailCottageId, openCottage, closeCottage, adminOpen, openAdmin, closeAdmin, concierge,
      openConcierge, closeConcierge,
    ],
  );

  return <ResortContext.Provider value={value}>{children}</ResortContext.Provider>;
}
