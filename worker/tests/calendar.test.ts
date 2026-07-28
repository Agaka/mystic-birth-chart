import assert from "node:assert/strict";
import test from "node:test";
import { createTimingCalendar } from "../src/calendar.ts";
import type { TimingCycle } from "../src/timingEngine.ts";

const timing = {
  period: { startsAt: "2026-01-01T00:00:00.000Z", endsAt: "2027-01-01T00:00:00.000Z", timezone: "America/Sao_Paulo" },
  profections: [], months: [], convergences: [],
  events: [{ applyingAt: "2026-03-01T00:00:00.000Z", exactAt: "2026-03-03T12:30:00.000Z", separatingAt: "2026-03-05T00:00:00.000Z", transit: "Jupiter", target: "Sun", aspect: "trine", exactOrb: 0.001, orbRule: 3, direction: "direct", category: "expansion", technique: "natal transit" }],
} satisfies TimingCycle;

test("creates an importable calendar with application, exactness, and separation", () => {
  const value = createTimingCalendar(timing, "Mystic annual timing");
  assert.match(value, /^BEGIN:VCALENDAR\r\n/);
  assert.match(value, /SUMMARY:Jupiter trine Sun/);
  assert.match(value, /DTSTART:20260303T123000Z/);
  assert.match(value, /Application: 2026-03-01/);
  assert.match(value.replace(/\r\n /g, ""), /Separation: 2026-03-05/);
  assert.match(value, /END:VCALENDAR\r\n$/);
});

test("escapes calendar punctuation", () => {
  const value = createTimingCalendar(timing, "A, B; C");
  assert.match(value, /X-WR-CALNAME:A\\, B\\; C/);
});
