"use client";
import { useState } from "react";
import { initials } from "@/lib/format";

const PALETTE = ["#073774", "#2f73ff", "#6b74d6", "#209b42", "#c8642b", "#081e4c"];

export function VendorLogo({ name, src, size = 44, className = "" }: { name: string; src?: string | null; size?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  const color = PALETTE[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-line shadow-[0_4px_12px_-6px_rgb(8_30_76/0.22)] ${className}`}
      style={{ width: size, height: size, borderRadius: Math.max(8, Math.round(size * 0.26)) }}
    >
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${name} logo`}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className="h-[70%] w-[70%] object-contain"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-bold text-white" style={{ background: color, fontSize: size * 0.36 }}>
          {initials(name)}
        </span>
      )}
    </span>
  );
}
