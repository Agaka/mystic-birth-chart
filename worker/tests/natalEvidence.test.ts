import assert from "node:assert/strict";
import test from "node:test";
import { calculateFullChart, type FullChart } from "../src/fullChart.ts";
import { buildNatalEvidence } from "../src/natalEvidence.ts";

const portoAlegre = calculateFullChart({
  date: "2002-08-18",
  time: "11:05",
  latitude: -30.0346,
  longitude: -51.2177,
  timezone: "America/Sao_Paulo",
});

test("builds twelve house judgments with traditional rulers and occupants", () => {
  const evidence = buildNatalEvidence(portoAlegre);
  assert.equal(evidence.houses.length, 12);
  assert.deepEqual(
    evidence.houses.map(({ house, sign, ruler }) => ({ house, sign, ruler })),
    [
      { house: 1, sign: "Scorpio", ruler: "Mars" },
      { house: 2, sign: "Sagittarius", ruler: "Jupiter" },
      { house: 3, sign: "Capricorn", ruler: "Saturn" },
      { house: 4, sign: "Aquarius", ruler: "Saturn" },
      { house: 5, sign: "Pisces", ruler: "Jupiter" },
      { house: 6, sign: "Aries", ruler: "Mars" },
      { house: 7, sign: "Taurus", ruler: "Venus" },
      { house: 8, sign: "Gemini", ruler: "Mercury" },
      { house: 9, sign: "Cancer", ruler: "Moon" },
      { house: 10, sign: "Leo", ruler: "Sun" },
      { house: 11, sign: "Virgo", ruler: "Mercury" },
      { house: 12, sign: "Libra", ruler: "Venus" },
    ],
  );
  assert.ok(evidence.houses.every((house) => house.rulerPlacement.body === house.ruler));
});

test("detects a literal mutual domicile reception", () => {
  const chart = structuredClone(portoAlegre) as FullChart;
  const venus = chart.placements.find((placement) => placement.body === "Venus")!;
  const mars = chart.placements.find((placement) => placement.body === "Mars")!;
  venus.sign = "Aries"; venus.longitude = 10; venus.degree = 10; venus.degreeLabel = "10°00′";
  mars.sign = "Taurus"; mars.longitude = 40; mars.degree = 10; mars.degreeLabel = "10°00′";
  const evidence = buildNatalEvidence(chart);
  assert.ok(evidence.receptions.some((item) => item.kind === "mutual-domicile" && item.planets.includes("Venus") && item.planets.includes("Mars")));
});

test("relationship and vocation packets begin with their governing houses", () => {
  const evidence = buildNatalEvidence(portoAlegre);
  assert.equal(evidence.relationship.governingHouse.house, 7);
  assert.equal(evidence.relationship.governingHouse.ruler, "Venus");
  assert.equal(evidence.vocation.governingHouse.house, 10);
  assert.equal(evidence.vocation.governingHouse.ruler, "Sun");
  assert.equal(evidence.vocation.lots.fortune.sign, portoAlegre.lots.fortune.sign);
  assert.equal(evidence.vocation.lots.spirit.sign, portoAlegre.lots.spirit.sign);
});

test("builds complete dispositor chains without infinite loops", () => {
  const evidence = buildNatalEvidence(portoAlegre);
  assert.equal(evidence.dispositors.length, 7);
  assert.ok(evidence.dispositors.every((item) => item.chain.length >= 1 && item.chain.length <= 8));
  assert.ok(evidence.dispositors.every((item) => item.terminatesIn === "self" || item.terminatesIn === "mutual-reception" || item.terminatesIn === "cycle"));
});
