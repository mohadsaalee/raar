"use client";
import { useState } from "react";

/** Image with graceful fallback: if the remote photo fails, a branded placeholder is shown. */
export default function SafeImage({ src, alt, className = "", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 font-display text-2xl tracking-[0.3em] text-neutral-400 ${className}`} role="img" aria-label={alt}>
        RAAR
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} onError={() => setErr(true)} className={className} />;
}
