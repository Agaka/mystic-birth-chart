import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { calculateFullChart } from "../src/fullChart.ts";
import { createProductPdf } from "../src/productPdf.ts";
import { reportCatalog } from "../src/reportCatalog.ts";
import type { ProductFacts } from "../src/reportFacts.ts";

const chart = calculateFullChart({ date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });
const facts: ProductFacts = {
  generatedAt: "2026-07-28T00:00:00.000Z",
  natalTimeKnown: true,
  natalReliabilityNote: "Birth time supplied; angles and whole-sign houses may be used.",
  natal: { birth: { date: "2002-08-18", time: "11:05", location: "Porto Alegre, Rio Grande do Sul, Brazil", timezone: "America/Sao_Paulo", utcOffset: -3, latitude: -30.0346, longitude: -51.2177 }, chart, focus: "general" },
};
const paragraph = "This sample paragraph verifies the printable long-form layout while preserving a readable rhythm of technical evidence, lived application, and practical reflection. ";

test("specialized reports render a branded, multi-page PDF locally", async () => {
  const blueprint = reportCatalog.complete;
  const report = {
    title: blueprint.title,
    introduction: paragraph.repeat(18),
    chapters: blueprint.chapters.map((chapter) => ({ key: chapter.key, title: chapter.title, body: paragraph.repeat(70) })),
    practicalSummary: paragraph.repeat(30), closing: paragraph.repeat(22), scopeNote: paragraph.repeat(8),
  };
  const bytes = await createProductPdf(blueprint, facts, report);
  assert.equal(Buffer.from(bytes).subarray(0, 4).toString(), "%PDF");
  const pdf = await PDFDocument.load(bytes);
  assert.ok(pdf.getPageCount() >= 10);
});
