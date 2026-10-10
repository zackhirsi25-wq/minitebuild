"use client";

import { useSyncExternalStore } from "react";
import { statusAt, statusLabel, type DayStatus } from "./hours";

// "Open now · closes 6pm", worked out in the visitor's browser (visitors to a
// local business are almost always in its time zone). Renders nothing on the
// server and when the hours can't be read, so it never shows a wrong guess.

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}
const minuteKey = () => Math.floor(Date.now() / 60_000);
const serverKey = () => null;

export function OpenStatus({ hours, className, dotClass }: { hours: string[]; className?: string; dotClass?: string }) {
  const key = useSyncExternalStore(subscribe, minuteKey, serverKey);
  if (key === null || hours.length === 0) return null;
  const now = new Date(key * 60_000);
  const status: DayStatus | null = statusAt(hours, now.getDay(), now.getHours() * 60 + now.getMinutes());
  if (!status) return null;
  const open = status.kind === "open" || status.kind === "always";
  return (
    <span className={className} data-open={open ? "true" : "false"}>
      <span aria-hidden="true" className={dotClass} />
      {statusLabel(status)}
    </span>
  );
}
