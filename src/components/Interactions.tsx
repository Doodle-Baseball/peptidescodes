"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const SCROLL_KEY = "pc-scroll-to";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/**
 * Global scroll-reveal ([data-reveal]), 3D hover tilt ([data-tilt]) and
 * in-page links: links like "/#top-deals" scroll smoothly without adding "#..." to the address bar.
 */
export function Interactions() {
  const pathname = usePathname();
  const router = useRouter();

  // Intercept hash links (capture phase, before Next.js <Link> handles them).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank") return;
      const href = a.getAttribute("href") || "";
      if (!href.includes("#")) return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin || !url.hash) return;
      const id = decodeURIComponent(url.hash.slice(1));
      e.preventDefault();
      e.stopPropagation();
      if (url.pathname === window.location.pathname) {
        scrollToId(id);
      } else {
        try { sessionStorage.setItem(SCROLL_KEY, id); } catch { /* ignore */ }
        router.push(url.pathname + url.search, { scroll: true });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // After navigating to another page, scroll to the stored section.
  useEffect(() => {
    let id: string | null = null;
    try { id = sessionStorage.getItem(SCROLL_KEY); sessionStorage.removeItem(SCROLL_KEY); } catch { /* ignore */ }
    if (!id) return;
    let tries = 0;
    const t = setInterval(() => {
      if (scrollToId(id!) || ++tries > 20) clearInterval(t);
    }, 100);
    return () => clearInterval(t);
  }, [pathname]);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const reveal = (obs: IntersectionObserver) => (entries: IntersectionObserverEntry[]) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
        }
      });
    const io: IntersectionObserver = new IntersectionObserver((en) => reveal(io)(en), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    // Elements taller than the screen can never be 8% visible on a phone, so reveal them as soon as they enter.
    const tallIo: IntersectionObserver = new IntersectionObserver((en) => reveal(tallIo)(en), { threshold: 0 });
    els.forEach((el) => (el.offsetHeight > window.innerHeight * 0.9 ? tallIo : io).observe(el));
    return () => { io.disconnect(); tallIo.disconnect(); };
  }, [pathname]);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;
    let active: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-tilt]");
      if (active && active !== el) reset(active);
      active = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const max = Number(el.dataset.tilt || 8);
      el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
    };
    const reset = (el: HTMLElement) => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    const onLeave = () => active && reset(active);
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return null;
}
