import OpenAI from "openai";
import type { ChartFacts } from "./chartFacts.ts";

export interface EssentialSection { eyebrow: string; title: string; body: string; }
export interface EssentialReport { title: string; opening: string; sections: EssentialSection[]; focusSection: EssentialSection; closing: string; scopeNote: string; }

const schema = { type: "json_schema" as const, name: "essential_report", strict: true, schema: { type: "object", additionalProperties: false, required: ["title", "opening", "sections", "focusSection", "closing", "scopeNote"], properties: { title: { type: "string" }, opening: { type: "string" }, sections: { type: "array", minItems: 4, maxItems: 6, items: { type: "object", additionalProperties: false, required: ["eyebrow", "title", "body"], properties: { eyebrow: { type: "string" }, title: { type: "string" }, body: { type: "string" } } } }, focusSection: { type: "object", additionalProperties: false, required: ["eyebrow", "title", "body"], properties: { eyebrow: { type: "string" }, title: { type: "string" }, body: { type: "string" } } }, closing: { type: "string" }, scopeNote: { type: "string" } } } };
const rules = "Write clear, warm, traditional-first English astrology. Use only supplied facts. Do not invent placements, houses or aspects. No fatalism, guaranteed predictions, material promises, medical/legal/financial advice, generic filler, or any claim that this is hand-prepared.";

export async function generateReviewedReport(facts: ChartFacts): Promise<EssentialReport> {
  if (process.env.AI_PROVIDER !== "openai") throw new Error("ai-provider-not-configured");
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_WRITER_MODEL || !process.env.OPENAI_REVIEWER_MODEL) throw new Error("openai-not-configured");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const writer = await client.responses.create({ model: process.env.OPENAI_WRITER_MODEL, input: [{ role: "system", content: `${rules} Produce an automated Essential reading in JSON.` }, { role: "user", content: JSON.stringify(facts) }], text: { format: schema } });
  const draft = writer.output_text;
  const reviewer = await client.responses.create({ model: process.env.OPENAI_REVIEWER_MODEL, input: [{ role: "system", content: `${rules} Review this draft against these facts. Rewrite it where needed and return only compliant JSON.` }, { role: "user", content: JSON.stringify({ facts, draft }) }], text: { format: schema } });
  return JSON.parse(reviewer.output_text) as EssentialReport;
}
