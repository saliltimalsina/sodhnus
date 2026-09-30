"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { icons } from "./icons";

type Props = { open: boolean; onClose: () => void; label: string; children: ReactNode; side?: "top" | "bottom" };

/** A modal panel that slides in from the top (menu) or bottom (notices). */
export function Sheet({ open, onClose, label, children, side = "top" }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      previous?.focus();
    };
  }, [open, onClose]);

  const offset = side === "top" ? "-100%" : "100%";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-navy/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
            className={`absolute inset-x-0 bg-white outline-none ${side === "top" ? "top-0 rounded-b-[40px]" : "bottom-0 rounded-t-[40px]"} squircle shadow-glass`}
            initial={{ y: offset }}
            animate={{ y: 0 }}
            exit={{ y: offset }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-control transition-colors hover:bg-[#e8e8e8] sm:top-7 sm:right-8"
            >
              <icons.close className="size-5" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
