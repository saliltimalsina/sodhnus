// Flag of Nepal, drawn in a 656 × 800 box to match the official construction: two stacked
// crimson pennants with a blue border, a crescent moon holding a half sun above, a 12-ray sun below.

export const FLAG_VIEWBOX = "0 0 656 800";

export const FLAG_OUTER: [number, number][] = [
  [0, 0],
  [656, 410],
  [240, 410],
  [630, 800],
  [0, 800],
];

export const FLAG_INNER: [number, number][] = [
  [22, 40],
  [575, 388],
  [185, 388],
  [575, 775],
  [22, 775],
];

const points = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(" ");

/** Alternating outer/inner points around a centre, over an arc of the circle (angles in degrees, 0 = right). */
function rays(cx: number, cy: number, count: number, outer: number, inner: number, from: number, to: number) {
  const out: [number, number][] = [];
  const steps = count * 2;
  for (let i = 0; i <= steps; i++) {
    const angle = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    const r = i % 2 === 0 ? inner : outer;
    out.push([Math.round(cx + r * Math.cos(angle)), Math.round(cy + r * Math.sin(angle))]);
  }
  return out;
}

// Crescent: the lower half of a circle, hollowed by a flatter ellipse, horns pointing up.
export const MOON_CRESCENT = "M55 262A105 105 0 0 0 265 262A105 50 0 0 1 55 262Z";
// Half sun with eight rays rising out of the crescent (flat base along y = 300).
export const MOON_SUN = points(rays(160, 297, 8, 68, 44, 180, 360));
export const SUN = points(rays(160, 582, 12, 117, 80, -105, 255));

export function FlagEmblems() {
  return (
    <>
      <path d={MOON_CRESCENT} fill="#fff" />
      <polygon points={MOON_SUN} fill="#fff" />
      <polygon points={SUN} fill="#fff" />
    </>
  );
}

export function NepalFlag({ className, title = "Flag of Nepal" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={FLAG_VIEWBOX} className={className} role={title ? "img" : undefined} aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <polygon points={points(FLAG_OUTER)} fill="#003893" />
      <polygon points={points(FLAG_INNER)} fill="#dc143c" />
      <FlagEmblems />
    </svg>
  );
}
