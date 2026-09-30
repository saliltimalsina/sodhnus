import type { ReactNode } from "react";
import { DeviceArt, LanguagesArt, NoticeArt, PrivacyArt, SourcesArt } from "./artworks";
import { CollageArt } from "./collage-art";
import { MapArt } from "./map-art";

type Row = { id?: string; title: string; ne?: string; body: string; link?: { href: string; label: string }; art: ReactNode };

const ROWS: Row[] = [
  {
    id: "how-it-works",
    title: "1,500+ websites into one.",
    ne: "१,५००+ वेबसाइट, एउटै ठाउँमा",
    body: "No more wandering from site to site. Sodhnus brings Nepal’s government websites together in one place.",
    link: { href: "#many-offices", label: "See how it works" },
    art: <CollageArt />,
  },
  {
    title: "753 local governments. One place to ask.",
    body: "From ward offices in Jumla to ministries in Singha Durbar, Sodhnus reads the official websites so you don’t have to hunt through them.",
    art: <MapArt />,
  },
  {
    id: "sources",
    title: "Clear answers. Official sources.",
    body: "Every answer links to the .gov.np page it came from, so you can check it yourself. If there’s no official source, Sodhnus says so instead of guessing.",
    art: <SourcesArt />,
  },
  {
    id: "languages",
    title: "Ask in the language you think in.",
    body: "Type in English, नेपाली or Roman Nepali, the way you’d text a friend. You get the same official answer back in the language you choose.",
    art: <LanguagesArt />,
  },
  {
    title: "Government language, in plain words.",
    body: "Official notices are written for lawyers. Sodhnus turns them into short steps you can act on, and keeps the original a tap away.",
    art: <NoticeArt />,
  },
  {
    id: "privacy",
    title: "Sodhnus keeps your questions private.",
    body: "Your questions aren’t tied to your name, and your conversation disappears when you leave.",
    art: <PrivacyArt />,
  },
  {
    title: "No app to download.",
    body: "Sodhnus runs in any browser, on any phone or computer, and is built to load quickly on mobile data.",
    link: { href: "#top", label: "Ask a question" },
    art: <DeviceArt />,
  },
];

export function FeatureRows() {
  return (
    <section className="site-container space-y-24 pb-32 sm:space-y-40 sm:pb-44">
      {ROWS.map((row) => (
        <div key={row.title} id={row.id} className="site-grid scroll-mt-16 items-center gap-y-10">
          <div className="col-span-12 md:col-span-6 lg:col-span-4 lg:col-start-3">{row.art}</div>
          <div className="col-span-12 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-8">
            {row.ne && (
              <p lang="ne" className="mb-2 text-[15px] text-crimson">
                {row.ne}
              </p>
            )}
            <h2 className="type-heading text-balance">{row.title}</h2>
            <p className="mt-4 max-w-md text-[17px] leading-[1.65] text-ink-2">{row.body}</p>
            {row.link && (
              <a href={row.link.href} className="underline-link mt-6 inline-block">
                {row.link.label}
              </a>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
