import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { calculateFullChart } from "../src/fullChart.ts";
import { hermeticCorrespondences, quinanceFor } from "../src/hermeticCorrespondences.ts";
import { createDossierSummaryPdf, createProductPdf } from "../src/productPdf.ts";
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
  assert.ok(pdf.getPageCount() >= blueprint.targetPages[0] && pdf.getPageCount() <= blueprint.targetPages[1], `rendered ${pdf.getPageCount()} pages`);
});

test("Dossier produces a separate four-page quick reference", async () => {
  const blueprint = reportCatalog.dossier;
  const report = { title: blueprint.title, introduction: paragraph.repeat(8), chapters: [], practicalSummary: paragraph.repeat(8), closing: paragraph.repeat(5), scopeNote: paragraph };
  const bytes = await createDossierSummaryPdf(facts, report);
  assert.equal(Buffer.from(bytes).subarray(0, 4).toString(), "%PDF");
  assert.equal((await PDFDocument.load(bytes)).getPageCount(), 4);
});

test("every automated long-form product renders inside its promised page band", async () => {
  for (const tier of ["love", "career", "year-ahead", "complete", "kabbalah", "dossier", "almanac"] as const) {
    const blueprint = reportCatalog[tier];
    const framingWords = 1400;
    const chapterWords = Math.ceil((blueprint.targetWords[0] + 1000 - framingWords) / blueprint.chapters.length);
    const wordsPerParagraph = paragraph.trim().split(/\s+/).length;
    const fill = (count: number) => paragraph.repeat(Math.max(1, Math.ceil(count / wordsPerParagraph)));
    const report = { title: blueprint.title, introduction: fill(350), chapters: blueprint.chapters.map((chapter) => ({ key: chapter.key, title: chapter.title, body: fill(chapterWords) })), practicalSummary: fill(500), closing: fill(400), scopeNote: fill(150) };
    const tierFacts: ProductFacts = tier === "kabbalah" ? { ...facts, hermetic: {
      version: hermeticCorrespondences.version,
      system: hermeticCorrespondences.system,
      sources: hermeticCorrespondences.sources,
      planetarySpheres: hermeticCorrespondences.planetarySpheres,
      zodiac: hermeticCorrespondences.zodiac,
      selectedQuinances: ["Sun", "Moon"].map((body) => {
        const placement = chart.placements.find((item) => item.body === body)!;
        return { subject: body, sign: placement.sign, degreeLabel: placement.degreeLabel, quinance: quinanceFor(placement.sign, placement.degree) };
      }),
    } } : facts;
    const count = (await PDFDocument.load(await createProductPdf(blueprint, tierFacts, report))).getPageCount();
    assert.ok(count >= blueprint.targetPages[0] && count <= blueprint.targetPages[1], `${tier} rendered ${count} pages; expected ${blueprint.targetPages.join("-")}`);
  }
});
