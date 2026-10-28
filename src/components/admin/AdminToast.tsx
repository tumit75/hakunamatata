"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./adminUi";

type Tone = "ok" | "warn" | "info";
type Toast = { id: number; tone: Tone; title: string; detail?: string; leaving: boolean };

type ToastFn = (title: string, opts?: { tone?: Tone; detail?: string }) => void;

const ToastContext = createContext<ToastFn | null>(null);

/** Shows a short confirmation in the staff console. */
export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  return ctx ?? (() => {});
}

const LIFETIME = 3400;
const EXIT = 180;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number[]>());

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    const done = window.setTimeout(() => {
      setToasts((all) => all.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, EXIT);
    timers.current.set(id, [...(timers.current.get(id) ?? []), done]);
  }, []);

  const push = useCallback<ToastFn>(
    (title, opts = {}) => {
      const id = nextId.current++;
      setToasts((all) => [...all.slice(-3), { id, tone: opts.tone ?? "ok", title, detail: opts.detail, leaving: false }]);
      const t = window.setTimeout(() => dismiss(id), LIFETIME);
      timers.current.set(id, [t]);
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      for (const ids of map.values()) ids.forEach((t) => window.clearTimeout(t));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-3 sm:items-end sm:p-5"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-canvas px-4 py-3 shadow-[0_18px_40px_-18px_rgba(31,61,43,0.45)] transition-all duration-150 ${
              t.leaving ? "translate-y-2 opacity-0" : "animate-rise-in"
            } ${t.tone === "warn" ? "border-ember/30" : "border-hairline-strong"}`}
          >
            <span
              className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                t.tone === "warn" ? "bg-ember-soft text-ember-deep" : t.tone === "info" ? "bg-stone text-ink-soft" : "bg-forest-soft text-forest"
              }`}
            >
              <Icon name={t.tone === "warn" ? "alert" : t.tone === "info" ? "sync" : "check"} className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{t.title}</p>
              {t.detail && <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{t.detail}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="-mr-1 -mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-mute transition hover:bg-stone hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
