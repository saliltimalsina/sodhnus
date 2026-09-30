"use client";

import { useReducedMotion } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import education from "@/public/sites/education.jpg";
import health from "@/public/sites/health.jpg";
import ird from "@/public/sites/ird.jpg";
import land from "@/public/sites/land.jpg";
import noc from "@/public/sites/noc.jpg";
import transport from "@/public/sites/transport.jpg";
import { icons } from "../icons";

// Screenshots of real government websites, cropped differently so six pages read as many.
type Tile = { src: StaticImageData; aspect: string; position: string; dim?: boolean };

const COLUMNS: { tiles: Tile[]; duration: number; reverse?: boolean }[] = [
  {
    duration: 38,
    tiles: [
      { src: transport, aspect: "16/10", position: "0% 0%" },
      { src: ird, aspect: "4/3", position: "50% 60%", dim: true },
      { src: health, aspect: "16/11", position: "40% 70%" },
      { src: noc, aspect: "16/9", position: "0% 0%" },
    ],
  },
  {
    duration: 46,
    reverse: true,
    tiles: [
      { src: land, aspect: "4/3", position: "30% 0%" },
      { src: education, aspect: "16/10", position: "50% 70%" },
      { src: transport, aspect: "4/3", position: "60% 75%", dim: true },
      { src: ird, aspect: "16/9", position: "50% 30%" },
    ],
  },
  {
    duration: 42,
    tiles: [
      { src: health, aspect: "16/10", position: "0% 0%" },
      { src: land, aspect: "4/3", position: "45% 80%" },
      { src: noc, aspect: "4/3", position: "90% 40%", dim: true },
      { src: education, aspect: "16/10", position: "0% 0%" },
    ],
  },
];

/** A dark card of government websites drifting past, like America.gov's "29,000 websites" artwork. */
export function CollageArt() {
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const state = playing && !reduceMotion ? "running" : "paused";

  return (
    <div className="squircle relative aspect-square w-full overflow-hidden rounded-[40px] bg-black">
      <div aria-hidden="true" className="absolute inset-[-6%] grid rotate-[-4deg] grid-cols-3 gap-2.5">
        {COLUMNS.map((column, c) => (
          <div key={c} className="overflow-hidden">
            <div
              className="flex flex-col gap-2.5"
              style={{
                animation: `${column.reverse ? "collage-down" : "collage-up"} ${column.duration}s linear infinite`,
                animationPlayState: state,
              }}
            >
              {[0, 1].map((copy) =>
                column.tiles.map((tile, i) => (
                  <div
                    key={`${copy}-${i}`}
                    className={`relative w-full overflow-hidden rounded-[6px] bg-[#111] ${tile.dim ? "opacity-45" : ""}`}
                    style={{ aspectRatio: tile.aspect }}
                  >
                    <Image
                      src={tile.src}
                      alt=""
                      fill
                      sizes="220px"
                      className="object-cover"
                      style={{ objectPosition: tile.position }}
                    />
                  </div>
                )),
              )}
            </div>
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_45%,transparent,rgba(0,0,0,0.55))]" />

      <p id="collage-desc" className="sr-only">
        Screenshots of government websites, including the Department of Transport Management, Inland Revenue
        Department and Ministry of Health, drift past in columns.
      </p>
      {!reduceMotion && (
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause animation" : "Play animation"}
          aria-describedby="collage-desc"
          className="absolute right-6 bottom-6 grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80"
        >
          {playing ? <icons.pause className="size-5" strokeWidth="2.4" /> : <icons.play className="size-4" />}
        </button>
      )}
    </div>
  );
}
