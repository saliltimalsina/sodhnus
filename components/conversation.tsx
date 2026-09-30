"use client";

import { motion } from "motion/react";
import NepaliDate from "nepali-date-converter";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Answer, Lang, Source } from "@/lib/answer/types";
import { AskBox } from "./ask-box";
import { icons } from "./icons";

export type Turn =
  | { id: number; question: string; state: "loading" }
  | { id: number; question: string; state: "done"; answer: Answer }
  | { id: number; question: string; state: "error"; error: string };

const ease = [0.22, 1, 0.36, 1] as const;

/** Every question asked so far, newest at the bottom, with a box for the next one. */
export function Conversation({ turns }: { turns: Turn[] }) {
  const end = useRef<HTMLDivElement>(null);
  const latest = turns.at(-1);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, latest?.state]);

  return (
    <div className="flex max-h-[88svh] flex-col">
      <div className="overflow-y-auto overscroll-contain">
        <div className="site-container max-w-2xl space-y-12 pt-20 pb-8 sm:pt-24">
          {turns.map((turn) => (
            <section key={turn.id} aria-live="polite" aria-busy={turn.state === "loading"}>
              <p className="ml-auto w-fit max-w-[85%] rounded-3xl rounded-br-lg bg-wash px-5 py-3 text-[17px]">{turn.question}</p>
              <div className="mt-6">
                {turn.state === "loading" && <Thinking />}
                {turn.state === "error" && <p className="text-ink-2">{turn.error}</p>}
                {turn.state === "done" && <AnswerView answer={turn.answer} />}
              </div>
            </section>
          ))}
          <div ref={end} />
        </div>
      </div>
      <div className="site-container max-w-2xl border-t border-line pt-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        <AskBox size="dock" label="Ask another question" placeholder="Ask another question…" />
        <p className="mt-2 text-center text-[11px] text-ink-3">
          Answers can be wrong. Check the linked source before you go. Not the Government of Nepal.
        </p>
      </div>
    </div>
  );
}

const STAGES = [
  "Reading your question",
  "Searching official .gov.np websites",
  "Writing a plain answer from what the sources say",
];

function Thinking() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const timers = [2500, 7000].map((ms, i) => window.setTimeout(() => setStage(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <p className="flex items-center gap-3 text-ink-2">
      <span className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-blue"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </span>
      {STAGES[stage]}…
    </p>
  );
}

const nepali = (lang: Lang) => (lang === "en" ? undefined : "ne");

function AnswerView({ answer }: { answer: Answer }) {
  const lang = nepali(answer.lang);

  if (answer.kind === "emergency") {
    return (
      <div lang={lang} className="rounded-3xl bg-blush p-6">
        <p className="text-lg font-medium text-crimson">{answer.message}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["100", "Police · प्रहरी"],
            ["101", "Fire · दमकल"],
            ["102", "Ambulance · एम्बुलेन्स"],
          ].map(([number, label]) => (
            <a key={number} href={`tel:${number}`} className="rounded-full bg-crimson px-5 py-2.5 font-medium text-white">
              {number} <span className="font-normal opacity-80">{label}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  if (answer.kind === "out-of-scope") return <p lang={lang} className="text-lg text-ink-2">{answer.message}</p>;

  if (answer.kind === "no-source") {
    return (
      <div lang={lang}>
        <p className="text-lg text-ink-2">{answer.message}</p>
        <ul className="mt-4 space-y-2">
          {answer.tryOffices.map((office) => (
            <li key={office.url}>
              <a href={office.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-blue hover:underline">
                {office.name}
                <icons.arrowUpRight className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <motion.article
      lang={lang}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="space-y-7"
    >
      <p className="text-lg leading-relaxed">{answer.summary}</p>

      {answer.documents.length > 0 && (
        <Section title={answer.lang === "en" ? "What to bring" : "चाहिने कागजात"}>
          <ul className="space-y-2.5">
            {answer.documents.map((item) => (
              <li key={item} className="flex gap-3">
                <icons.check className="mt-1 size-4 shrink-0 text-blue" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {answer.steps.length > 0 && (
        <Section title={answer.lang === "en" ? "Steps" : "प्रक्रिया"}>
          <ol className="space-y-3">
            {answer.steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky text-[13px] font-medium text-blue">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {(answer.fees || answer.whereToGo) && (
        <dl className="grid gap-4 rounded-3xl bg-wash-2 p-5 sm:grid-cols-2">
          {answer.fees && <Fact label={answer.lang === "en" ? "Fees" : "शुल्क"} value={answer.fees} />}
          {answer.whereToGo && <Fact label={answer.lang === "en" ? "Where to go" : "कहाँ जाने"} value={answer.whereToGo} />}
        </dl>
      )}

      <Section title={answer.lang === "en" ? "Official sources" : "आधिकारिक स्रोत"}>
        <ul className="divide-y divide-line rounded-3xl border border-line">
          {answer.sources.map((source) => (
            <SourceLink key={source.url} source={source} lang={answer.lang} />
          ))}
        </ul>
      </Section>
    </motion.article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-[13px] font-medium tracking-wide text-ink-3 uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[13px] text-ink-3">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function SourceLink({ source, lang }: { source: Source; lang: Lang }) {
  const date = new Date(source.fetchedAt);
  const checked =
    lang === "en"
      ? `Checked ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
      : `वि.सं. ${new NepaliDate(date).format("YYYY MMMM DD", "np")} मा हेरिएको`;
  return (
    <li>
      <a href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-wash-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{source.title}</p>
          <p className="mt-0.5 text-[13px] text-ink-3">
            {source.office} · {new URL(source.url).hostname} · {checked}
          </p>
        </div>
        <icons.arrowUpRight className="mt-1 size-4 shrink-0 text-ink-3" />
      </a>
    </li>
  );
}
