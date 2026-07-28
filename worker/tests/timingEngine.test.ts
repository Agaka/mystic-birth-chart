import assert from "node:assert/strict";
import test from "node:test";
import { calculateFullChart, calculateFullChartAtUtc } from "../src/fullChart.ts";
import { buildTimingCycle, selectPrincipalEvents } from "../src/timingEngine.ts";

const chart = calculateFullChart({ date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });
const natal = {
  birth: { date: "2002-08-18", time: "11:05", location: "Porto Alegre, Brazil", timezone: "America/Sao_Paulo", utcOffset: -3, latitude: -30.0346, longitude: -51.2177 },
  chart,
  focus: "general",
};

function angularDistance(a: number, b: number): number {
  return Math.abs(((a - b + 540) % 360) - 180);
}

test("refines transit events to a substantially tighter exact time than a daily sample", () => {
  const cycle = buildTimingCycle(natal, new Date("2026-07-01T00:00:00Z"), new Date("2026-10-01T00:00:00Z"));
  assert.ok(cycle.events.length >= 3);
  const event = cycle.events[0]!;
  const sky = calculateFullChartAtUtc({ latitude: natal.birth.latitude, longitude: natal.birth.longitude, timezone: natal.birth.timezone }, new Date(event.exactAt));
  const transit = sky.placements.find((item) => item.body === event.transit)!;
  const target = event.target === "Ascendant" ? chart.angles.ascendant.longitude : event.target === "Midheaven" ? chart.angles.midheaven.longitude : chart.placements.find((item) => item.body === event.target)!.longitude;
  const exactAngle = { conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180 }[event.aspect];
  assert.ok(Math.abs(angularDistance(transit.longitude, target) - exactAngle) < 0.02);
  assert.ok(Date.parse(event.applyingAt) < Date.parse(event.exactAt));
  assert.ok(Date.parse(event.separatingAt) > Date.parse(event.exactAt));
});

test("changes annual profection on the birthday inside a forecast", () => {
  const cycle = buildTimingCycle(natal, new Date("2026-07-01T00:00:00Z"), new Date("2026-10-01T00:00:00Z"));
  assert.deepEqual(cycle.profections.map((period) => ({ startsAt: period.startsAt.slice(0, 10), house: period.house, sign: period.sign, lord: period.lordOfYear })), [
    { startsAt: "2026-07-01", house: 12, sign: "Libra", lord: "Venus" },
    { startsAt: "2026-08-18", house: 1, sign: "Scorpio", lord: "Mars" },
  ]);
});

test("groups independent timing events that converge inside a seven-day window", () => {
  const cycle = buildTimingCycle(natal, new Date("2026-01-01T00:00:00Z"), new Date("2027-01-01T00:00:00Z"));
  assert.ok(cycle.convergences.every((group) => group.events.length >= 2));
  assert.ok(cycle.convergences.every((group) => Date.parse(group.endsAt) - Date.parse(group.startsAt) <= 7 * 86_400_000));
});

test("annual selection keeps no more than fifteen structurally important events", () => {
  const cycle = buildTimingCycle(natal, new Date("2026-01-01T00:00:00.000Z"), new Date("2027-01-01T00:00:00.000Z"));
  const selected = selectPrincipalEvents(cycle, natal, 15);
  assert.ok(selected.events.length <= 15);
  assert.ok(selected.events.some((event) => event.target === natal.chart.chartRuler || event.target === "Sun" || event.target === "Moon"));
  assert.ok(selected.months.every((month) => month.eventIndexes.every((index) => index < selected.events.length)));
});
