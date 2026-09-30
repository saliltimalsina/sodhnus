import type { Metadata } from "next";
import Link from "next/link";
import credits from "@/data/photo-credits.json";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Credits — Sodhnus" };

export default function Credits() {
  return (
    <>
      <SiteHeader />
      <main className="site-container max-w-3xl py-20">
        <h1 className="type-hero">Credits</h1>
        <p className="mt-6 text-lg text-ink-2">
          Photos come from Wikimedia Commons and are used under their Creative Commons licences. They have been
          resized, cropped and colour-graded for this site.
        </p>
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {Object.entries(credits).map(([id, photo]) => (
            <li key={id} className="py-5">
              <a href={photo.source} className="font-medium underline-offset-4 hover:underline">
                {photo.title.replace(/\.(jpe?g)$/i, "")}
              </a>
              <p className="mt-1 text-ink-2">
                by {photo.author} ·{" "}
                <a href={photo.licenseUrl} className="underline underline-offset-4">
                  {photo.license}
                </a>
              </p>
            </li>
          ))}
        </ul>
        <h2 className="type-heading mt-16">Map data</h2>
        <p className="mt-4 text-ink-2">
          Local government boundaries from{" "}
          <a href="https://github.com/mesaugat/geoJSON-Nepal" className="underline underline-offset-4">
            geoJSON-Nepal
          </a>{" "}
          (MIT licence), reduced to one point per local government.
        </p>
        <Link href="/" className="underline-link mt-12 inline-block">
          Back to Sodhnus
        </Link>
      </main>
    </>
  );
}
