import assert from "node:assert/strict";
import test from "node:test";
import { reportCatalog } from "../src/reportCatalog.ts";

test("every public reading tier has an automated production blueprint", () => {
  const tiers = ["basic", "love", "career", "year-ahead", "synastry", "complete", "kabbalah", "dossier", "almanac"] as const;
  for (const tier of tiers) assert.ok(reportCatalog[tier]);
});

test("the product ladder keeps materially different report scopes", () => {
  assert.deepEqual(reportCatalog.basic.targetPages, [16, 20]);
  assert.deepEqual(reportCatalog.complete.targetPages, [45, 60]);
  assert.deepEqual(reportCatalog.dossier.targetPages, [75, 100]);
  assert.equal(reportCatalog.synastry.requiresPartner, true);
  assert.equal(reportCatalog.dossier.requiresAnnualCycle, true);
  assert.equal(reportCatalog.almanac.recurring, true);
});
