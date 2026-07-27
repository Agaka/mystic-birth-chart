import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { calculateFullChart } from "../src/fullChart.ts";
import { createEssentialPdf } from "../src/essentialPdf.ts";

const paragraph = Array.from({ length: 42 }, (_, index) => `Sentence ${index + 1} explains a distinct chart-specific testimony in practical language.`).join(" ");
const section = (title: string) => ({ title, body: paragraph });
const chart = calculateFullChart({ date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });
const facts = {
  birth: { date: "2002-08-18", time: "11:05", location: "Porto Alegre, Rio Grande do Sul, Brazil", timezone: "America/Sao_Paulo", utcOffset: -3, latitude: -30.0346, longitude: -51.2177 },
  chart,
  focus: "General life direction",
};

test("Essential PDF renders the complete narrow promise as a substantial keepsake", async () => {
  const report = {
    title: "The Three Patterns Governing Your Chart",
    chartSentence: paragraph,
    dominantSignatures: chart.dominantSignatures.map((signature) => ({
      signatureRank: signature.rank, title: signature.title, interpretation: paragraph,
      constructiveExpression: paragraph, shadow: paragraph, practicalQuestion: "What would this pattern look like when used deliberately?",
    })),
    bigThree: { sun: section("The Sun"), moon: section("The Moon"), ascendant: section("The Ascendant") },
    chartRuler: section("The Planet Carrying the Chart"),
    applications: { purposeAndWork: section("Purpose and Work"), emotionalNeeds: section("Emotional Needs"), relationshipsAndBoundaries: section("Relationships and Boundaries") },
    practicalDirection: {
      strengths: [paragraph, paragraph, paragraph], tensions: [paragraph, paragraph, paragraph],
      actions: [paragraph, paragraph, paragraph], questions: ["Question one?", "Question two?", "Question three?"],
    },
    closing: paragraph,
    scopeNote: "Generated immediately from the calculated natal chart as a focused interpretation of its principal patterns.",
  };
  const bytes = await createEssentialPdf(facts, report);
  const document = await PDFDocument.load(bytes);
  assert.ok(document.getPageCount() >= 16 && document.getPageCount() <= 20, `expected 16-20 pages, received ${document.getPageCount()}`);
});
