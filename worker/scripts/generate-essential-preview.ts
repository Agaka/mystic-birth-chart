import { mkdir, writeFile } from "node:fs/promises";
import { calculateFullChart } from "../src/fullChart.ts";
import { createEssentialPdf } from "../src/essentialPdf.ts";
import type { EssentialReport } from "../src/providers.ts";

const sentences = [
  "This testimony becomes personal through its exact place in the chart rather than through the sign as an isolated label.",
  "The constructive expression asks for deliberate use of attention, proportion, timing, and a clear relationship with responsibility.",
  "In daily life, the pattern may appear whenever private preparation has to become visible action without losing integrity.",
  "The chart does not remove choice; it names the recurring conditions under which choice becomes easier to recognize and use.",
  "Traditional judgment gives priority to rulership, house, sect, dignity, angularity, and the testimonies that repeat the same concern.",
  "A useful reading therefore distinguishes an available strength from the pressure that can distort that same strength under strain.",
  "The practical task is not to perform a personality description, but to notice what the chart repeatedly asks to be coordinated.",
  "When this pattern is handled consciously, ambition, emotional continuity, discernment, and courage can support one another.",
];

function prose(words: number, offset = 0): string {
  let result = ""; let index = 0;
  while (result.split(/\s+/).filter(Boolean).length < words) { result += `${sentences[(index + offset) % sentences.length]} `; index += 1; }
  return result.trim();
}

const chart = calculateFullChart({ date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });
const facts = {
  birth: { date: "2002-08-18", time: "11:05", location: "Porto Alegre, Rio Grande do Sul, Brazil", timezone: "America/Sao_Paulo", utcOffset: chart.utcOffset, latitude: -30.0346, longitude: -51.2177 },
  chart, focus: "General life direction",
};
const report: EssentialReport = {
  title: "The Three Patterns Governing Your Chart",
  chartSentence: prose(125),
  dominantSignatures: chart.dominantSignatures.map((signature, index) => ({
    signatureRank: signature.rank, title: signature.title, interpretation: prose(205, index),
    constructiveExpression: prose(62, index + 2), shadow: prose(62, index + 4),
    practicalQuestion: "Where can this pattern become a deliberate choice instead of an automatic pressure?",
  })),
  bigThree: {
    sun: { title: "The Sun: authorship, visibility, and direction", body: prose(250, 1) },
    moon: { title: "The Moon: continuity, need, and emotional labor", body: prose(250, 2) },
    ascendant: { title: "The Ascendant: the threshold of experience", body: prose(250, 3) },
  },
  chartRuler: { title: "Mars carries the chart into action", body: prose(300, 4) },
  applications: {
    purposeAndWork: { title: "Purpose and work", body: prose(265, 5) },
    emotionalNeeds: { title: "Emotional needs", body: prose(265, 6) },
    relationshipsAndBoundaries: { title: "Relationships and boundaries", body: prose(265, 7) },
  },
  practicalDirection: {
    strengths: [prose(55, 0), prose(55, 1), prose(55, 2)], tensions: [prose(55, 3), prose(55, 4), prose(55, 5)],
    actions: [prose(55, 5), prose(55, 6), prose(55, 7)],
    questions: ["What deserves wholehearted commitment now?", "Which structure protects the work without becoming a prison?", "What direct action would make the pattern concrete?"],
  },
  closing: prose(165, 2),
  scopeNote: "This Essential Reading was generated immediately from the calculated natal chart. It offers a focused interpretation of the principal patterns selected above rather than an exhaustive judgment of every house, ruler, aspect, reception, timing technique, or predictive testimony in the figure.",
};

await mkdir("../output/pdf", { recursive: true });
await writeFile("../output/pdf/essential-v2-preview.pdf", await createEssentialPdf(facts, report));
console.log("../output/pdf/essential-v2-preview.pdf");
