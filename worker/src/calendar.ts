import { createHash } from "node:crypto";
import type { TimingCycle } from "./timingEngine.ts";

function escape(value: string): string { return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
function stamp(value: string): string { return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"); }
function day(value: string): string { return value.slice(0, 10); }
function fold(line: string): string[] {
  const values: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest, "utf8") > 73) {
    let cut = 73;
    while (Buffer.byteLength(rest.slice(0, cut), "utf8") > 73) cut -= 1;
    values.push(rest.slice(0, cut)); rest = ` ${rest.slice(cut)}`;
  }
  values.push(rest); return values;
}

export function createTimingCalendar(timing: TimingCycle, title: string): string {
  const generated = stamp(new Date().toISOString());
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mystic Birth Chart//Annual Timing//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${escape(title)}`];
  for (const event of timing.events) {
    const summary = `${event.transit} ${event.aspect} ${event.target}`;
    const uid = createHash("sha256").update(`${event.exactAt}|${summary}`).digest("hex").slice(0, 24);
    lines.push("BEGIN:VEVENT", `UID:${uid}@mysticbirthchart.com`, `DTSTAMP:${generated}`, `DTSTART:${stamp(event.exactAt)}`, `SUMMARY:${escape(summary)}`, `CATEGORIES:${event.category.toUpperCase()}`, `DESCRIPTION:${escape(`Application: ${day(event.applyingAt)}\nExact: ${day(event.exactAt)}\nSeparation: ${day(event.separatingAt)}\nDirection: ${event.direction}\nAstrological timing describes a window for attention, not a guaranteed event.`)}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.flatMap(fold).join("\r\n") + "\r\n";
}
