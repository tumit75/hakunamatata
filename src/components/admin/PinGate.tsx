"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Overlay";
import { ADMIN_PIN } from "@/data/resortStorage";
import { Icon } from "./adminUi";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"] as const;
type Key = (typeof KEYS)[number];

export function PinGate({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [pressed, setPressed] = useState<Key | null>(null);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const flash = useCallback((k: Key) => {
    setPressed(k);
    timers.current.push(window.setTimeout(() => setPressed((p) => (p === k ? null : p)), 130));
  }, []);

  const press = useCallback(
    (digit: string) => {
      if (busy.current || pin.length >= PIN_LENGTH) return;
      setError(false);
      const next = pin + digit;
      setPin(next);
      if (next.length < PIN_LENGTH) return;
      busy.current = true;
      if (next === ADMIN_PIN) {
        setSuccess(true);
        timers.current.push(window.setTimeout(onUnlock, 650));
        return;
      }
      setError(true);
      setShakeKey((k) => k + 1);
      timers.current.push(
        window.setTimeout(() => {
          setPin("");
          busy.current = false;
        }, 520),
      );
    },
    [pin, onUnlock],
  );

  const back = useCallback(() => {
    if (busy.current) return;
    setError(false);
    setPin((p) => p.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    if (busy.current) return;
    setError(false);
    setPin("");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        flash(e.key as Key);
        press(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        flash("back");
        back();
      } else if (e.key === "Delete") {
        e.preventDefault();
        flash("clear");
        clear();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, back, clear, flash]);

  const keyBase =
    "relative h-14 rounded-2xl transition-[transform,background-color,color] duration-100 ease-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember active:scale-[0.94]";

  return (
    <Modal open onClose={onClose} size="sm" eyebrow="Hakuna Matata FunCity" title="Staff portal">
      <div className="flex flex-col items-center pb-1 text-center">
        <span
          key={success ? "open" : "locked"}
          className={`mb-3 inline-flex h-12 w-12 animate-pop-in items-center justify-center rounded-full transition-colors duration-200 ${
            success ? "bg-forest text-white" : error ? "bg-ember-soft text-ember-deep" : "bg-forest-soft text-forest"
          }`}
        >
          <Icon name={success ? "check" : error ? "lock" : pin.length > 0 ? "unlock" : "lock"} className="h-5 w-5" />
        </span>
        <p className="max-w-[18rem] text-sm text-ink-soft">
          {success ? "Welcome back. Opening the staff console…" : "Enter your 4-digit staff PIN to manage bookings, rates and calendars."}
        </p>

        <div
          key={shakeKey}
          className={`my-6 flex items-center gap-4 ${shakeKey > 0 ? "shake" : ""}`}
          aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}
          role="img"
        >
          {Array.from({ length: PIN_LENGTH }, (_, i) => {
            const filled = i < pin.length;
            const color = success ? "bg-forest" : error ? "bg-danger" : "bg-forest";
            const ring = success ? "border-forest" : error ? "border-danger" : filled ? "border-forest" : "border-hairline-strong";
            return (
              <span key={i} className={`relative h-4 w-4 rounded-full border-[1.5px] transition-colors duration-150 ${ring}`}>
                <span
                  className={`absolute inset-[-1.5px] rounded-full transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${color} ${
                    filled || success ? "scale-100" : "scale-0"
                  }`}
                  style={{ transitionDelay: success ? `${i * 60}ms` : undefined }}
                />
              </span>
            );
          })}
        </div>

        <p
          className={`-mt-2 mb-4 h-5 text-sm font-medium transition-colors ${error ? "text-danger" : success ? "text-forest" : "text-transparent"}`}
          aria-live="polite"
        >
          {error ? "Incorrect PIN. Try again." : success ? "Unlocked" : " "}
        </p>

        <div className="grid w-full max-w-[17.5rem] grid-cols-3 gap-2.5">
          {KEYS.map((k) => {
            const isPressed = pressed === k;
            if (k === "clear") {
              return (
                <button
                  key={k}
                  type="button"
                  onClick={clear}
                  disabled={success}
                  className={`${keyBase} text-sm font-semibold ${isPressed ? "scale-[0.94] bg-stone text-ink" : "text-ink-soft hover:bg-stone"}`}
                >
                  Clear
                </button>
              );
            }
            if (k === "back") {
              return (
                <button
                  key={k}
                  type="button"
                  onClick={back}
                  disabled={success}
                  aria-label="Delete last digit"
                  className={`${keyBase} flex items-center justify-center ${isPressed ? "scale-[0.94] bg-stone text-ink" : "text-ink-soft hover:bg-stone"}`}
                >
                  <Icon name="backspace" className="h-5 w-5" />
                </button>
              );
            }
            return (
              <button
                key={k}
                type="button"
                onClick={() => press(k)}
                disabled={success}
                className={`${keyBase} num text-xl ${
                  isPressed ? "scale-[0.94] bg-forest text-white" : "bg-stone text-ink hover:bg-stone-deep active:bg-forest active:text-white"
                }`}
              >
                {k}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-ink-mute">
          Demo PIN: <span className="num font-semibold text-ink-soft">{ADMIN_PIN}</span>
          <span className="mx-1.5 text-ink-mute/60" aria-hidden>
            ·
          </span>
          Keyboard works too
        </p>
      </div>
    </Modal>
  );
}
