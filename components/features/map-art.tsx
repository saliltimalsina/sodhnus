"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import map from "@/data/nepal-map.json";
import { icons } from "../icons";

type Place = [number, number, string, string];
const places = map.places as Place[];

const PULSE_EVERY = 1500;
const PAD = 0.07; // share of card width left empty either side of the map
const MAP_CENTER_Y = 0.42; // vertical centre of the map, as a share of card height
const PILL_Y = 0.84;

type Pulse = { id: number; place: number; born: number };

/** Nepal drawn with one dot per local government; a dot lights up and streams into the ask box. */
export function MapArt() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrap, { amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const [label, setLabel] = useState<Pulse | null>(null);
  const [glow, setGlow] = useState(0);
  const pulses = useRef<Pulse[]>([]);
  const active = playing && inView && !reduceMotion;

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let size = 0;
    let frame = 0;
    let lastPulse = 0;
    let nextId = 1;

    const layout = () => {
      size = box.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = size * dpr;
      el.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (x: number, y: number) => {
      const scale = (size * (1 - PAD * 2)) / map.w;
      return [size * PAD + x * scale, size * MAP_CENTER_Y - (map.h * scale) / 2 + y * scale] as const;
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, size, size);
      const scale = (size * (1 - PAD * 2)) / map.w;

      ctx.fillStyle = "rgba(143, 179, 255, 0.16)";
      const g = Math.max(1, scale * 2.2);
      for (const [x, y] of map.grid) {
        const [px, py] = project(x, y);
        ctx.fillRect(px - g / 2, py - g / 2, g, g);
      }

      const r = Math.max(1.1, scale * 2.6);
      places.forEach(([x, y], i) => {
        const [px, py] = project(x, y);
        const flicker = active ? 0.55 + 0.35 * Math.sin(now / 900 + i * 1.7) : 0.75;
        ctx.fillStyle = `rgba(179, 217, 255, ${flicker})`;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      });

      const [pillX, pillY] = [size / 2, size * PILL_Y];
      for (const pulse of pulses.current) {
        const age = (now - pulse.born) / 1000;
        const [px, py] = project(places[pulse.place][0], places[pulse.place][1]);

        // Expanding ring.
        if (age < 1.4) {
          const t = age / 1.4;
          ctx.strokeStyle = `rgba(220, 20, 60, ${0.9 * (1 - t)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, r + t * 22, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(255, 90, 110, ${Math.max(0, 1 - age / 2.4)})`;
        ctx.beginPath();
        ctx.arc(px, py, r * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Streak from the place to the ask box.
        const head = Math.min(1, Math.max(0, (age - 0.35) / 0.8));
        const tail = Math.min(1, Math.max(0, (age - 0.75) / 0.8));
        if (head > 0 && tail < 1) {
          const cx = (px + pillX) / 2;
          const cy = Math.min(py, pillY) - size * 0.05;
          const point = (t: number) => {
            const u = 1 - t;
            return [u * u * px + 2 * u * t * cx + t * t * pillX, u * u * py + 2 * u * t * cy + t * t * pillY] as const;
          };
          const [hx, hy] = point(head);
          const [tx, ty] = point(tail);
          const gradient = ctx.createLinearGradient(tx, ty, hx, hy);
          gradient.addColorStop(0, "rgba(143, 179, 255, 0)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0.9)");
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (let s = 0; s <= 24; s++) {
            const [x, y] = point(tail + ((head - tail) * s) / 24);
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      pulses.current = pulses.current.filter((p) => now - p.born < 2600);
    };

    const tick = (now: number) => {
      if (now - lastPulse > PULSE_EVERY) {
        lastPulse = now;
        const pulse = { id: nextId++, place: Math.floor(Math.random() * places.length), born: now };
        pulses.current.push(pulse);
        setLabel(pulse);
        window.setTimeout(() => setGlow((g) => g + 1), 1150);
      }
      draw(now);
      frame = requestAnimationFrame(tick);
    };

    layout();
    const observer = new ResizeObserver(() => {
      layout();
      draw(performance.now());
    });
    observer.observe(box);
    if (active) frame = requestAnimationFrame(tick);
    else draw(performance.now());

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active]);

  const labelPos = label ? positionOf(label.place) : null;

  return (
    <div ref={wrap} className="squircle relative aspect-square w-full overflow-hidden rounded-[40px] bg-[radial-gradient(120%_90%_at_50%_30%,#0b2452,#001233_70%)]">
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full" />

      <AnimatePresence>
        {label && labelPos && active && (
          <motion.span
            key={label.id}
            aria-hidden="true"
            className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-ink shadow-glass"
            style={{ left: `${Math.min(84, Math.max(16, labelPos[0]))}%`, top: `calc(${labelPos[1]}% - 30px)` }}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.3 } }}
            transition={{ duration: 0.35 }}
          >
            {places[label.place][2]}, {places[label.place][3]}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        key={glow}
        aria-hidden="true"
        className="absolute left-1/2 flex w-[72%] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white py-1.5 pr-1.5 pl-4 text-[13px] text-ink-2"
        style={{ top: `${PILL_Y * 100}%` }}
        initial={{ boxShadow: "0 0 0 0 rgba(143,179,255,0.7)" }}
        animate={{ boxShadow: "0 0 0 10px rgba(143,179,255,0)" }}
        transition={{ duration: 0.8 }}
      >
        <span className="flex-1 truncate">Ask about any of them…</span>
        <span className="grid size-7 place-items-center rounded-full bg-blue-deep text-white">
          <icons.arrow className="size-3.5" strokeWidth="2.2" />
        </span>
      </motion.div>

      <p id="map-desc" className="sr-only">
        A map of Nepal with one dot for each local government. Dots light up one at a time with their names and
        stream into an ask box.
      </p>
      {!reduceMotion && (
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause animation" : "Play animation"}
          aria-describedby="map-desc"
          className="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
        >
          {playing ? <icons.pause className="size-4" /> : <icons.play className="size-3.5" />}
        </button>
      )}
    </div>
  );
}

function positionOf(place: number): [number, number] {
  // Same projection as the canvas, in percent of the (square) card.
  const [x, y] = places[place];
  const scale = (1 - PAD * 2) / map.w;
  return [(PAD + x * scale) * 100, (MAP_CENTER_Y - (map.h * scale) / 2 + y * scale) * 100];
}
