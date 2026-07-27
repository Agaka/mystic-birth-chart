import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

type EssentialSection = { title: string; body: string };
type EssentialSignature = { signatureRank: number; title: string; interpretation: string; constructiveExpression: string; shadow: string; practicalQuestion: string };
type EssentialReport = {
  title: string; chartSentence: string; dominantSignatures: EssentialSignature[];
  bigThree: { sun: EssentialSection; moon: EssentialSection; ascendant: EssentialSection };
  chartRuler: EssentialSection;
  applications: { purposeAndWork: EssentialSection; emotionalNeeds: EssentialSection; relationshipsAndBoundaries: EssentialSection };
  practicalDirection: { strengths: string[]; tensions: string[]; actions: string[]; questions: string[] };
  closing: string; scopeNote: string;
};

type ChartFacts = {
  birth: { date: string; time: string; location: string; timezone: string; utcOffset: number; latitude: number; longitude: number };
  chart: {
    zodiac: string; houseSystem: string; chartRuler: string; sect: string;
    angles: { ascendant: { longitude: number; sign: string; degree: number }; midheaven: { longitude: number; sign: string; degree: number } };
    placements: Array<{ body: string; longitude: number; sign: string; degree: number; house: number; dignity: string }>;
    aspects: Array<{ body1: string; body2: string; type: string; orb: number }>;
    dominantSignatures: Array<{ rank: number; title: string; evidence: string; score: number }>;
    moonPhase: { name: string; angle: number; illumination: number };
  };
  focus: string;
};

const sectionSchema = {
  type: "object", additionalProperties: false, required: ["title", "body"],
  properties: { title: { type: "string" }, body: { type: "string" } },
};

const schema = {
  type: "json_schema" as const,
  name: "essential_report_v2",
  strict: true,
  schema: {
    type: "object", additionalProperties: false,
    required: ["title", "chartSentence", "dominantSignatures", "bigThree", "chartRuler", "applications", "practicalDirection", "closing", "scopeNote"],
    properties: {
      title: { type: "string" }, chartSentence: { type: "string" },
      dominantSignatures: {
        type: "array", minItems: 3, maxItems: 3,
        items: {
          type: "object", additionalProperties: false,
          required: ["signatureRank", "title", "interpretation", "constructiveExpression", "shadow", "practicalQuestion"],
          properties: {
            signatureRank: { type: "integer", minimum: 1, maximum: 3 }, title: { type: "string" }, interpretation: { type: "string" },
            constructiveExpression: { type: "string" }, shadow: { type: "string" }, practicalQuestion: { type: "string" },
          },
        },
      },
      bigThree: {
        type: "object", additionalProperties: false, required: ["sun", "moon", "ascendant"],
        properties: { sun: sectionSchema, moon: sectionSchema, ascendant: sectionSchema },
      },
      chartRuler: sectionSchema,
      applications: {
        type: "object", additionalProperties: false, required: ["purposeAndWork", "emotionalNeeds", "relationshipsAndBoundaries"],
        properties: { purposeAndWork: sectionSchema, emotionalNeeds: sectionSchema, relationshipsAndBoundaries: sectionSchema },
      },
      practicalDirection: {
        type: "object", additionalProperties: false, required: ["strengths", "tensions", "actions", "questions"],
        properties: {
          strengths: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          tensions: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          actions: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
          questions: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
        },
      },
      closing: { type: "string" }, scopeNote: { type: "string" },
    },
  },
};

const rules = `Write a premium automated Essential Birth Chart Reading in warm, precise English. It must be complete within one narrow promise: identify and interpret the three calculated patterns that most strongly organize this chart. Use only the supplied calculated chart. Never invent a degree, house, aspect, dignity, biography, event, or prediction.

Use traditional astrology as the technical foundation: whole-sign houses, sign rulers, chart ruler, angularity, sect, essential dignity, and repeated testimony. Modern planets may be discussed only when they form one of the three supplied dominant signatures, and must be framed as a secondary modern layer. Treat the supplied technical data as authoritative. Never call the chart factors "supplied factors", never say data "was not supplied", and never expose software limitations.

The report must feel personal because every claim is tied to named evidence, not because it guesses private facts. Translate technique into recognizable life patterns, constructive expression, possible imbalance, and practical reflection. Avoid Barnum language, filler, repeated summaries, fatalism, guaranteed outcomes, therapy diagnosis, or medical/legal/financial advice. Do not market another product inside the interpretation. Mention automation only once in the final scope note.

Length and structure: chartSentence 100-140 words. Three dominant signatures in rank order; each interpretation 180-230 words, constructiveExpression 55-80 words, shadow 55-80 words, plus one precise question. Big Three sections 220-280 words each and must include exact degree, whole-sign house, dignity where relevant, ruler, and major aspects from the facts. Chart ruler 260-330 words describing its actual sign, house, dignity, sect relationship, and aspects. Three application sections 230-290 words each, grounded in repeated chart testimony rather than one placement. Practical strengths, tensions, and actions: exactly three items per list, 45-70 words each; questions: exactly three. Closing 140-190 words. Scope note 55-85 words and state only that the reading was generated immediately from the calculated natal chart as a focused interpretation of its principal patterns.`;

function validSignature(request: Request, body: string): boolean {
  const secret = process.env.ESSENTIAL_WORKER_SHARED_SECRET || "";
  const timestamp = request.headers.get("x-mystic-timestamp") || "";
  const signature = request.headers.get("x-mystic-signature") || "";
  const timestampSeconds = Number(timestamp);
  if (!secret || !Number.isInteger(timestampSeconds) || Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > 300) return false;
  const expected = createHmac("sha256", secret).update(`POST\n/api/internal/essential-ai\n${timestamp}\n${body}`).digest("hex");
  const supplied = Buffer.from(signature, "hex"); const expectedBuffer = Buffer.from(expected, "hex");
  return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

function isFacts(value: unknown): value is ChartFacts {
  if (!value || typeof value !== "object") return false;
  const facts = value as Partial<ChartFacts>;
  return Boolean(facts.birth && facts.chart && Array.isArray(facts.chart.placements) && facts.chart.placements.length >= 10 && Array.isArray(facts.chart.aspects) && Array.isArray(facts.chart.dominantSignatures) && facts.chart.dominantSignatures.length === 3 && typeof facts.focus === "string");
}

function richSection(value: unknown, minimum = 700): value is EssentialSection {
  if (!value || typeof value !== "object") return false;
  const section = value as Record<string, unknown>;
  return typeof section.title === "string" && typeof section.body === "string" && section.body.length >= minimum;
}

function threeStrings(value: unknown, minimum = 120): value is string[] {
  return Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === "string" && item.length >= minimum);
}

function isReport(value: unknown): value is EssentialReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Record<string, unknown>;
  const signatures = Array.isArray(report.dominantSignatures) ? report.dominantSignatures : [];
  const validSignatures = signatures.length === 3 && signatures.every((item, index) => {
    if (!item || typeof item !== "object") return false;
    const signature = item as Record<string, unknown>;
    return signature.signatureRank === index + 1 && typeof signature.title === "string" && typeof signature.interpretation === "string" && signature.interpretation.length >= 600 && typeof signature.constructiveExpression === "string" && signature.constructiveExpression.length >= 170 && typeof signature.shadow === "string" && signature.shadow.length >= 170 && typeof signature.practicalQuestion === "string";
  });
  const bigThree = report.bigThree as Record<string, unknown> | undefined;
  const applications = report.applications as Record<string, unknown> | undefined;
  const practical = report.practicalDirection as Record<string, unknown> | undefined;
  return typeof report.title === "string" && typeof report.chartSentence === "string" && report.chartSentence.length >= 330 && validSignatures &&
    Boolean(bigThree && richSection(bigThree.sun) && richSection(bigThree.moon) && richSection(bigThree.ascendant)) && richSection(report.chartRuler, 800) &&
    Boolean(applications && richSection(applications.purposeAndWork) && richSection(applications.emotionalNeeds) && richSection(applications.relationshipsAndBoundaries)) &&
    Boolean(practical && threeStrings(practical.strengths) && threeStrings(practical.tensions) && threeStrings(practical.actions) && threeStrings(practical.questions, 15)) &&
    typeof report.closing === "string" && report.closing.length >= 430 && typeof report.scopeNote === "string" && report.scopeNote.length >= 170;
}

async function callOpenAI(input: unknown, model: string): Promise<EssentialReport> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("openai-not-configured");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input, text: { format: schema } }), cache: "no-store",
  });
  if (!response.ok) throw new Error(`openai-http-${response.status}`);
  const payload = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const outputText = payload.output_text || payload.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
  if (!outputText) throw new Error("openai-empty-output");
  const report = JSON.parse(outputText) as unknown;
  if (!isReport(report)) throw new Error("openai-invalid-report");
  return report;
}

export async function POST(request: Request) {
  const body = await request.text();
  if (!validSignature(request, body)) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  try {
    const value = JSON.parse(body) as { operation?: string; facts?: unknown; draft?: unknown };
    if (!isFacts(value.facts) || (value.operation !== "write" && value.operation !== "review")) return NextResponse.json({ message: "Invalid AI request." }, { status: 400 });
    const model = value.operation === "review" ? process.env.OPENAI_REVIEWER_MODEL || process.env.OPENAI_WRITER_MODEL || "gpt-5.6-terra" : process.env.OPENAI_WRITER_MODEL || "gpt-5.6-terra";
    const input = value.operation === "write"
      ? [{ role: "system", content: `${rules}\nReturn only the structured Essential report.` }, { role: "user", content: JSON.stringify(value.facts) }]
      : [{ role: "system", content: `${rules}\nAct as a rigorous senior astrology editor. Verify every technical claim against the facts, remove repetition and generic language, preserve the three ranked signatures, and return a fully rewritten compliant report.` }, { role: "user", content: JSON.stringify({ facts: value.facts, draft: value.draft }) }];
    if (value.operation === "review" && !isReport(value.draft)) return NextResponse.json({ message: "Invalid draft." }, { status: 400 });
    return NextResponse.json({ report: await callOpenAI(input, model) });
  } catch {
    return NextResponse.json({ message: "AI generation failed." }, { status: 502 });
  }
}
