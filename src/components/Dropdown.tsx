"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconCheck, IconChevronDown } from "./Icons";

type Option = [value: string, label: string];

/** Theme-styled replacement for <select>: rounded panel, warm hover, check on the selected item, full keyboard support. */
export function Dropdown({ id, label, value, onChange, options, className = "" }: {
  id?: string; label?: string; value: string; onChange: (v: string) => void; options: Option[]; className?: string;
}) {
  const autoId = useId();
  const btnId = id || `dd-${autoId}`;
  const listId = `${btnId}-list`;
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const current = options.find(([v]) => v === value) || options[0];

  useEffect(() => {
    if (!open) return;
    setHi(Math.max(0, options.findIndex(([v]) => v === value)));
    const onDown = (e: MouseEvent) => root.current && !root.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, options, value]);

  useEffect(() => {
    if (open) list.current?.children[hi]?.scrollIntoView({ block: "nearest" });
  }, [hi, open]);

  const pick = (v: string) => { onChange(v); setOpen(false); };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); setOpen(true); return; }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Home") { e.preventDefault(); setHi(0); }
    else if (e.key === "End") { e.preventDefault(); setHi(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(options[hi][0]); }
    else if (e.key === "Escape" || e.key === "Tab") setOpen(false);
  };

  return (
    <div ref={root} className={`relative ${className}`}>
      {label && <label htmlFor={btnId} className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">{label}</label>}
      <button
        id={btnId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 text-left text-[15px] font-medium text-ink transition ${open ? "border-ink ring-4 ring-ink/[0.06]" : "border-line hover:border-[#cfccc4]"}`}
      >
        <span className="truncate">{current?.[1]}</span>
        <IconChevronDown size={17} className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-labelledby={btnId}
          className="animate-pop absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-72 overflow-auto rounded-2xl border border-line bg-white p-1.5 shadow-[0_24px_48px_-20px_rgb(8_30_76/0.3)]"
        >
          {options.map(([v, l], i) => {
            const selected = v === value;
            return (
              <li
                key={v}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(v)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-[15px] transition-colors ${i === hi ? "bg-stone" : ""} ${selected ? "font-semibold text-ink" : "text-[#3a3a3a]"}`}
              >
                <span className="truncate">{l}</span>
                {selected && <IconCheck size={16} className="shrink-0 text-green" strokeWidth={2.6} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
