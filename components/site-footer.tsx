import Link from "next/link";
import { BsDate } from "./bs-date";
import { icons } from "./icons";

function Rhododendron({ className }: { className?: string }) {
  // Lali gurans, Nepal's national flower.
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse key={angle} cx="0" cy="-21" rx="16" ry="23" fill="#dc143c" transform={`rotate(${angle})`} />
      ))}
      <circle r="10" fill="#a10d2c" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <circle key={angle} cx="0" cy="-14" r="2" fill="#f5d36b" transform={`rotate(${angle + 30})`} />
      ))}
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Sodhnus",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#sources", label: "Sources" },
      { href: "/#languages", label: "Languages" },
      { href: "/#privacy", label: "Privacy" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/credits", label: "Photo and map credits" },
      { href: "/#about", label: "Why we built it" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-container pt-32 pb-40 sm:pt-44">
      <div className="site-grid gap-y-12">
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="col-span-6 md:col-span-3">
            <p className="text-[13px] text-ink-3">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[15px] text-ink transition-colors hover:text-blue">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="col-span-12 md:col-span-4 md:col-start-9">
          <label htmlFor="language" className="text-[13px] text-ink-3">
            Language
          </label>
          <div className="relative mt-4 w-fit">
            <select
              id="language"
              defaultValue="en"
              className="block appearance-none rounded-full border border-line bg-white py-2.5 pr-11 pl-5 text-[15px] transition-colors hover:border-ink-4"
            >
              <option value="en">English</option>
              <option value="ne" disabled>
                नेपाली (coming soon)
              </option>
            </select>
            <icons.chevronRight className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rotate-90 text-ink-2" />
          </div>
        </div>
      </div>

      <div className="mt-24 flex items-end justify-between gap-6 sm:mt-32">
        <p lang="ne" className="font-deva text-[clamp(5rem,20vw,15rem)] leading-[0.9] font-medium tracking-[-0.02em] text-navy">
          सोध्नुस्
        </p>
        <Rhododendron className="mb-[3%] size-[clamp(3rem,8vw,6.5rem)] shrink-0" />
      </div>

      <div className="mt-10 grid gap-6 border-t border-line pt-8 text-[13px] text-ink-3 md:grid-cols-3">
        <p className="text-ink-2">
          Government shouldn’t be hard to understand.
          <span lang="ne" className="block">
            सरकार बुझ्न गाह्रो हुनु पर्दैन।
          </span>
        </p>
        <p>An independent project. Not affiliated with, or endorsed by, the Government of Nepal.</p>
        <p lang="ne" className="md:text-right">
          <BsDate />
        </p>
      </div>
    </footer>
  );
}
