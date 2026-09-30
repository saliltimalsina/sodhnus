"use client";

import Link from "next/link";
import { useState } from "react";
import { NepalFlag } from "./flag";
import { icons } from "./icons";
import { Sheet } from "./sheet";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#sources", label: "Sources" },
  { href: "/#languages", label: "Languages" },
  { href: "/#privacy", label: "Privacy" },
  { href: "/credits", label: "Photo credits" },
];

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState(false);

  return (
    <>
      <div className="bg-[#f5f6f7]">
        <button
          type="button"
          onClick={() => setNotice(true)}
          className="mx-auto flex items-center gap-1.5 px-4 py-2 text-[12px] text-ink-2 transition-colors hover:text-ink"
        >
          An independent service, not the Government of Nepal
          <icons.info className="size-3.5" />
        </button>
      </div>

      <header className="site-container flex items-center justify-between py-5">
        {/* The flag sits on the wordmark's baseline and rises to the height of its ascenders. */}
        <Link href="/" className="flex items-baseline gap-2 font-serif text-[1.6rem] leading-none" aria-label="Sodhnus home">
          <NepalFlag className="h-[0.74em] w-auto" title="" />
          <span className="tracking-[-0.04em]">Sodhnus</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenu(true)}
          className="h-11 rounded-full bg-blue-deep px-5 text-[15px] font-medium text-white transition-[background-color,scale] hover:bg-navy active:scale-[0.98]"
        >
          Menu
        </button>
      </header>

      <Sheet open={menu} onClose={() => setMenu(false)} label="Menu">
        <nav aria-label="Main" className="site-container pt-24 pb-14 sm:pt-28">
          <ul className="space-y-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenu(false)}
                  className="type-display block py-1.5 transition-colors hover:text-blue"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-[15px] text-ink-2">Ask in English, नेपाली or Roman Nepali.</p>
        </nav>
      </Sheet>

      <Sheet open={notice} onClose={() => setNotice(false)} label="About this service">
        <div className="site-container max-w-2xl pt-20 pb-14 sm:pt-24">
          <h2 className="type-heading">An independent service</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">
            Sodhnus is not run by, affiliated with or endorsed by the Government of Nepal. It reads official
            .gov.np websites and links every answer to the page it came from, so you can always check the source
            yourself.
          </p>
        </div>
      </Sheet>
    </>
  );
}
