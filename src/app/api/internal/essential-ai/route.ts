import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChartFacts = {
  sun: string;
  moon: string;
  rising: string;
  chartRuler: string;
  sect: "Day chart" | "Night chart";
  moonPhase: string;
  focus: string;
  calculationLimit: string;
};

type EssentialSection = { eyebrow: string; title: string; body: string };
type EssentialReport = {
  title: string;
  opening: string;
  sections: EssentialSection[];
  focusSection: EssentialSection;
  closing: string;
  scopeNote: string;
};

const schema = {
  type: "json_schema" as const,
  name: "essential_report",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "opening", "sections", "focusSection", "closing", "scopeNote"],
    properties: {
      title: { type: "string" },
      opening: { type: "string" },
      sections: {
        type: "array",
        minItems: 4,
        maxItems: 6,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["eyebrow", "title", "body"],
          properties: {
            eyebrow: { type: "string" },
            title: { type: "string" },
            body: { type: "string" },
          },
        },
      },
      focusSection: {
        type: "object",
        additionalProperties: false,
        required: ["eyebrow", "title", "body"],
        properties: {
          eyebrow: { type: "string" },
          title: { type: "string" },
          body: { type: "string" },
        },
      },
      closing: { type: "string" },
      scopeNote: { type: "string" },
    },
  },
};

const rules = "Write clear, warm, traditional-first English astrology. Use only supplied facts. Do not invent placements, houses or aspects. No fatalism, guaranteed predictions, material promises, medical/legal/financial advice, generic filler, or any claim that this is hand-prepared.";

function validSignature(request: Request, body: string): boolean {
  const secret = process.env.ESSENTIAL_WORKER_SHARED_SECRET || "";
  const timestamp = request.headers.get("x-mystic-timestamp") || "";
  const signature = request.headers.get("x-mystic-signature") || "";
  const timestampSeconds = Number(timestamp);
  if (!secret || !Number.isInteger(timestampSeconds) || Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > 300) return false;
  const expected = createHmac("sha256", secret).update(`POST\n/api/internal/essential-ai\n${timestamp}\n${body}`).digest("hex");
  const supplied = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

function isFacts(value: unknown): value is ChartFacts {
  if (!value || typeof value !== "object") return false;
  const facts = value as Record<string, unknown>;
  return ["sun", "moon", "rising", "chartRuler", "sect", "moonPhase", "focus", "calculationLimit"].every((key) => typeof facts[key] === "string");
}

function isReport(value: unknown): value is EssentialReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Record<string, unknown>;
  return typeof report.title === "string" && typeof report.opening === "string" && Array.isArray(report.sections) && typeof report.focusSection === "object" && typeof report.closing === "string" && typeof report.scopeNote === "string";
}

async function callOpenAI(input: unknown, model: string): Promise<EssentialReport> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("openai-not-configured");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      input,
      text: { format: schema },
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`openai-http-${response.status}`);
  const payload = await response.json() as {
    output_text?: string;
    output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  };
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

    if (value.operation === "write") {
      const report = await callOpenAI([
        { role: "system", content: `${rules} Produce an automated Essential reading in JSON.` },
        { role: "user", content: JSON.stringify(value.facts) },
      ], process.env.OPENAI_WRITER_MODEL || "gpt-5.6-terra");
      return NextResponse.json({ report });
    }

    if (!isReport(value.draft)) return NextResponse.json({ message: "Invalid draft." }, { status: 400 });
    const reviewerModel = process.env.OPENAI_REVIEWER_MODEL || process.env.OPENAI_WRITER_MODEL || "gpt-5.6-terra";
    const report = await callOpenAI([
      { role: "system", content: `${rules} Review this draft against these facts. Rewrite it where needed and return only compliant JSON.` },
      { role: "user", content: JSON.stringify({ facts: value.facts, draft: value.draft }) },
    ], reviewerModel);
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ message: "AI generation failed." }, { status: 502 });
  }
}
