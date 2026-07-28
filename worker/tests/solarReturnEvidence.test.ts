import assert from "node:assert/strict";
import test from "node:test";
import { calculateFullChart } from "../src/fullChart.ts";
import { buildSolarReturnEvidence } from "../src/reportFacts.ts";

const natal = calculateFullChart({ date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });
const annual = calculateFullChart({ date: "2026-08-18", time: "15:00", latitude: 38.7223, longitude: -9.1393, timezone: "Europe/Lisbon" });

test("solar return evidence calculates rulers, angularity, natal overlays, and cross-chart aspects", () => {
  const evidence = buildSolarReturnEvidence(natal, annual);
  assert.ok(evidence.ascendantRuler);
  assert.ok(evidence.midheavenRuler);
  assert.equal(evidence.natalOverlays.length, annual.placements.length);
  assert.ok(evidence.occupiedHouses.length > 0);
  assert.ok(evidence.returnToNatalAspects.length > 0);
  assert.ok(evidence.returnToNatalAspects.every((item) => /^\d+\u00b0\d{2}\u2032$/.test(item.orbLabel)));
});
