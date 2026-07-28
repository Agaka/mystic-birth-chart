import test from "node:test";
import assert from "node:assert/strict";
import { calculateFullChart, type AspectType, type ChartAspect } from "../src/fullChart.ts";

const birth = {
  date: "2002-08-18",
  time: "11:05",
  latitude: -30.0346,
  longitude: -51.2177,
  timezone: "America/Sao_Paulo",
};

function close(actual: number, expected: number, tolerance = 0.2): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} degrees of ${expected}`);
}

test("calculates the complete technical chart used by the Essential report", () => {
  const chart = calculateFullChart(birth);

  close(chart.angles.ascendant.longitude, 229.88);
  close(chart.angles.midheaven.longitude, 124.47);
  close(chart.placements.find((item) => item.body === "Sun")!.longitude, 145.47);
  close(chart.placements.find((item) => item.body === "Moon")!.longitude, 274.8);
  close(chart.placements.find((item) => item.body === "Mars")!.longitude, 142.98);
  close(chart.placements.find((item) => item.body === "Jupiter")!.longitude, 123.69);

  const sun = chart.placements.find((item) => item.body === "Sun")!;
  const mars = chart.placements.find((item) => item.body === "Mars")!;
  assert.equal(sun.sign, "Leo");
  assert.equal(sun.house, 10);
  assert.equal(sun.dignity, "domicile");
  assert.equal(mars.sign, "Leo");
  assert.equal(mars.house, 10);
  assert.equal(chart.chartRuler, "Mars");
  assert.equal(chart.sect, "Day chart");
});

test("finds tight aspects and ranks chart-specific dominant signatures", () => {
  const chart = calculateFullChart(birth);
  const aspect = (a: ChartAspect["body1"], b: ChartAspect["body1"], type: AspectType) => chart.aspects.find((item) =>
    item.type === type && [item.body1, item.body2].includes(a) && [item.body1, item.body2].includes(b));

  close(aspect("Sun", "Mars", "conjunction")!.orb, 2.48, 0.1);
  close(aspect("Jupiter", "Midheaven", "conjunction")!.orb, 0.78, 0.1);
  close(aspect("Sun", "Uranus", "opposition")!.orb, 1.45, 0.1);
  close(aspect("Sun", "Saturn", "sextile")!.orb, 1.11, 0.1);
  close(aspect("Saturn", "Uranus", "trine")!.orb, 0.34, 0.1);

  assert.equal(chart.dominantSignatures.length, 3);
  const evidence = chart.dominantSignatures.map((item) => item.evidence).join(" | ");
  assert.match(evidence, /Sun.*Mars|Mars.*Sun/);
  assert.doesNotMatch(evidence, /Uranus|Neptune|Pluto/);
  assert.ok(chart.dominantSignatures.every((signature) => !chart.aspects.some((aspect) => aspect.outOfSign && signature.title.includes(aspect.body1) && signature.title.includes(aspect.body2))));
});

test("records every major essential dignity instead of flattening Mercury in Virgo", () => {
  const chart = calculateFullChart(birth);
  const mercury = chart.placements.find((item) => item.body === "Mercury")!;

  assert.deepEqual(mercury.dignities, ["domicile", "exaltation"]);
  assert.deepEqual(chart.placements.find((item) => item.body === "Mars")!.dignities, []);
});

test("keeps an out-of-sign aspect secondary to the chart ruler and sect light", () => {
  const chart = calculateFullChart({
    date: "2000-09-27",
    time: "01:28",
    latitude: -30.0328,
    longitude: -51.2302,
    timezone: "America/Sao_Paulo",
  });

  assert.equal(chart.chartRuler, "Moon");
  assert.equal(chart.sect, "Night chart");
  const moonSaturn = chart.aspects.find((aspect) => aspect.type === "trine" && [aspect.body1, aspect.body2].includes("Moon") && [aspect.body1, aspect.body2].includes("Saturn"));
  assert.equal(moonSaturn?.outOfSign, true);
  assert.equal(chart.dominantSignatures[0].title, "Moon as chart ruler and sect light in Virgo, whole-sign house 3");
  assert.ok(chart.dominantSignatures[0].score >= 270, "chart ruler should also receive first-house rulership weight");
  assert.ok(chart.dominantSignatures.every((signature) => !/Uranus|Neptune|Pluto/.test(signature.title)));
  assert.ok(chart.dominantSignatures.some((signature) => signature.supportingModernEvidence.some((evidence) => /Neptune/.test(evidence))));
});

test("uses the Sun's observed altitude for sect near the horizon", () => {
  const chart = calculateFullChart({ ...birth, time: "07:00" });

  assert.equal(chart.sect, "Day chart");
});
