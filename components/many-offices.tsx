"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { icons, type IconName } from "./icons";

const ease = [0.22, 1, 0.36, 1] as const;
const QUESTION = "What do I need to get my house plans approved?";

type Office = { name: string; ne: string; gives: string; icon: IconName; tint: string; tone: string; thumb: ReactNode };

const OFFICES: Office[] = [
  { name: "Land Revenue Office", ne: "मालपोत कार्यालय", gives: "Ownership certificate", icon: "land", tint: "#f6e7cc", tone: "#8a5a12", thumb: <Lalpurja /> },
  { name: "Survey Office", ne: "नापी कार्यालय", gives: "Map of your plot", icon: "mapPin", tint: "#dcf0ee", tone: "#1b6660", thumb: <MapTrace /> },
  { name: "Ward office", ne: "वडा कार्यालय", gives: "Tax receipt", icon: "home", tint: "#fbe9ec", tone: "#a3122f", thumb: <Letter /> },
  { name: "Municipality", ne: "नगरपालिका", gives: "Building permit", icon: "building", tint: "#e6f0ff", tone: "#003893", thumb: <Blueprint /> },
];

const CHECKLIST = [
  { item: "Land ownership certificate (lalpurja)", office: 0 },
  { item: "Map trace of your plot", office: 1 },
  { item: "This year’s land tax receipt", office: 2 },
  { item: "Building design signed by a licensed engineer", office: 3 },
  { item: "Copy of your citizenship certificate", office: -1 },
];


export function ManyOffices() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15, once: true });
  const typed = useTyping(QUESTION, inView);
  const done = typed.length === QUESTION.length;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!done) return;
    const timers = [1, 2, 3].map((s, i) => window.setTimeout(() => setStage(s), [100, 550, 1050][i]));
    return () => timers.forEach(clearTimeout);
  }, [done]);

  return (
    <section id="many-offices" className="site-container scroll-mt-10 pb-32 sm:pb-44">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="type-display text-balance">
          One question. Many offices. <span className="text-blue">One answer.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[17px] leading-[1.65] text-ink-2">
          Government information is spread across offices. Sodhnus brings it together into one checklist.
        </p>
      </div>

      <div
        ref={ref}
        className="squircle relative mt-14 overflow-hidden rounded-[40px] bg-[linear-gradient(180deg,#f3f7ff,#e9f0fd)] px-4 py-10 sm:mt-16 sm:rounded-[48px] sm:px-10 sm:py-16"
      >
        {/* Question */}
        <div className="mx-auto max-w-[560px]">
          <div className="flex min-h-14 items-center gap-2 rounded-full bg-white py-2 pr-2 pl-6 shadow-composer outline-1 outline-ink-4">
            <span className="min-w-0 flex-1 text-[15px] sm:text-[17px]">
              {typed}
              {!done && <span className="ml-px inline-block h-[1.1em] w-px translate-y-[3px] animate-pulse bg-ink" />}
              {!typed && <span className="text-ink-3">Ask anything…</span>}
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-deep text-white">
              <icons.arrow className="size-[18px]" strokeWidth="2" />
            </span>
          </div>
          <p lang="ne" className="mt-2 text-center text-[13px] text-ink-3">
            घरको नक्सा पास गर्न के चाहिन्छ?
          </p>
        </div>

        {/* Branches out */}
        <Connectors top stage={stage >= 1} />

        {/* Offices */}
        <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-0 md:grid-cols-4 md:gap-5">
          {OFFICES.map((office, i) => {
            const Icon = icons[office.icon];
            return (
              <motion.li
                key={office.name}
                className="overflow-hidden rounded-[24px] bg-white shadow-card"
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={stage >= 1 ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.55, delay: 0.35 + i * 0.08, ease }}
              >
                <div className="relative grid h-24 place-items-center sm:h-28" style={{ backgroundColor: office.tint }}>
                  {office.thumb}
                </div>
                <div className="p-3.5 sm:p-4">
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full" style={{ backgroundColor: office.tint, color: office.tone }}>
                      <Icon className="size-3.5" strokeWidth="2" />
                    </span>
                    <span className="truncate text-[13px] font-semibold sm:text-sm">{office.name}</span>
                  </div>
                  <p lang="ne" className="mt-1 text-[12px] text-ink-3">
                    {office.ne}
                  </p>
                  <p className="mt-2 text-[12px] font-medium" style={{ color: office.tone }}>
                    {office.gives}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>

        {/* Branches in */}
        <Connectors stage={stage >= 2} />

        {/* Answer */}
        <motion.div
          className="mx-auto mt-8 max-w-[640px] rounded-[32px] bg-white p-5 shadow-glass sm:p-8 md:mt-0"
          initial={{ opacity: 0, y: 24 }}
          animate={stage >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-serif text-[22px] tracking-[-0.03em]">Your checklist</p>
            <span className="flex -space-x-1.5">
              {OFFICES.map((o) => {
                const Icon = icons[o.icon];
                return (
                  <span key={o.name} className="grid size-7 place-items-center rounded-full ring-2 ring-white" style={{ backgroundColor: o.tint, color: o.tone }}>
                    <Icon className="size-3.5" strokeWidth="2" />
                  </span>
                );
              })}
            </span>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {CHECKLIST.map((row, i) => {
              const office = OFFICES[row.office];
              return (
                <motion.li
                  key={row.item}
                  className="flex items-center gap-3 py-3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={stage >= 3 ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.25 + i * 0.09, ease }}
                >
                  <span
                    className="grid size-5 shrink-0 place-items-center rounded-md border-[1.5px]"
                    style={{ borderColor: office?.tone ?? "var(--color-ink-3)", color: office?.tone ?? "var(--color-ink-3)" }}
                  >
                    <icons.check className="size-3" strokeWidth="2.6" />
                  </span>
                  <span className="flex-1 text-[14px] sm:text-[15px]">{row.item}</span>
                  <span
                    className="hidden shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:inline"
                    style={{ backgroundColor: office?.tint ?? "#eef1f4", color: office?.tone ?? "var(--color-ink-2)" }}
                  >
                    {office?.name ?? "You have this"}
                  </span>
                </motion.li>
              );
            })}
          </ul>
          <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
            Illustrative example. Requirements differ by municipality, so Sodhnus links you to the rules for yours.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function useTyping(text: string, start: boolean) {
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || reduceMotion) return;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(timer);
    }, 20);
    return () => window.clearInterval(timer);
  }, [start, text, reduceMotion]);
  if (start && reduceMotion) return text;
  return text.slice(0, count);
}

function Connectors({ top = false, stage }: { top?: boolean; stage: boolean }) {
  // Drawn at the real pixel width so the line-drawing animation reaches the cards exactly.
  const ref = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width) || 1000));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tones = OFFICES.map((o) => o.tone);
  // Card centres in a 4-column grid with 20px gaps.
  const column = (width - 3 * 20) / 4;
  const xs = [0, 1, 2, 3].map((i) => i * (column + 20) + column / 2);
  const mid = width / 2;
  const kind = top ? "t" : "b";

  return (
    <svg ref={ref} viewBox={`0 0 ${width} 120`} className="hidden h-[120px] w-full md:block" aria-hidden="true">
      <defs>
        {xs.map((_, i) => (
          <linearGradient key={i} id={`grad-${kind}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={top ? "#9aa6bd" : tones[i]} />
            <stop offset="1" stopColor={top ? tones[i] : "#9aa6bd"} />
          </linearGradient>
        ))}
      </defs>
      {xs.map((x, i) => {
        const d = top ? `M${mid} 0 C${mid} 64 ${x} 56 ${x} 120` : `M${x} 0 C${x} 64 ${mid} 56 ${mid} 120`;
        return (
          <g key={i}>
            <motion.path
              d={d}
              fill="none"
              stroke={`url(#grad-${kind}-${i})`}
              strokeWidth="1.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: stage ? 1 : 0 }}
              transition={{ duration: 0.8, delay: i * 0.07, ease }}
            />
            {stage && (
              <path
                d={d}
                fill="none"
                stroke={tones[i]}
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={1000}
                strokeDasharray="14 986"
                style={{ animation: `packet 2.4s linear ${0.9 + i * 0.35}s infinite`, opacity: 0.9 }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Tiny document thumbnails ---------- */

function Lalpurja() {
  return (
    <svg viewBox="0 0 80 64" className="h-[70%]" aria-hidden="true">
      <rect x="14" y="4" width="52" height="56" rx="3" fill="#fffdf6" stroke="#d9c39a" />
      <rect x="20" y="10" width="12" height="14" rx="1.5" fill="#f1e2c4" />
      {[12, 17, 22].map((y) => (
        <rect key={y} x="36" y={y} width="24" height="2.5" rx="1.2" fill="#d9c39a" />
      ))}
      {[30, 36, 42].map((y) => (
        <rect key={y} x="20" y={y} width="40" height="2.5" rx="1.2" fill="#e8d7b5" />
      ))}
      <circle cx="54" cy="51" r="5.5" fill="none" stroke="#c0392b" strokeWidth="1.4" />
    </svg>
  );
}

function MapTrace() {
  return (
    <svg viewBox="0 0 80 64" className="h-[72%]" aria-hidden="true">
      <path d="M6 10 30 6 34 26 10 30Z M30 6 58 8 56 24 34 26Z M58 8 74 14 70 34 56 24Z M10 30 34 26 38 52 12 56Z M56 24 70 34 66 54 38 52 34 26Z" fill="#f4fbfa" stroke="#8cc5bf" strokeWidth="1" />
      <path d="M34 26 56 24 66 54 38 52Z" fill="#1b6660" fillOpacity="0.22" stroke="#1b6660" strokeWidth="1.4" />
      <text x="44" y="42" fontSize="6" fill="#1b6660" fontFamily="var(--font-sans)">482</text>
    </svg>
  );
}

function Letter() {
  return (
    <svg viewBox="0 0 80 64" className="h-[70%]" aria-hidden="true">
      <rect x="16" y="4" width="48" height="56" rx="3" fill="#fff" stroke="#efc3cc" />
      <rect x="28" y="9" width="24" height="3" rx="1.5" fill="#e79aab" />
      {[18, 23, 28, 33, 38].map((y, i) => (
        <rect key={y} x="22" y={y} width={i === 4 ? 22 : 36} height="2.2" rx="1.1" fill="#f3d3da" />
      ))}
      <circle cx="52" cy="49" r="6.5" fill="none" stroke="#a3122f" strokeWidth="1.3" strokeDasharray="2 1.5" />
    </svg>
  );
}

function Blueprint() {
  return (
    <svg viewBox="0 0 80 64" className="h-[74%]" aria-hidden="true">
      <rect x="8" y="4" width="64" height="56" rx="3" fill="#1d4f9a" />
      <path d="M8 16h64M8 28h64M8 40h64M8 52h64M20 4v56M32 4v56M44 4v56M56 4v56" stroke="#fff" strokeOpacity="0.12" />
      <path d="M24 46V30l16-11 16 11v16Z M35 46v-9h10v9" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
