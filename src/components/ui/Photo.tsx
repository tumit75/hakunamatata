"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Stock photo with a botanical fallback if the image fails (no broken images).
 * The wrapper sets the size: pass e.g. "aspect-[4/3]" or "h-72", or "absolute inset-0" to cover a parent.
 */
export function Photo({
  src,
  alt,
  className = "",
  imgClassName = "",
  sizes = "100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const positioned = /(^|\s)(absolute|fixed)(\s|$)/.test(className);

  return (
    <div className={`${positioned ? "" : "relative"} overflow-hidden bg-stone ${className}`}>
      {failed ? (
        <BotanicalFallback label={alt} />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={`object-cover ${imgClassName}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function BotanicalFallback({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest-soft via-stone to-ember-soft"
    >
      <svg viewBox="0 0 64 64" className="h-14 w-14 text-forest/40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M32 58V28" />
        <path d="M32 40c-10 0-17-7-17-17 10 0 17 7 17 17Z" />
        <path d="M32 32c0-10 7-18 17-18 0 10-7 18-17 18Z" />
      </svg>
    </div>
  );
}
