"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Fragment, useRef, useState, type ReactNode } from "react";
import { FLAG_INNER, FLAG_OUTER, FlagEmblems } from "./flag";
import { icons, type IconName } from "./icons";

const ease = [0.22, 1, 0.36, 1] as const;

type Token = string | { chip: ReactNode };

const TOKENS: Token[] = [
  "Sodhnus",
  { chip: <FlagChip /> },
  ..."uses AI to give simple answers only from official".split(" "),
  { chip: <ServiceBadges /> },
  ..."government sources. It’s free, never shows ads, and keeps your".split(" "),
  { chip: <FingerprintChip /> },
  ..."information private.".split(" "),
];

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduceMotion = useReducedMotion();
  // Words sharpen one by one as the sentence scrolls up, finishing when it reaches the middle of the screen.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "center 0.55"] });
  const count = TOKENS.length;

  return (
    <section id="about" className="site-container py-28 sm:py-44">
      <p
        ref={ref}
        className="mx-auto max-w-[13em] text-center font-serif text-[clamp(2.75rem,1rem+5.6vw,7.5rem)] leading-[1] tracking-[-0.052em] text-balance [font-variation-settings:'opsz'_72]"
      >
        {TOKENS.map((token, i) => {
          const start = (i / count) * 0.8;
          const range: [number, number] = [start, start + 0.2];
          return (
            <Fragment key={i}>
              <Reveal progress={scrollYProgress} range={range} still={!!reduceMotion} chip={typeof token !== "string"}>
                {typeof token === "string" ? token : token.chip}
              </Reveal>{" "}
            </Fragment>
          );
        })}
      </p>
    </section>
  );
}

function Reveal({
  children,
  progress,
  range,
  still,
  chip,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  still: boolean;
  chip: boolean;
}) {
  const opacity = useTransform(progress, range, [chip ? 0 : 0.12, 1]);
  const filter = useTransform(progress, range, ["blur(10px)", "blur(0px)"]);
  const y = useTransform(progress, range, ["0.18em", "0em"]);
  const scale = useTransform(progress, range, [0.6, 1]);

  return (
    <motion.span
      className={chip ? "mx-[0.04em] inline-flex align-middle" : "my-[-0.2em] inline-block py-[0.2em]"}
      style={still ? undefined : chip ? { opacity, scale } : { opacity, filter, y }}
    >
      {children}
    </motion.span>
  );
}

/* ---------- Flag chip: a navy disc whose outline morphs into Nepal's double pennant. ---------- */

// Flag outline (see flag.tsx), mapped into the chip's 0–100% box.
const CX = 328;
const CY = 400;
const SCALE = 84 / 800;
const toBox = ([x, y]: [number, number]): [number, number] => [50 + (x - CX) * SCALE, 50 + (y - CY) * SCALE];
// The emblem SVG uses the same mapping, expressed as a viewBox.
const HALF = 50 / SCALE;
const EMBLEM_VIEWBOX = `${CX - HALF} ${CY - HALF} ${HALF * 2} ${HALF * 2}`;
const POINTS = 60;

function resample(points: [number, number][]): [number, number][] {
  const edges = points.map((p, i) => [p, points[(i + 1) % points.length]] as const);
  const lengths = edges.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  const total = lengths.reduce((a, b) => a + b, 0);
  const out: [number, number][] = [];
  for (let i = 0; i < POINTS; i++) {
    let d = (total * i) / POINTS;
    let e = 0;
    while (d > lengths[e]) d -= lengths[e++];
    const [a, b] = edges[e];
    const t = d / lengths[e];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

const polygon = (pts: [number, number][]) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(",")})`;

const pennantOuter = resample(FLAG_OUTER.map(toBox));
const pennantInner = resample(FLAG_INNER.map(toBox));
const startAngle = Math.atan2(pennantOuter[0][1] - 50, pennantOuter[0][0] - 50);
const circleOf = (r: number) =>
  Array.from({ length: POINTS }, (_, i): [number, number] => {
    const a = startAngle + (i / POINTS) * Math.PI * 2;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  });

const SHAPES = {
  outerCircle: polygon(circleOf(50)),
  outerFlag: polygon(pennantOuter),
  innerCircle: polygon(circleOf(0)),
  innerFlag: polygon(pennantInner),
};

function FlagChip() {
  const [flag, setFlag] = useState(false);
  const morph = { duration: 0.75, ease };

  return (
    <button
      type="button"
      onClick={() => setFlag(!flag)}
      aria-label={flag ? "Show the arrow again" : "Play the flag of Nepal animation"}
      aria-pressed={flag}
      className="relative inline-block size-[0.86em] shrink-0 cursor-pointer drop-shadow-[0_0.06em_0.14em_rgba(0,18,51,0.18)] transition-[scale] active:scale-95"
    >
      <motion.span
        className="absolute inset-0 bg-blue-deep"
        initial={false}
        animate={{ clipPath: flag ? SHAPES.outerFlag : SHAPES.outerCircle, backgroundColor: flag ? "#003893" : "#002664" }}
        transition={morph}
      />
      <motion.span
        className="absolute inset-0 bg-crimson"
        initial={false}
        animate={{ clipPath: flag ? SHAPES.innerFlag : SHAPES.innerCircle }}
        transition={{ ...morph, delay: flag ? 0.12 : 0 }}
      />
      <AnimatePresence initial={false}>
        {flag ? (
          <motion.svg
            key="emblems"
            viewBox={EMBLEM_VIEWBOX}
            className="absolute inset-0 size-full"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ delay: 0.55, duration: 0.45, ease }}
          >
            <FlagEmblems />
          </motion.svg>
        ) : (
          <motion.span
            key="arrow"
            className="absolute inset-0 grid place-items-center text-white"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180, scale: 0.5, transition: { duration: 0.25 } }}
            transition={{ duration: 0.35, delay: 0.3 }}
          >
            <icons.arrow className="size-[45%]" strokeWidth="2.2" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ---------- Service badges: three overlapping tokens that cycle through every area of life. ---------- */

type Badge = { icon: IconName; tint: string; tone: string; office: string };

const BADGE_SETS: Badge[][] = [
  [
    { icon: "passport", tint: "#003893", tone: "#fff", office: "Department of Passports" },
    { icon: "land", tint: "#b07a1f", tone: "#fff", office: "Land Revenue Office" },
    { icon: "health", tint: "#1f6b3a", tone: "#fff", office: "Health Insurance Board" },
  ],
  [
    { icon: "tax", tint: "#5b3aa0", tone: "#fff", office: "Inland Revenue Department" },
    { icon: "id", tint: "#dc143c", tone: "#fff", office: "Department of National ID" },
    { icon: "education", tint: "#1b6660", tone: "#fff", office: "Ministry of Education" },
  ],
  [
    { icon: "home", tint: "#a3122f", tone: "#fff", office: "Ward offices" },
    { icon: "plane", tint: "#0b5cad", tone: "#fff", office: "Department of Foreign Employment" },
    { icon: "licence", tint: "#1c2a44", tone: "#fff", office: "Department of Transport Management" },
  ],
];

function ServiceBadges() {
  const [set, setSet] = useState(0);
  const badges = BADGE_SETS[set];
  const names = badges.map((b) => b.office);
  const label = `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;

  return (
    <button
      type="button"
      onClick={() => setSet((set + 1) % BADGE_SETS.length)}
      aria-label={`Official sources shown: ${label}. Show more sources`}
      className="relative inline-block h-[0.86em] w-[1.74em] shrink-0 cursor-pointer transition-[scale] active:scale-95"
    >
      <AnimatePresence initial={false}>
        {badges.map((badge, i) => {
          const Icon = icons[badge.icon];
          return (
            <motion.span
              key={`${set}-${i}`}
              className="absolute top-0 grid size-[0.86em] place-items-center rounded-full shadow-[0_0_0_0.035em_#fff,0_0.06em_0.18em_#00123326]"
              style={{ left: `${i * 0.44}em`, zIndex: i, backgroundColor: badge.tint, color: badge.tone }}
              initial={{ opacity: 0, x: "30%", scale: 0.7 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: "-30%", scale: 0.7, transition: { duration: 0.2, delay: i * 0.03 } }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.07, ease }}
            >
              <Icon className="size-[44%]" strokeWidth="1.9" />
            </motion.span>
          );
        })}
      </AnimatePresence>
    </button>
  );
}

/* ---------- Fingerprint chip: a light scans the print, then a check replaces it. ---------- */

const RIDGES = [
  "M8.5 20.5c-.9-2.1-1.3-4.2-1.3-6.3a4.8 4.8 0 0 1 9.6 0c0 .9-.1 1.8-.3 2.6",
  "M11.1 21c-.8-2.2-1.1-4.4-1.1-6.7a2 2 0 0 1 4 0c0 2.6.6 5 1.6 7",
  "M5.1 17.6c-.4-1.1-.6-2.2-.6-3.4a7.5 7.5 0 0 1 12.7-5.4",
  "M19.2 11c.3.9.4 1.9.4 3 0 1.6-.1 3-.4 4.3",
  "M5 6.8A10 10 0 0 1 19.1 6",
  "M12 14.2c0 2.5.5 4.7 1.4 6.8",
];

function FingerprintChip() {
  const [phase, setPhase] = useState<"idle" | "scanning" | "checked">("idle");

  const run = () => {
    if (phase !== "idle") return;
    setPhase("scanning");
    window.setTimeout(() => setPhase("checked"), 600);
    window.setTimeout(() => setPhase("idle"), 2400);
  };

  return (
    <button
      type="button"
      onClick={run}
      aria-label="Animate the fingerprint"
      className="relative grid size-[1.02em] shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_45%,#fff_35%,#eceef1_65%,#d6d9de)] text-crimson shadow-[0_0.1em_0.3em_#00123324] transition-[scale] active:scale-95"
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="size-[54%]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        animate={{ opacity: phase === "checked" ? 0 : 1, scale: phase === "checked" ? 0.85 : 1, filter: phase === "checked" ? "blur(2px)" : "blur(0px)" }}
        transition={{ duration: 0.3 }}
      >
        {RIDGES.map((d) => (
          <path key={d} d={d} />
        ))}
      </motion.svg>
      <AnimatePresence>
        {phase === "scanning" && (
          <motion.span
            className="absolute inset-x-0 h-[30%] bg-[linear-gradient(transparent,rgba(0,56,147,0.35),transparent)]"
            initial={{ top: "-30%" }}
            animate={{ top: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
      <motion.span
        className="absolute inset-0 grid place-items-center text-[#1f8a4c]"
        initial={false}
        animate={{ opacity: phase === "checked" ? 1 : 0, scale: phase === "checked" ? 1 : 0.9 }}
        transition={{ duration: 0.35, ease }}
      >
        <icons.check className="size-[55%]" strokeWidth="2.4" />
      </motion.span>
    </button>
  );
}
