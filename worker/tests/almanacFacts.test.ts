import assert from "node:assert/strict";
import test from "node:test";
import { calculateFullChart } from "../src/fullChart.ts";
import { buildMonthlyLunations } from "../src/reportFacts.ts";

const chart = calculateFullChart({ date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });
const natal = { birth: { date: "2002-08-18", time: "11:05", location: "Porto Alegre", timezone: "America/Sao_Paulo", utcOffset: -3, latitude: -30.0346, longitude: -51.2177 }, chart, focus: "general" };

test("monthly Almanac calculates the New Moon and Full Moon in natal houses", () => {
  const values = buildMonthlyLunations(natal, new Date("2026-09-01T00:00:00.000Z"), new Date("2026-10-01T00:00:00.000Z"));
  assert.ok(values.some((item) => item.kind === "New Moon"));
  assert.ok(values.some((item) => item.kind === "Full Moon"));
  assert.ok(values.every((item) => item.natalHouse >= 1 && item.natalHouse <= 12));
  assert.ok(values.every((item) => item.exactAt >= "2026-09-01" && item.exactAt < "2026-10-01"));
});
