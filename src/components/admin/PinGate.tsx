"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Overlay";
import { ADMIN_PIN } from "@/data/resortStorage";
import { Icon } from "./adminUi";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"] as const;

export function PinGate({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const press = useCallback(
    (digit: string) => {
      if (busy.current || pin.length >= PIN_LENGTH) return;
      setError(false);
      const next = pin + digit;
      setPin(next);
      if (next.length < PIN_LENGTH) return;
      if (next === ADMIN_PIN) {
        onUnlock();
        return;
      }
      busy.current = true;
      setError(true);
      dotsRef.current?.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-9px)" },
          { transform: "translateX(8px)" },
          { transform: "translateX(-6px)" },
          { transform: "translateX(4px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 380, easing: "ease-in-out" },
      );
      window.setTimeout(() => {
        setPin("");
        busy.current = false;
      }, 450);
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
        press(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, back]);

  return (
    <Modal open onClose={onClose} size="sm" eyebrow="Hakuna Matata FunCity" title="Staff portal">
      <div className="flex flex-col items-center pb-1 text-center">
        <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest-soft text-forest">
          <Icon name="lock" className="h-5 w-5" />
        </span>
        <p className="text-sm text-ink-soft">Enter your 4-digit staff PIN to manage bookings, rates and calendars.</p>

        <div ref={dotsRef} className="my-6 flex items-center gap-4" aria-label={`${pin.length} of ${PIN_LENGTH} digits entered`}>
          {Array.from({ length: PIN_LENGTH }, (_, i) => {
            const filled = i < pin.length;
            return (
              <span
                key={i}
                className={`h-3.5 w-3.5 rounded-full border transition-colors duration-150 ${
                  error
                    ? "border-danger bg-danger"
                    : filled
                      ? "border-forest bg-forest"
                      : "border-hairline-strong bg-transparent"
                }`}
              />
            );
          })}
        </div>

        <p className={`-mt-2 mb-4 h-5 text-sm font-medium ${error ? "text-danger" : "text-transparent"}`} aria-live="polite">
          {error ? "Incorrect PIN. Try again." : " "}
        </p>

        <div className="grid w-full max-w-[17rem] grid-cols-3 gap-2.5">
          {KEYS.map((k) => {
            if (k === "clear") {
              return (
                <button key={k} type="button" onClick={clear} className="h-14 rounded-xl text-sm font-semibold text-ink-soft transition hover:bg-stone">
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
                  aria-label="Delete last digit"
                  className="flex h-14 items-center justify-center rounded-xl text-ink-soft transition hover:bg-stone"
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
                className="num h-14 rounded-xl bg-stone text-xl text-ink transition hover:bg-stone-deep active:scale-[0.97]"
              >
                {k}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-ink-mute">
          Demo PIN: <span className="num font-semibold text-ink-soft">{ADMIN_PIN}</span>
        </p>
      </div>
    </Modal>
  );
}
