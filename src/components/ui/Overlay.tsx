"use client";

import { useEffect, type ReactNode } from "react";

let lockCount = 0;

function useOverlayBehaviour(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    lockCount += 1;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) document.body.style.overflow = "";
    };
  }, [open, onClose]);
}

export function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-stone hover:text-ink"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
      </svg>
    </button>
  );
}

const MODAL_SIZES = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-6xl",
} as const;

/** Centered dialog. On phones it rises from the bottom. z-50. */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof MODAL_SIZES;
}) {
  useOverlayBehaviour(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative flex max-h-[92dvh] w-full ${MODAL_SIZES[size]} animate-rise-in flex-col overflow-hidden rounded-t-2xl bg-canvas shadow-2xl sm:animate-pop-in sm:rounded-2xl`}
      >
        {(title || eyebrow) && (
          <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
              {title && <h2 className="display text-2xl text-ink">{title}</h2>}
            </div>
            <CloseButton onClick={onClose} />
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="border-t border-hairline bg-linen px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

const DRAWER_SIZES = {
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
} as const;

/** Right-hand side panel, full screen on phones. z-50. */
export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = "lg",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof DRAWER_SIZES;
}) {
  useOverlayBehaviour(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative flex h-dvh w-full ${DRAWER_SIZES[size]} animate-slide-in flex-col bg-canvas shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-6">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
            {title && <h2 className="display text-2xl text-ink">{title}</h2>}
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="border-t border-hairline bg-linen px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

/** Quiet specs separated by middots, no badges. */
export function Specs({ items, className = "" }: { items: ReactNode[]; className?: string }) {
  return (
    <p className={`text-sm text-ink-mute ${className}`}>
      {items.map((it, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5 text-ink-mute/60" aria-hidden>·</span>}
          {it}
        </span>
      ))}
    </p>
  );
}

/** Segmented control used for tabs (currency, event type, admin views). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  className = "",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div className={`inline-flex rounded-[10px] border border-hairline-strong bg-linen p-0.5 ${className}`} role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`rounded-[8px] font-semibold transition ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} ${
              active ? "bg-forest text-white shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
