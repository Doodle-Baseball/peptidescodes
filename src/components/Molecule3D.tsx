"use client";

import { useEffect, useRef } from "react";

type Atom = { x: number; y: number; z: number; r: number; c: string };

/** Lightweight rotating 3D peptide chain rendered on canvas (no WebGL / no deps). */
export function Molecule3D({ className = "", density = 1, opacity = 1 }: { className?: string; density?: number; opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Build an alpha-helix-like backbone with side chains.
    const atoms: Atom[] = [];
    const bonds: [number, number][] = [];
    const N = Math.round(46 * density);
    const colors = ["#073774", "#2f73ff", "#8b93e8", "#209b42", "#e8a33d"];
    for (let i = 0; i < N; i++) {
      const t = i * 0.55;
      const a: Atom = { x: Math.cos(t) * 1.1, y: (i - N / 2) * 0.16, z: Math.sin(t) * 1.1, r: 0.17, c: i % 4 === 0 ? colors[1] : colors[0] };
      atoms.push(a);
      if (i > 0) bonds.push([atoms.length - 2, atoms.length - 1]);
      const backbone = atoms.length - 1;
      if (i % 3 === 0) {
        const s = { x: Math.cos(t) * 1.85, y: a.y + 0.05, z: Math.sin(t) * 1.85, r: 0.13, c: colors[2 + (i % 3)] };
        atoms.push(s);
        bonds.push([backbone, atoms.length - 1]);
        if (i % 6 === 0) {
          atoms.push({ x: Math.cos(t + 0.35) * 2.4, y: a.y + 0.22, z: Math.sin(t + 0.35) * 2.4, r: 0.1, c: colors[3] });
          bonds.push([atoms.length - 2, atoms.length - 1]);
        }
      }
    }

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let ay = 0.6, ax = 0.35, tx = 0, ty = 0, raf = 0, visible = true, last = performance.now();
    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 0.8;
      ty = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) ay += dt * 0.35;
      ax += (0.35 + ty - ax) * 0.04;
      const yaw = ay + tx;
      ctx.clearRect(0, 0, w, h);
      const scale = Math.min(w, h) / 6.2;
      const cx = w / 2, cy = h / 2;
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw), cosX = Math.cos(ax), sinX = Math.sin(ax);
      const proj = atoms.map((a) => {
        // rotate the helix so it lies diagonally
        const x1 = a.x * cosY - a.z * sinY;
        const z1 = a.x * sinY + a.z * cosY;
        const y1 = a.y * cosX - z1 * sinX;
        const z2 = a.y * sinX + z1 * cosX;
        const tilt = 0.6;
        const xr = x1 * Math.cos(tilt) - y1 * Math.sin(tilt);
        const yr = x1 * Math.sin(tilt) + y1 * Math.cos(tilt);
        const p = 5 / (5 + z2);
        return { sx: cx + xr * scale * p, sy: cy + yr * scale * p, z: z2, p, a };
      });
      ctx.lineCap = "round";
      for (const [i, j] of bonds) {
        const A = proj[i], B = proj[j];
        const depth = (A.z + B.z) / 2;
        ctx.strokeStyle = `rgba(8,30,76,${(0.16 - depth * 0.03) * opacity})`;
        ctx.lineWidth = 3 * ((A.p + B.p) / 2);
        ctx.beginPath();
        ctx.moveTo(A.sx, A.sy);
        ctx.lineTo(B.sx, B.sy);
        ctx.stroke();
      }
      const order = proj.map((_, i) => i).sort((i, j) => proj[j].z - proj[i].z);
      for (const i of order) {
        const P = proj[i];
        const r = P.a.r * scale * P.p;
        const g = ctx.createRadialGradient(P.sx - r * 0.35, P.sy - r * 0.35, r * 0.1, P.sx, P.sy, r);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.35, P.a.c);
        g.addColorStop(1, "#06143a");
        ctx.globalAlpha = Math.max(0.25, Math.min(1, 0.95 - P.z * 0.18)) * opacity;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(P.sx, P.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    });
    io.observe(canvas);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [density, opacity]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
