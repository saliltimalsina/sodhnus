"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { situations } from "@/data/situations";
import { AskBox } from "./ask-box";
import { icons } from "./icons";

const VARIANTS = ["en", "roman", "ne"] as const;
const HINTS = { en: "EN", roman: "RO", ne: "ने" };
const VARIANT_MS = 2600;
const ease = [0.22, 1, 0.36, 1] as const;

function WordReveal({ text, lang }: { text: string; lang?: string }) {
  return (
    <span lang={lang} className="inline-flex flex-nowrap gap-x-[0.28em]">
      {text.split(" ").map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block"
          initial={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "60%", opacity: 0, filter: "blur(6px)", transition: { duration: 0.2, delay: i * 0.012 } }}
          transition={{ duration: 0.5, delay: 0.06 + i * 0.035, ease }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  // `step` counts slides without wrapping so the track can loop seamlessly in either direction.
  const [step, setStep] = useState(0);
  const [variant, setVariant] = useState(0);
  const [playing, setPlaying] = useState(true);
  const count = situations.length;
  const index = ((step % count) + count) % count;
  const situation = situations[index];
  const lang = VARIANTS[variant];

  const go = (delta: number) => {
    setStep((s) => s + delta);
    setVariant(0);
  };

  useEffect(() => {
    if (!playing || reduceMotion) return;
    const timer = window.setTimeout(() => {
      if (variant < VARIANTS.length - 1) setVariant(variant + 1);
      else {
        setStep((s) => s + 1);
        setVariant(0);
      }
    }, VARIANT_MS);
    return () => window.clearTimeout(timer);
  }, [playing, reduceMotion, variant, step]);

  return (
    <div className="relative mx-3 mb-4 sm:mx-8" data-hero>
      <section className="relative isolate flex flex-col items-center rounded-[40px] px-4 pt-20 pb-10 sm:min-h-[calc(100svh-92px)] sm:justify-center sm:rounded-[48px] sm:px-8 sm:pt-28 sm:pb-24">
        {/* Soft wash of the current photo, like America.gov's backdrop. */}
        <div aria-hidden="true" className="squircle pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[40px] sm:rounded-[48px]">
          <div className="absolute top-[-16%] left-[-12%] h-[132%] w-[124%] opacity-[0.14] blur-2xl">
            <AnimatePresence initial={false}>
              <motion.div
                key={situation.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
              >
                <Image src={situation.photo} alt="" fill sizes="128px" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex w-full max-w-[687.5px] flex-col items-center gap-14 sm:gap-12">
          <div className="flex flex-col items-center gap-4 px-6 text-center sm:gap-5 sm:px-0">
            <motion.h1
              className="type-hero"
              initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.06, ease }}
            >
              Hello, Nepal
            </motion.h1>
            <motion.p
              className="text-xl text-ink-2 sm:text-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.28 }}
            >
              Whatever you need from government, ask here.
            </motion.p>
          </div>

          <div className="relative w-full">
            <motion.div
              className="absolute inset-x-3 top-3 z-20 sm:inset-x-4 sm:top-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.46 }}
              data-hero-ask
            >
              <AskBox
                label="Describe what you need"
                hint={
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={lang}
                      lang={lang === "ne" ? "ne" : undefined}
                      className="block"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                    >
                      {HINTS[lang]}
                    </motion.span>
                  </AnimatePresence>
                }
                placeholder={
                  <AnimatePresence mode="wait">
                    <motion.span key={`${situation.id}-${lang}`} className="flex items-baseline">
                      <span className="mr-[0.28em]">Try</span>
                      <WordReveal text={`‘${situation.prompts[lang]}’`} lang={lang === "ne" ? "ne" : undefined} />
                    </motion.span>
                  </AnimatePresence>
                }
              />
            </motion.div>

            <motion.div
              role="region"
              aria-roledescription="carousel"
              aria-label="Example questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.62 }}
            >
              <Track step={step} count={count} />
              <p aria-live="polite" className="sr-only">
                Example {index + 1} of {count}: {situation.prompts.en}. {situation.alt}
              </p>
            </motion.div>

            <motion.div
              className="relative z-20 mt-10 flex items-center justify-center gap-2.5 sm:mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.38 }}
            >
              <Control label="Previous example" onClick={() => go(-1)}>
                <icons.chevronLeft className="size-5" />
              </Control>
              <Control
                label={playing ? "Pause the example questions" : "Play the example questions"}
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <icons.pause className="size-5" /> : <icons.play className="size-[18px]" />}
              </Control>
              <Control label="Next example" onClick={() => go(1)}>
                <icons.chevronRight className="size-5" />
              </Control>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Track({ step, count }: { step: number; count: number }) {
  const index = ((step % count) + count) % count;

  return (
    <div className="squircle relative aspect-[400/493] w-full overflow-hidden rounded-[40px] bg-snow sm:aspect-[551/367] sm:rounded-[48px]">
      <motion.div
        className="absolute inset-0"
        animate={{ x: `${-step * 100}%` }}
        transition={{ duration: 0.75, ease }}
      >
        {situations.map((situation, i) => {
          // Place each slide at the copy nearest the current step, so wrapping never shows a gap.
          const position = i + count * Math.round((step - i) / count);
          const near = Math.abs(position - step) <= 1;
          return (
            <div
              key={situation.id}
              role="group"
              aria-roledescription="slide"
              aria-hidden={i !== index}
              aria-label={`Example ${i + 1} of ${count}: ${situation.prompts.en}`}
              className="absolute inset-y-0 w-full"
              style={{ left: `${position * 100}%` }}
            >
              {near && (
                <Image
                  src={situation.photo}
                  alt={situation.alt}
                  fill
                  sizes="(min-width: 768px) 690px, 100vw"
                  placeholder="blur"
                  preload={i === 0}
                  loading={i === 0 ? "eager" : undefined}
                  className="object-cover"
                />
              )}
              {situation.id === "marriage" && i === index && <Petals />}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

/** A few rhododendron petals drifting down on the wedding slide. */
function Petals() {
  const petals = [
    { x: 18, d: 0, s: 1 },
    { x: 42, d: 1.2, s: 0.8 },
    { x: 64, d: 0.5, s: 1.1 },
    { x: 82, d: 1.9, s: 0.9 },
    { x: 30, d: 2.6, s: 0.7 },
  ];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-[60%_40%_60%_40%] bg-crimson/80"
          style={{ left: `${p.x}%`, scale: p.s }}
          initial={{ y: "-10%", opacity: 0, rotate: 0 }}
          animate={{ y: ["0%", "3200%"], x: [0, 24, -12, 18], opacity: [0, 1, 1, 0], rotate: [0, 120, 240, 360] }}
          transition={{ duration: 6, delay: p.d, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function Control({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-14 place-items-center rounded-full border border-[#0026640a] bg-control text-ink shadow-soft backdrop-blur-md transition-[background-color,scale] hover:bg-[#e3e4e6] active:scale-95"
    >
      {children}
    </button>
  );
}
