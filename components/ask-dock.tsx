"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { AskBox } from "./ask-box";

/** A compact ask bar docked to the bottom once the hero's ask box has scrolled away. */
export function AskDock() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero-ask]");
    const footer = document.querySelector("footer");
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const o = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting));
      o.observe(hero);
      observers.push(o);
    }
    if (footer) {
      const o = new IntersectionObserver(([e]) => setFooterVisible(e.isIntersecting), { rootMargin: "0px 0px -120px 0px" });
      o.observe(footer);
      observers.push(o);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const visible = !heroVisible && !footerVisible;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)]"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto w-full max-w-[640px]">
            <p className="mb-2 text-center text-[11px] text-ink-3">
              Answers can be wrong. Always check the linked source ·{" "}
              <a href="#privacy" className="underline underline-offset-2 hover:text-ink">
                Your privacy
              </a>
            </p>
            <AskBox size="dock" label="Ask Sodhnus" placeholder="Ask anything…" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
