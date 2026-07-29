import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { extractOpenAIOutputText, type OpenAIResponsePayload } from "@/lib/openAIResponse";

export const runtime = "nodejs";
export const maxDuration = 300;

type Chapter = { key: string; title: string; body: string };
type Blueprint = { tier: string; title: string; eyebrow: string; targetPages: [number, number]; targetWords: [number, number]; requiresPartner: boolean; requiresAnnualCycle: boolean; recurring: boolean; chapters: Array<{ key: string; title: string; purpose: string }> };
type RequestPayload = { operation?: "framing" | "chapter-write" | "chapter-review"; blueprint?: Blueprint; chapter?: Chapter & { purpose?: string }; facts?: unknown; draft?: Chapter; targetWords?: number };

const chapterSchema = {
  type: "json_schema" as const, name: "mystic_product_chapter", strict: true,
  schema: { type: "object", additionalProperties: false, required: ["key", "title", "body"], properties: { key: { type: "string" }, title: { type: "string" }, body: { type: "string" } } },
};
const framingSchema = {
  type: "json_schema" as const, name: "mystic_product_framing", strict: true,
  schema: { type: "object", additionalProperties: false, required: ["title", "introduction", "practicalSummary", "closing", "scopeNote"], properties: { title: { type: "string" }, introduction: { type: "string" }, practicalSummary: { type: "string" }, closing: { type: "string" }, scopeNote: { type: "string" } } },
};

function validSignature(request: Request, body: string): boolean {
  const secret = process.env.ESSENTIAL_WORKER_SHARED_SECRET || "";
  const timestamp = request.headers.get("x-mystic-timestamp") || "";
  const supplied = request.headers.get("x-mystic-signature") || "";
  const seconds = Number(timestamp);
  if (!secret || !Number.isInteger(seconds) || Math.abs(Math.floor(Date.now() / 1000) - seconds) > 300) return false;
  const expected = createHmac("sha256", secret).update(`POST\n/api/internal/report-ai\n${timestamp}\n${body}`).digest("hex");
  const a = Buffer.from(supplied, "hex"); const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function isBlueprint(value: unknown): value is Blueprint {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Blueprint>;
  return typeof item.tier === "string" && typeof item.title === "string" && Array.isArray(item.chapters) && Array.isArray(item.targetWords);
}

function rules(blueprint: Blueprint, chapter?: Chapter & { purpose?: string }, targetWords?: number): string {
  const core = `You write a premium personalized astrology report for Mystic Birth Chart. Use only the supplied calculated JSON. Never invent a degree, sign, house, rulership, aspect, dignity, reception, date, event, biography, or prediction. Traditional-first hierarchy is mandatory: chart ruler and condition, sect light, angles, angular planets, rulers of relevant houses, dignity or debility, traditional sign-based aspects, dispositor/reception and repeated testimony outrank outer planets. Uranus, Neptune, and Pluto are secondary only when exceptionally close or reinforcing a traditional pattern. Out-of-sign aspects are secondary and must be explicitly called out-of-sign if mentioned. Use whole-sign houses and traditional rulers only when the corresponding person's birth time is reliable. When natalTimeKnown, partner.timeKnown, or a reliability note says a time is unknown, do not infer houses, Ascendant, Midheaven, sect, chart ruler, house overlays, or angle contacts for that person. Use degree notation such as 25°28′ Leo and 0°46′ orb, never decimal degrees. Say no major essential dignity, not neutral. Avoid fatalism, diagnosis, medical/legal/financial advice, generic Barnum language, and unsupported promises. The tone is clear, warm, serious, and practical.`;
  const annual = blueprint.requiresAnnualCycle ? `For annual claims, tie every important conclusion to more than one technique where possible: natal chart, profection, solar return, and selected transits. Describe timing as concentration, preparation, review, or opportunity, never certainty.` : blueprint.tier === "year-ahead" || blueprint.tier === "almanac" ? `For timing claims, use only the supplied profections, lunations, and selected transits. Describe timing as concentration, preparation, review, or opportunity, never certainty. Do not invent a solar return. If a previous Almanac edition is supplied, do not recycle its examples or advice; mention continuity only when the new calculations genuinely repeat it.` : "";
  const hermetic = blueprint.tier === "kabbalah" || blueprint.tier === "almanac" ? `Hermetic Qabalah is a Western esoteric correspondence system and must be named as such; do not conflate it with Jewish Kabbalah. Practices must be optional, ethical, non-coercive, and never promise material outcomes. For the Hermetic Kabbalah Reading, cite an angel, Psalm reference, letter, path, Tarot correspondence, color, metal, perfume, or decan only when it appears in facts.hermetic; never complete the table from memory or invent a correspondence.` : "";
  if (!chapter) {
    const framingLength = blueprint.tier === "almanac"
      ? "an opening of 180-260 words, practical synthesis of 220-320 words, closing of 120-180 words, and a 40-60 word natural scope note"
      : "an opening of 500-800 words, practical synthesis of 700-1000 words, closing of 500-800 words, and a short natural scope note";
    return `${core}\n${annual}\n${hermetic}\nWrite a concise framing for ${blueprint.title}: ${framingLength}. It must explain the report's real use without changing the public product promise.`;
  }
  return `${core}\n${annual}\n${hermetic}\nWrite the chapter exactly titled "${chapter.title}" with key "${chapter.key}". Its editorial purpose is: ${chapter.purpose || "Use the supplied chapter specification."} Produce approximately ${targetWords || 1800} words of dense, non-repetitive prose. Explain technical evidence once, then translate it into concrete experience and practice. Do not repeat the entire natal record or insert a conclusion for the whole report.`;
}

async function callOpenAI(input: unknown, format: typeof chapterSchema | typeof framingSchema, maxOutputTokens: number): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("openai-not-configured");
  const model = process.env.OPENAI_WRITER_MODEL || "gpt-5.6-terra";
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model, input, max_output_tokens: maxOutputTokens, text: { format } }), cache: "no-store" });
  if (!response.ok) throw new Error(`openai-http-${response.status}`);
  const value = await response.json() as OpenAIResponsePayload;
  const outputText = extractOpenAIOutputText(value);
  if (!outputText) throw new Error("openai-empty-output");
  return JSON.parse(outputText) as unknown;
}

function parseJsonOnly(value: string): unknown {
  const trimmed = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(trimmed) as unknown;
}

async function callAnthropic(input: unknown, format: typeof chapterSchema | typeof framingSchema, maxOutputTokens: number): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("anthropic-not-configured");
  const rows = Array.isArray(input) ? input as Array<{ role?: string; content?: string }> : [];
  const system = rows.filter((item) => item.role === "system").map((item) => item.content || "").join("\n") + `\nReturn only valid JSON matching this schema: ${JSON.stringify(format.schema)}`;
  const messages = rows.filter((item) => item.role !== "system").map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: item.content || "" }));
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_WRITER_MODEL || "claude-sonnet-4-20250514", system, messages, max_tokens: Math.min(8192, maxOutputTokens), temperature: 0.2 }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`anthropic-http-${response.status}`);
  const value = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = value.content?.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("anthropic-empty-output");
  return parseJsonOnly(text);
}

function callWritingModel(input: unknown, format: typeof chapterSchema | typeof framingSchema, maxOutputTokens: number): Promise<unknown> {
  return process.env.REPORT_AI_PROVIDER === "anthropic" ? callAnthropic(input, format, maxOutputTokens) : callOpenAI(input, format, maxOutputTokens);
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(request, raw)) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  try {
    const value = JSON.parse(raw) as RequestPayload;
    if (!isBlueprint(value.blueprint) || !value.facts || !value.operation) return NextResponse.json({ message: "Invalid report request." }, { status: 400 });
    if (value.operation === "framing") {
      const framing = await callWritingModel([{ role: "system", content: rules(value.blueprint) }, { role: "user", content: JSON.stringify({ blueprint: value.blueprint, facts: value.facts }) }], framingSchema, 5000);
      return NextResponse.json({ framing });
    }
    if (!value.chapter || typeof value.chapter.key !== "string" || typeof value.chapter.title !== "string") return NextResponse.json({ message: "Invalid chapter." }, { status: 400 });
    const revision = value.operation === "chapter-review" ? "Act as a rigorous senior astrology editor. Rewrite the draft completely where needed, validate every statement against the facts, remove repetition, and preserve the requested length." : "";
    const chapter = await callWritingModel([{ role: "system", content: `${rules(value.blueprint, value.chapter, value.targetWords)}\n${revision}` }, { role: "user", content: JSON.stringify({ blueprint: value.blueprint, chapter: value.chapter, facts: value.facts, draft: value.draft }) }], chapterSchema, Math.max(6000, Math.round((value.targetWords || 1800) * 2.2)));
    const result = chapter as Partial<Chapter>;
    if (result.key !== value.chapter.key || result.title !== value.chapter.title || typeof result.body !== "string" || result.body.length < Math.max(2000, Math.round((value.targetWords || 1800) * 3.6))) return NextResponse.json({ message: "AI chapter failed validation." }, { status: 502 });
    return NextResponse.json({ chapter: result });
  } catch (error) {
    console.error("report-ai-generation-failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "Report generation failed." }, { status: 502 });
  }
}
