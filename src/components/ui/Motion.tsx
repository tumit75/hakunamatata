"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type TouchEvent,
} from "react";
import { Photo } from "@/components/ui/Photo";

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** True once the element has scrolled into view (fires once by default). */
export function useInView<T extends Element>(options: { once?: boolean; rootMargin?: string; threshold?: number } = {}) {
  const { once = true, rootMargin = "0px 0px -8% 0px", threshold = 0.12 } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView };
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** Window scroll position, throttled to animation frames. */
export function useScrollY(): number {
  const [y, setY] = useState(0);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setY(window.scrollY));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return y;
}

/** Id of the section currently under the header (for nav highlighting). */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");
  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, r] of visible) {
          if (r > bestRatio) {
            best = id;
            bestRatio = r;
          }
        }
        setActive(best);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.01, 0.25, 0.5, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);
  return active;
}

/* ------------------------------------------------------------------ */
/* Reveal on scroll                                                    */
/* ------------------------------------------------------------------ */

export type RevealVariant = "up" | "fade" | "left" | "right" | "scale" | "blur";

/**
 * Fades/slides its children in when scrolled into view.
 * Use `delay` (ms) to stagger siblings: delay={i * 80}.
 */
export function Reveal({
  children,
  as,
  variant = "up",
  delay = 0,
  className = "",
  style,
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  const Tag = (as ?? "div") as ElementType;
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal={variant}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}

/** Splits a line of text into words that rise in one after another. */
export function SplitWords({
  text,
  className = "",
  wordClassName = "",
  baseDelay = 0,
  step = 70,
  start = true,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  baseDelay?: number;
  step?: number;
  /** Set false to hold the animation until something is ready. */
  start?: boolean;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <span
            className={`word-rise inline-block ${start ? "is-in" : ""} ${wordClassName}`}
            style={{ animationDelay: `${baseDelay + i * step}ms` }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Count up                                                            */
/* ------------------------------------------------------------------ */

/** Animates a number from 0 when scrolled into view. */
export function CountUp({
  to,
  duration = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: {
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const startAt = performance.now();
    const tick = (t: number) => {
      const p = reduced ? 1 : Math.min(1, (t - startAt) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(to * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration]);

  const shown = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
  return (
    <span ref={ref} className={`num ${className}`}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Parallax                                                            */
/* ------------------------------------------------------------------ */

/** Moves its child slower than the page while it's on screen. speed 0.15 = subtle. */
export function Parallax({
  children,
  speed = 0.15,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      const rect = el.parentElement?.getBoundingClientRect() ?? el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);
  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee                                                             */
/* ------------------------------------------------------------------ */

/** Endless horizontal ticker. Pauses on hover. Content is duplicated for a seamless loop. */
export function Marquee({
  children,
  speed = 40,
  className = "",
}: {
  children: ReactNode;
  /** seconds per loop */
  speed?: number;
  className?: string;
}) {
  return (
    <div className={`marquee group relative flex overflow-hidden ${className}`}>
      <div className="marquee-track flex shrink-0 items-center" style={{ animationDuration: `${speed}s` }}>
        {children}
      </div>
      <div className="marquee-track flex shrink-0 items-center" style={{ animationDuration: `${speed}s` }} aria-hidden>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Image carousel (swipe, arrows, dots)                                */
/* ------------------------------------------------------------------ */

export function ImageCarousel({
  images,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  rounded = "",
  onOpen,
  priority = false,
  showArrows = "hover",
}: {
  images: readonly string[];
  alt: string;
  /** Set the size here, e.g. "aspect-[4/3]". */
  className?: string;
  sizes?: string;
  rounded?: string;
  /** Called with the index when the image itself is clicked (e.g. open a lightbox). */
  onOpen?: (index: number) => void;
  priority?: boolean;
  showArrows?: "hover" | "always" | "never";
}) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + count) % count), [count]);

  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const arrowVis =
    showArrows === "always" ? "opacity-100" : showArrows === "never" ? "hidden" : "opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100";

  return (
    <div
      className={`group/carousel relative overflow-hidden bg-stone ${rounded} ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="absolute inset-0 flex transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            tabIndex={i === index ? 0 : -1}
            aria-label={onOpen ? `Open photo ${i + 1} of ${count}` : `${alt}, photo ${i + 1}`}
            onClick={() => onOpen?.(i)}
            className={`relative h-full w-full shrink-0 ${onOpen ? "cursor-zoom-in" : "cursor-default"}`}
          >
            <Photo
              src={src}
              alt={`${alt}, photo ${i + 1}`}
              className="absolute inset-0"
              imgClassName="transition-transform duration-700 group-hover/carousel:scale-[1.03]"
              sizes={sizes}
              priority={priority && i === 0}
            />
          </button>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className={`absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur transition hover:bg-white ${arrowVis}`}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className={`absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur transition hover:bg-white ${arrowVis}`}
          >
            <Chevron dir="right" />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full bg-white shadow transition-all duration-300 ${i === index ? "w-5 opacity-100" : "w-1.5 opacity-60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Lightbox                                                            */
/* ------------------------------------------------------------------ */

/** Full-screen photo viewer with arrows, keyboard and swipe. Render it always; it shows when index !== null. */
export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
  captions,
}: {
  images: readonly string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
  captions?: readonly string[];
}) {
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const count = images.length;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(((index ?? 0) + 1) % count);
      if (e.key === "ArrowLeft") onIndex(((index ?? 0) - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, index, count, onClose, onIndex]);

  if (!open || index === null) return null;
  const caption = captions?.[index];

  return (
    <div
      className="fixed inset-0 z-[70] flex animate-fade-in flex-col bg-black/92"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) onIndex(((index + (dx < 0 ? 1 : -1)) % count + count) % count);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white/80 sm:px-6">
        <span className="num text-sm">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="relative flex-1" onClick={onClose}>
        <div key={index} className="absolute inset-4 animate-pop-in sm:inset-10" onClick={(e) => e.stopPropagation()}>
          <Photo src={images[index]} alt={caption ?? `Photo ${index + 1}`} className="absolute inset-0 bg-transparent" imgClassName="!object-contain" sizes="100vw" />
        </div>
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndex((index - 1 + count) % count);
              }}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-5"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onIndex((index + 1) % count);
              }}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5"
            >
              <Chevron dir="right" />
            </button>
          </>
        )}
      </div>
      <div className="px-4 pb-5 pt-3 text-center text-sm text-white/80 sm:px-6">{caption ?? " "}</div>
      <div className="hidden justify-center gap-2 pb-5 sm:flex">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => onIndex(i)}
            aria-label={`Show photo ${i + 1}`}
            className={`relative h-12 w-16 overflow-hidden rounded-md transition ${i === index ? "ring-2 ring-white" : "opacity-50 hover:opacity-90"}`}
          >
            <Photo src={src} alt="" className="absolute inset-0" sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}
