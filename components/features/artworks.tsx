"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { icons } from "../icons";

const ease = [0.22, 1, 0.36, 1] as const;

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`squircle relative aspect-square w-full overflow-hidden rounded-[40px] ${className}`}>{children}</div>
  );
}

function useShown(amount = 0.45) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { amount, once: true });
  return [ref, shown] as const;
}

/* ---------- Clear answers. Official sources. ---------- */

const SOURCES = [
  { site: "nepalpassport.gov.np", title: "Passport renewal", letter: "P" },
  { site: "daokathmandu.moha.gov.np", title: "District Administration Office services", letter: "D" },
];

export function SourcesArt() {
  const [ref, shown] = useShown();
  const [cited, setCited] = useState<number | null>(null);

  useEffect(() => {
    if (!shown) return;
    const sequence = [0, 1, null];
    let i = 0;
    const timer = window.setInterval(() => setCited(sequence[i++ % sequence.length]), 1800);
    return () => window.clearInterval(timer);
  }, [shown]);

  const mark = (n: number) =>
    `rounded-[3px] transition-colors duration-300 ${cited === n ? "bg-[#cfe0ff] text-ink" : "bg-transparent"}`;

  return (
    <Card className="grid place-items-center bg-sky p-6 sm:p-10">
      <motion.div
        ref={ref}
        className="w-full max-w-[400px] rounded-[28px] bg-white p-5 shadow-glass sm:p-6"
        initial={{ opacity: 0, y: 24 }}
        animate={shown ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease }}
      >
        <p className="ml-auto w-fit rounded-[18px] rounded-br-[6px] bg-blue-deep px-3.5 py-2 text-[13px] text-white">
          How do I renew my passport?
        </p>
        <p className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-[#1f6b3a]">
          <icons.check className="size-3.5" strokeWidth="2.4" />
          Answer based on official sources
        </p>
        <p className="mt-2 text-[14px] leading-[1.6] text-ink">
          <span className={mark(0)}>Fill in the online application first, then book a visit.</span>
          <Cite n={0} cited={cited} onCite={setCited} />{" "}
          <span className={mark(1)}>
            Take your old passport and citizenship certificate to your District Administration Office.
          </span>
          <Cite n={1} cited={cited} onCite={setCited} />
        </p>
        <ul className="mt-5 space-y-2">
          {SOURCES.map((source, i) => (
            <li
              key={source.site}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors duration-300 ${
                cited === i ? "border-[#9dbcf0] bg-[#f4f8ff]" : "border-line"
              }`}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-deep text-[11px] font-semibold text-white">
                {source.letter}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium">{source.title}</span>
                <span className="block truncate text-[11px] text-ink-3">{source.site}</span>
              </span>
              <icons.arrowUpRight className="size-3.5 text-ink-3" />
            </li>
          ))}
        </ul>
      </motion.div>
      <p className="absolute bottom-4 text-[11px] text-ink-3">Example answer</p>
    </Card>
  );
}

function Cite({ n, cited, onCite }: { n: number; cited: number | null; onCite: (n: number) => void }) {
  return (
    <button
      type="button"
      onMouseEnter={() => onCite(n)}
      onFocus={() => onCite(n)}
      aria-label={`Source ${n + 1}: ${SOURCES[n].site}`}
      className={`mx-0.5 inline-grid size-[18px] translate-y-[-2px] place-items-center rounded-full text-[10px] font-semibold transition-colors ${
        cited === n ? "bg-blue-deep text-white" : "bg-wash text-blue"
      }`}
    >
      {n + 1}
    </button>
  );
}

/* ---------- Ask in the language you think in. ---------- */

const ASKED = [
  { lang: "English", text: "How do I register a birth?" },
  { lang: "Roman Nepali", text: "janma darta kasari garne?" },
  { lang: "नेपाली", text: "जन्म दर्ता कसरी गर्ने?", ne: true },
];

const REPLY = {
  en: "Go to your ward office within 35 days with the parents’ citizenship certificates. Registering on time is free.",
  ne: "३५ दिनभित्र आमाबुबाको नागरिकताको प्रतिलिपि लिएर वडा कार्यालय जानुहोस्। समयमै दर्ता गर्दा निःशुल्क हुन्छ।",
  ro: "35 din bhitra aama-buba ko nagarikta ko pratilipi lera ward karyalaya januhos. Samaya mai darta garda nishulka huncha.",
};

export function LanguagesArt() {
  const [ref, shown] = useShown();
  const [reply, setReply] = useState<keyof typeof REPLY>("en");

  return (
    <Card className="bg-blush p-6 sm:p-9">
      <div ref={ref} className="flex h-full flex-col justify-center gap-2.5">
        {ASKED.map((item, i) => (
          <motion.div
            key={item.lang}
            className="ml-auto flex max-w-[88%] flex-col items-end"
            initial={{ opacity: 0, x: 24 }}
            animate={shown ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.35, ease }}
          >
            <span className="mb-1 text-[10px] font-medium tracking-wide text-[#a3122f] uppercase">{item.lang}</span>
            <span
              lang={item.ne ? "ne" : undefined}
              className="rounded-[18px] rounded-br-[6px] bg-white px-3.5 py-2 text-[13px] text-ink shadow-card"
            >
              {item.text}
            </span>
          </motion.div>
        ))}

        <motion.div
          className="mt-3 rounded-[24px] bg-white p-4 shadow-glass"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={shown ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 1.25, ease }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-ink-2">Same answer, your language</span>
            <div role="tablist" aria-label="Answer language" className="flex rounded-full bg-snow p-0.5">
              {(["en", "ne", "ro"] as const).map((key) => (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={reply === key}
                  onClick={() => setReply(key)}
                  lang={key === "ne" ? "ne" : undefined}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] transition-colors ${reply === key ? "bg-white text-ink shadow-card" : "text-ink-2"}`}
                >
                  {{ en: "EN", ne: "ने", ro: "RO" }[key]}
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={reply}
              lang={reply === "ne" ? "ne" : undefined}
              className="mt-2.5 text-[13px] leading-[1.6]"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.25 }}
            >
              {REPLY[reply]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    </Card>
  );
}

/* ---------- Government language, in plain words. ---------- */

export function NoticeArt() {
  const [ref, shown] = useShown(0.6);
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    if (!shown) return;
    const timer = window.setTimeout(() => setSimple(true), 2600);
    return () => window.clearTimeout(timer);
  }, [shown]);

  return (
    <Card className="grid place-items-center bg-harvest p-6 sm:p-10">
      <div ref={ref} className="relative w-full max-w-[380px]">
        <AnimatePresence mode="wait" initial={false}>
          {!simple ? (
            <motion.div
              key="notice"
              className="relative rotate-[-1.5deg] bg-[#fffdf7] p-5 font-serif text-[12.5px] leading-[1.55] text-ink/80 shadow-glass sm:p-6"
              exit={{ opacity: 0, rotate: 0, scale: 0.96, filter: "blur(6px)", transition: { duration: 0.45 } }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p lang="ne" className="font-deva text-[13px] text-ink">
                    सूचना
                  </p>
                  <p className="text-[10px] tracking-[0.18em] text-ink-3 uppercase">Public notice</p>
                </div>
                <Stamp />
              </div>
              <div className="my-3 border-t border-ink/10" />
              <p>
                Applicants seeking registration of a vital event shall submit the prescribed application to the Local
                Registrar of the concerned ward <Highlight shown={shown} delay={0.5}>within thirty-five days of the occurrence</Highlight>{" "}
                of such event, accompanied by the <Highlight shown={shown} delay={0.9}>requisite documentation as specified</Highlight>,
                failing which <Highlight shown={shown} delay={1.3}>a late fee shall be levied</Highlight> as per prevailing provisions.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="plain"
              className="rounded-[28px] bg-white p-5 shadow-glass sm:p-6"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease }}
            >
              <p className="text-[11px] font-medium tracking-wide text-[#7a5a00] uppercase">In plain words</p>
              <ol className="mt-3 space-y-3">
                {[
                  "Register it at your ward office.",
                  "Do it within 35 days, or pay a late fee.",
                  "Bring the documents your ward asks for.",
                ].map((line, i) => (
                  <motion.li
                    key={line}
                    className="flex gap-3 text-[14px] leading-snug"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.12, duration: 0.45, ease }}
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-harvest text-[11px] font-semibold text-[#7a5a00]">
                      {i + 1}
                    </span>
                    {line}
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setSimple(!simple)}
          className="absolute -bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-4 py-1.5 text-[12px] font-medium shadow-card backdrop-blur-md transition-colors hover:bg-white"
        >
          {simple ? "Show the original" : "Simplify"}
        </button>
      </div>
    </Card>
  );
}

function Highlight({ children, delay, shown }: { children: ReactNode; delay: number; shown: boolean }) {
  return (
    <motion.span
      className="bg-[linear-gradient(#ffe08a,#ffe08a)] bg-no-repeat [background-position:0_88%]"
      initial={{ backgroundSize: "0% 40%" }}
      animate={shown ? { backgroundSize: "100% 40%" } : {}}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.span>
  );
}

/** A generic round office stamp, deliberately not the national emblem. */
function Stamp() {
  return (
    <svg viewBox="0 0 80 80" className="size-14 shrink-0 rotate-[-12deg] text-[#7b1b3a]/70" aria-hidden="true">
      <defs>
        <path id="stamp-ring" d="M40 40m-28 0a28 28 0 1 1 56 0a28 28 0 1 1-56 0" />
      </defs>
      <circle cx="40" cy="40" r="37" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text fontSize="8.5" fill="currentColor" letterSpacing="1.5" fontFamily="var(--font-sans)">
        <textPath href="#stamp-ring">SAMPLE NOTICE · SAMPLE NOTICE ·</textPath>
      </text>
      <path d="m32 40 5 5 11-11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Private by design: the Kathmandu valley at night. ---------- */

// Rounded so server and browser produce identical markup.
const round = (n: number) => Math.round(n * 10) / 10;

const STARS = Array.from({ length: 110 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return { x: round((a - Math.floor(a)) * 400), y: round((b - Math.floor(b)) * 250), r: i % 11 === 0 ? 1.1 : 0.5, delay: (i % 13) * 0.8 };
});
const LIGHTS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 3.7) * 9999.1;
  const b = Math.sin(i * 9.1) * 5555.3;
  return { x: round(60 + (a - Math.floor(a)) * 280), y: round(334 + (b - Math.floor(b)) * 40) };
});
const FAR = "M0 285 C40 250 80 262 118 244 C150 230 176 252 214 240 C252 226 284 204 322 228 C350 244 376 236 400 242 V400 H0Z";
const MID = "M0 318 C50 296 96 312 140 300 C190 286 230 306 270 296 C320 284 360 300 400 292 V400 H0Z";
const NEAR = "M0 372 C70 352 130 366 200 360 C270 354 330 368 400 356 V400 H0Z";

export function PrivacyArt() {
  const [ref, shown] = useShown(0.5);
  const [stars, setStars] = useState<number[]>([]);

  return (
    <Card className="bg-[linear-gradient(#02060c,#071433_52%,#12306e)]">
      <div ref={ref} className="absolute inset-0">
        <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden="true">
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#b3d9ff" style={{ animation: `twinkle 10s ease-in-out ${-s.delay}s infinite` }} />
          ))}
          <path d={FAR} fill="#0c1f4a" />
          <path d={MID} fill="#081634" />
          {LIGHTS.map((l, i) => (
            <circle key={i} cx={l.x} cy={l.y} r={i % 5 === 0 ? 0.9 : 0.55} fill="#ffd27a" opacity={0.55 + (i % 4) * 0.1} />
          ))}
          <path d={NEAR} fill="#040b1c" />
        </svg>

        <button
          type="button"
          aria-label="Make a shooting star"
          onClick={() => setStars((s) => [...s, Date.now()])}
          className="absolute top-[13%] left-[18%] z-10 grid size-11 -translate-1/2 place-items-center rounded-full"
        >
          <span className="size-1.5 rounded-full bg-white/70 shadow-[0_0_8px_#fff]" style={{ animation: "twinkle 6s ease-in-out -2s infinite" }} />
        </button>
        <AnimatePresence>
          {stars.map((id) => (
            <motion.span
              key={id}
              aria-hidden="true"
              className="pointer-events-none absolute top-[13%] left-[18%] -ml-24 h-[2px] w-24 origin-right rounded-full bg-[linear-gradient(90deg,transparent,rgba(166,213,255,0.5)_65%,#fff)]"
              initial={{ opacity: 0, x: 0, y: 0, rotate: 32, scaleX: 0.15 }}
              animate={{ opacity: [0, 1, 1, 0], x: 210, y: 132, rotate: 32, scaleX: 1 }}
              transition={{ duration: 0.85, ease: [0.4, 0, 0.8, 1] }}
              onAnimationComplete={() => setStars((s) => s.filter((x) => x !== id))}
            />
          ))}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0 grid place-items-center pb-[12%]">
          <div className="grid size-[130px] place-items-center rounded-full bg-[#e6e8ea] shadow-glass">
            <svg viewBox="0 0 24 24" className="size-9 overflow-visible" fill="none" stroke="#001233" strokeWidth="2.2" strokeLinecap="round">
              <motion.path
                d="M8 10.5V8a4 4 0 0 1 8 0v2.5"
                initial={{ y: -2, rotate: -18 }}
                animate={shown ? { y: 0, rotate: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ transformOrigin: "8px 10px" }}
              />
              <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="#001233" stroke="none" />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- No app to download. ---------- */

export function DeviceArt() {
  const [ref, shown] = useShown();

  return (
    <Card className="bg-snow">
      <div ref={ref} className="absolute inset-0">
        {/* Browser window */}
        <motion.div
          className="absolute top-[14%] left-[9%] w-[78%] overflow-hidden rounded-[18px] bg-white shadow-glass"
          initial={{ opacity: 0, y: 30 }}
          animate={shown ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease }}
        >
          <div className="flex items-center gap-1.5 border-b border-line px-3.5 py-2.5">
            <span className="size-2 rounded-full bg-[#ff5f57]" />
            <span className="size-2 rounded-full bg-[#febc2e]" />
            <span className="size-2 rounded-full bg-[#28c840]" />
            <span className="ml-3 flex-1 rounded-full bg-snow px-3 py-1 text-[10px] text-ink-3">Sodhnus</span>
          </div>
          <div className="px-6 pt-8 pb-10 text-center">
            <p className="font-serif text-[26px] tracking-[-0.04em]">Hello, Nepal</p>
            <div className="mx-auto mt-4 flex w-[80%] items-center rounded-full border border-line py-1.5 pr-1.5 pl-3.5 text-left text-[10px] text-ink-3">
              <span className="flex-1">Ask anything…</span>
              <span className="grid size-5 place-items-center rounded-full bg-blue-deep text-white">
                <icons.arrow className="size-2.5" strokeWidth="2.4" />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Phone */}
        <motion.div
          className="absolute right-[8%] bottom-[-6%] h-[62%] w-[34%] rounded-[26px] border-[5px] border-navy bg-white p-3 shadow-glass"
          initial={{ opacity: 0, y: 50 }}
          animate={shown ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25, ease }}
        >
          <div className="mx-auto h-1 w-8 rounded-full bg-navy/80" />
          <p className="mt-4 ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-blue-deep px-2.5 py-1.5 text-[9px] text-white">
            nagarikta harayo, aba k garne?
          </p>
          <p lang="ne" className="mt-1.5 w-fit max-w-[95%] rounded-2xl rounded-bl-md bg-snow px-2.5 py-1.5 text-[9px] leading-relaxed">
            प्रतिलिपिका लागि जिल्ला प्रशासन कार्यालयमा निवेदन दिनुहोस्…
          </p>
          <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-1.5 rounded-full bg-snow px-2.5 py-1.5">
            <span lang="ne" className="flex-1 text-[9px] text-ink-3">
              बोल्नुहोस्…
            </span>
            <span className="flex h-3 items-center gap-[2px]" aria-hidden="true">
              {[0.5, 1, 0.7, 0.9, 0.4].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-[2px] rounded-full bg-crimson"
                  animate={{ height: [`${h * 40}%`, `${h * 100}%`, `${h * 40}%`] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                />
              ))}
            </span>
          </div>
        </motion.div>

        <motion.span
          className="absolute bottom-[9%] left-[9%] flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium shadow-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={shown ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6, ease }}
        >
          <span className="size-1.5 rounded-full bg-[#28c840]" />
          Works on mobile data
        </motion.span>
      </div>
    </Card>
  );
}
