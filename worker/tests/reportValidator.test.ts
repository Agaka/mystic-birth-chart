import assert from "node:assert/strict";
import test from "node:test";
import { calculateFullChart } from "../src/fullChart.ts";
import { reportCatalog } from "../src/reportCatalog.ts";
import { normalizeNatalDegreeClaims, validateProductReport, validateRenderedPdf } from "../src/reportValidator.ts";
import type { ProductFacts } from "../src/reportFacts.ts";

const chart = calculateFullChart({ date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });
const facts: ProductFacts = { generatedAt: "2026-07-28T00:00:00.000Z", natalTimeKnown: true, natalReliabilityNote: "Known", natal: { birth: { date: "2002-08-18", time: "11:05", location: "Porto Alegre", timezone: "America/Sao_Paulo", utcOffset: -3, latitude: -30.0346, longitude: -51.2177 }, chart, focus: "general" } };
const words = (count: number) => Array.from({ length: count }, () => "grounded").join(" ");

test("rejects missing chapters, thin output, and unsupported exact aspect claims", () => {
  const blueprint = reportCatalog.love;
  const errors = validateProductReport(blueprint, facts, { title: blueprint.title, introduction: "Sun trine Saturn. Short.", chapters: [], practicalSummary: "Short.", closing: "Short.", scopeNote: "Short." });
  assert.ok(errors.some((item) => item.startsWith("missing-chapter")));
  assert.ok(errors.some((item) => item.startsWith("word-count")));
  assert.ok(errors.some((item) => item.includes("unsupported-aspect")));
});

test("accepts the required chapter structure when content is grounded and in range", () => {
  const blueprint = { ...reportCatalog.love, targetWords: [300, 600] as const };
  const report = { title: blueprint.title, introduction: words(50), chapters: blueprint.chapters.map((chapter) => ({ key: chapter.key, title: chapter.title, body: words(100) })), practicalSummary: words(50), closing: words(30), scopeNote: words(20) };
  assert.deepEqual(validateProductReport(blueprint, facts, report), []);
});

test("rejects invented degrees, dignities, houses, and rulers", () => {
  const blueprint = { ...reportCatalog.love, targetWords: [1, 600] as const };
  const report = {
    title: blueprint.title,
    introduction: "Sun at 1°01′ Aries. Moon is in domicile. Saturn occupies the first house. Venus is the ruler of the first house.",
    chapters: blueprint.chapters.map((chapter) => ({ key: chapter.key, title: chapter.title, body: "Grounded." })),
    practicalSummary: "Grounded.", closing: "Grounded.", scopeNote: "Grounded.",
  };
  const errors = validateProductReport(blueprint, facts, report);
  assert.ok(errors.some((item) => item.startsWith("unsupported-degree")));
  assert.ok(errors.some((item) => item.startsWith("unsupported-dignity")));
  assert.ok(errors.some((item) => item.startsWith("unsupported-house")));
  assert.ok(errors.some((item) => item.startsWith("unsupported-ruler")));
});

test("normalizes exact degree claims in natal-only reports from calculated facts", () => {
  const blueprint = reportCatalog.complete;
  const mars = facts.natal.chart.placements.find((placement) => placement.body === "Mars")!;
  const report = {
    title: blueprint.title,
    introduction: `Mars at 17\u00b013\u2032 ${mars.sign} describes the initial pressure.`,
    chapters: blueprint.chapters.map((chapter) => ({ key: chapter.key, title: chapter.title, body: "Grounded." })),
    practicalSummary: "Grounded.", closing: "Grounded.", scopeNote: "Grounded.",
  };

  const normalized = normalizeNatalDegreeClaims(blueprint, facts, report);

  assert.match(normalized.introduction, new RegExp(`Mars at ${mars.degreeLabel} ${mars.sign}`));
  assert.doesNotMatch(normalized.introduction, /17\u00b013\u2032/);
});

test("page validation enforces the product promise", () => {
  assert.deepEqual(validateRenderedPdf({ ...reportCatalog.love, targetPages: [24, 32] }, 28), []);
  assert.deepEqual(validateRenderedPdf(reportCatalog.complete, 55), []);
  assert.match(validateRenderedPdf(reportCatalog.love, 8)[0]!, /page-count/);
});
