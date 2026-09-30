"use client";

import NepaliDate from "nepali-date-converter";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Today's date in Bikram Sambat, rendered on the client so it never goes stale. */
export function BsDate() {
  const date = useSyncExternalStore(
    subscribe,
    () => new NepaliDate(new Date()).format("YYYY MMMM DD", "np"),
    () => null,
  );
  return date ? <>आज वि.सं. {date}</> : null;
}
