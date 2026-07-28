import assert from "node:assert/strict";
import test from "node:test";
import { calculateFullChart } from "../src/fullChart.ts";
import { buildNatalEvidence } from "../src/natalEvidence.ts";
import { evidenceForChapter } from "../src/productEvidence.ts";
import { reportCatalog } from "../src/reportCatalog.ts";
import type { ProductFacts } from "../src/reportFacts.ts";

const chart = calculateFullChart({ date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });
const facts: ProductFacts = {
  generatedAt: "2026-07-29T00:00:00.000Z",
  natalTimeKnown: true,
  natalReliabilityNote: "Birth time supplied.",
  natal: { birth: { date: "2002-08-18", time: "11:05", location: "Porto Alegre, Brazil", timezone: "America/Sao_Paulo", utcOffset: -3, latitude: -30.0346, longitude: -51.2177 }, chart, focus: "general" },
  natalEvidence: buildNatalEvidence(chart),
};

test("Complete has separately reviewable chapters for planets, receptions, and every house", () => {
  assert.deepEqual(reportCatalog.complete.chapters.map((chapter) => chapter.key), [
    "chartArchitecture", "authority", "planetaryJudgments", "dispositorsReceptions", "houses1to4", "houses5to8", "houses9to12", "appliedSynthesis",
  ]);
});

test("focused products receive their own calculated evidence packet", () => {
  const love = evidenceForChapter(reportCatalog.love, reportCatalog.love.chapters[0]!, facts) as Record<string, unknown>;
  const career = evidenceForChapter(reportCatalog.career, reportCatalog.career.chapters[0]!, facts) as Record<string, unknown>;
  assert.ok("relationship" in love);
  assert.ok(!("vocation" in love));
  assert.ok("vocation" in career);
  assert.ok(!("relationship" in career));
});

test("Dossier contains natal and annual chapter boundaries rather than one generic annual appendix", () => {
  const keys = reportCatalog.dossier.chapters.map((chapter) => chapter.key);
  assert.ok(keys.includes("solarReturn"));
  assert.ok(keys.includes("selectedTransits"));
  assert.ok(keys.includes("annualTimeline"));
  assert.ok(keys.length >= 12);
});
