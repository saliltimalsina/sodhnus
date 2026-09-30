"use client";

import { useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useAsk } from "./ask-context";
import { icons } from "./icons";

type Props = {
  /** Shown while the field is empty, e.g. the rotating example questions. */
  placeholder: ReactNode;
  label: string;
  size?: "hero" | "dock";
  /** A small label beside the mic, e.g. the language of the example. */
  hint?: ReactNode;
};

type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};
type RecognitionConstructor = new () => Recognition;

const speechRecognition = () =>
  (window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor })
    .SpeechRecognition ??
  (window as unknown as { webkitSpeechRecognition?: RecognitionConstructor }).webkitSpeechRecognition;

const subscribe = () => () => {};

export function AskBox({ placeholder, label, size = "hero", hint }: Props) {
  const fieldId = useId();
  const ask = useAsk();
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  // Voice input only where the browser supports speech recognition; decided after hydration.
  const canListen = useSyncExternalStore(subscribe, () => !!speechRecognition(), () => false);
  const hero = size === "hero";

  const listen = () => {
    if (listening) {
      recognition.current?.stop();
      return;
    }
    const Speech = speechRecognition();
    if (!Speech) return;
    const r = new Speech();
    r.lang = "ne-NP";
    r.interimResults = true;
    r.onresult = (event) => setValue(Array.from(event.results, (result) => result[0].transcript).join(""));
    r.onend = () => setListening(false);
    recognition.current = r;
    setListening(true);
    r.start();
  };

  return (
    <form
      aria-label={label}
      onSubmit={(event) => {
        event.preventDefault();
        const question = value.trim();
        if (!question) return;
        recognition.current?.stop();
        ask(question);
        setValue("");
      }}
      className={`squircle flex w-full cursor-text items-center gap-1 border border-transparent bg-white shadow-composer outline-1 outline-ink-4 transition-[outline-color] duration-700 focus-within:outline-ink-3 ${
        hero ? "min-h-16 rounded-[32px] py-2.5 pr-3 pl-6 sm:min-h-0 sm:rounded-[48px] sm:py-[23px] sm:pr-[23px] sm:pl-10" : "min-h-14 rounded-full py-2 pr-2 pl-6"
      }`}
    >
      <label htmlFor={fieldId} className="sr-only">
        {label}
      </label>
      <div className={`relative min-w-0 flex-1 ${hero ? "text-base sm:text-[1.3125rem]" : "text-base"}`}>
        <input
          id={fieldId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={500}
          autoComplete="off"
          className="relative z-10 w-full bg-transparent py-1.5 outline-none"
        />
        {!value && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap text-ink-2 [mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent)]"
          >
            {listening ? "Listening… बोल्नुहोस्" : placeholder}
          </div>
        )}
      </div>
      {hint && <div className="hidden w-8 shrink-0 text-center text-[11px] font-medium tracking-wide text-ink-3 sm:block">{hint}</div>}
      {canListen && (
        <button
          type="button"
          onClick={listen}
          aria-label={listening ? "Stop listening" : "Ask by voice"}
          aria-pressed={listening}
          className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors ${
            listening ? "animate-pulse bg-blush text-crimson" : "text-ink hover:bg-control"
          }`}
        >
          <icons.mic className="size-5" />
        </button>
      )}
      <button
        type="submit"
        aria-label="Send"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-deep text-white transition-[background-color,scale] hover:bg-navy active:scale-95"
      >
        <icons.arrow className="size-[18px]" strokeWidth="2" />
      </button>
    </form>
  );
}
