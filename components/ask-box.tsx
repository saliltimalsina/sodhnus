"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { icons } from "./icons";

type Props = {
  /** Shown while the field is empty, e.g. the rotating example questions. */
  placeholder: ReactNode;
  label: string;
  size?: "hero" | "dock";
  /** A small label beside the mic, e.g. the language of the example. */
  hint?: ReactNode;
};

export function AskBox({ placeholder, label, size = "hero", hint }: Props) {
  const fieldId = useId();
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState(false);
  const hero = size === "hero";

  return (
    <div className="relative w-full">
      <form
        aria-label={label}
        onSubmit={(event) => {
          event.preventDefault();
          if (value.trim()) setNotice(true);
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
            onChange={(event) => {
              setValue(event.target.value);
              setNotice(false);
            }}
            autoComplete="off"
            className="relative z-10 w-full bg-transparent py-1.5 outline-none"
          />
          {!value && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap text-ink-2 [mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent)]"
            >
              {placeholder}
            </div>
          )}
        </div>
        {hint && <div className="hidden w-8 shrink-0 text-center text-[11px] font-medium tracking-wide text-ink-3 sm:block">{hint}</div>}
        <button
          type="button"
          aria-label="Ask by voice"
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-control"
        >
          <icons.mic className="size-5" />
        </button>
        <button
          type="submit"
          aria-label="Send"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-deep text-white transition-[background-color,scale] hover:bg-navy active:scale-95"
        >
          <icons.arrow className="size-[18px]" strokeWidth="2" />
        </button>
      </form>
      <AnimatePresence>
        {notice && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`absolute inset-x-0 z-20 mx-auto w-fit rounded-full bg-navy px-4 py-2 text-sm text-white shadow-glass ${hero ? "top-full mt-3" : "bottom-full mb-3"}`}
          >
            Sodhnus is in preview. Answers aren’t connected yet.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
