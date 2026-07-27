import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

type EssentialSection = { title: string; body: string };
type EssentialSignature = { signatureRank: number; title: string; interpretation: string; constructiveExpression: string; shadow: string; practicalQuestion: string };
type EssentialReport = {
  title: string; chartSentence: string; chartOverview: string; dominantSignatures: EssentialSignature[];
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
    placements: Array<{ body: string; longitude: number; sign: string; degree: number; house: number; dignity: string; dignities?: string[] }>;
    aspects: Array<{ body1: string; body2: string; type: string; orb: number }>;
    dominantSignatures: Array<{ rank: number; title: string; evidence: string; supportingModernEvidence?: string[]; score: number }>;
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
    required: ["title", "chartSentence", "chartOverview", "dominantSignatures", "bigThree", "chartRuler", "applications", "practicalDirection", "closing", "scopeNote"],
    properties: {
      title: { type: "string" }, chartSentence: { type: "string" }, chartOverview: { type: "string" },
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

const rules = `Write a premium automated Essential Birth Chart Reading in warm, precise English. It must be complete within one narrow promise: identify and interpret the three calculated patterns that most strongly organize this chart. Use only the calculated chart JSON. Never invent a degree, house, aspect, dignity, ruler, biography, event, or prediction.

Traditional-first hierarchy is mandatory. Treat the ranked dominant signatures as authoritative: they already prioritize chart ruler and its condition, sect light, angles and angular planets, relevant house rulers, essential dignity or debility, close traditional aspects, dispositors, and repeated testimony. Uranus, Neptune, and Pluto are secondary modern layers only. Discuss one only when it appears in supportingModernEvidence for the same signature, never as a standalone dominant signature and never ahead of stronger traditional testimony.

Use whole-sign houses and traditional rulers. State every degree and orb as 25°28′ Leo or 0°46′ orb, never as decimal degrees. Use every dignity listed in dignities; Mercury in Virgo must be called both domicile and exaltation. Say "no major essential dignity" instead of "neutral". Do not expose software limitations or call chart facts supplied factors.

The chartSentence must be exactly one memorable sentence, 18-38 words. chartOverview is the longer 95-125 word explanation beneath it. The three signature titles must exactly match the calculated dominant signature titles. Each signature interpretation gives the complete technical evidence once; later chapters must become concrete and experiential rather than repeat the same degrees and orbs.

Purpose and work must begin with the tenth whole-sign house, Midheaven, ruler of the tenth, planets in the tenth, and their relationship with the chart ruler before practical conclusions. Relationships and boundaries must begin with the seventh whole-sign house, its traditional ruler, and that ruler's sign, house, dignity, sect condition, and main aspects before integrating Venus, Moon, and repeated testimony.

Avoid Barnum language, filler, fatalism, guaranteed outcomes, therapy diagnosis, and medical/legal/financial advice. Mention automation only once in the final scope note. Keep the scope note short, clear, and natural. Length: each signature interpretation 180-230 words, constructiveExpression 55-80, shadow 55-80; Big Three 220-280; chart ruler 260-330; applications 230-290; three practical strengths, tensions, and actions 45-70 words each; closing 140-190; scope note 40-65 words.`;

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

const rulers: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };
const zodiac = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
function houseSign(facts: ChartFacts, house: number): string { const asc = zodiac.indexOf(facts.chart.angles.ascendant.sign); return zodiac[(asc + house - 1) % 12]; }
function oneSentence(value: string): boolean { return value.trim().split(/[.!?]+(?:\s|$)/).filter(Boolean).length === 1; }
function hasSupportedAspectClaims(text: string, facts: ChartFacts): boolean {
  const words: Record<string, string> = { conjunct: "conjunction", conjunction: "conjunction", sextile: "sextile", sextiles: "sextile", square: "square", squares: "square", trine: "trine", trines: "trine", opposite: "opposition", opposes: "opposition", opposition: "opposition" };
  const pattern = /\b(?:the )?(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)\s+(conjunct|conjunction|sextile|sextiles|square|squares|trine|trines|opposite|opposes|opposition)\s+(?:the )?(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|Midheaven)\b/gi;
  return [...text.matchAll(pattern)].every((match) => facts.chart.aspects.some((aspect) => aspect.type === words[match[2].toLowerCase()] && [aspect.body1, aspect.body2].includes(match[1]) && [aspect.body1, aspect.body2].includes(match[3])));
}

function hasReportShape(value: unknown): value is EssentialReport {
  if (!value || typeof value !== "object") return false;
  const report = value as Record<string, unknown>;
  const bigThree = report.bigThree as Record<string, unknown> | undefined;
  const applications = report.applications as Record<string, unknown> | undefined;
  const practical = report.practicalDirection as Record<string, unknown> | undefined;
  return typeof report.title === "string" && typeof report.chartSentence === "string" && typeof report.chartOverview === "string" &&
    Array.isArray(report.dominantSignatures) && report.dominantSignatures.length === 3 &&
    Boolean(bigThree && bigThree.sun && bigThree.moon && bigThree.ascendant) && typeof report.chartRuler === "object" &&
    Boolean(applications && applications.purposeAndWork && applications.emotionalNeeds && applications.relationshipsAndBoundaries) &&
    Boolean(practical && Array.isArray(practical.strengths) && Array.isArray(practical.tensions) && Array.isArray(practical.actions) && Array.isArray(practical.questions)) &&
    typeof report.closing === "string" && typeof report.scopeNote === "string";
}

function isReport(value: unknown, facts?: ChartFacts): value is EssentialReport {
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
  const titlesMatch = !facts || signatures.every((item, index) => item && typeof item === "object" && (item as Record<string, unknown>).title === facts.chart.dominantSignatures[index]?.title);
  const allText = JSON.stringify(report);
  const noUnsupportedNotation = !/\b\d+\.\d+\s*(?:degrees?|orb)\b/i.test(allText) && !/\bneutral\b/i.test(allText);
  const tenthRuler = rulers[houseSign(facts || { chart: { angles: { ascendant: { sign: "Aries" } } } } as ChartFacts, 10)];
  const seventhRuler = rulers[houseSign(facts || { chart: { angles: { ascendant: { sign: "Aries" } } } } as ChartFacts, 7)];
  const purposeBody = String((applications?.purposeAndWork as Record<string, unknown> | undefined)?.body || "").toLowerCase();
  const relationshipBody = String((applications?.relationshipsAndBoundaries as Record<string, unknown> | undefined)?.body || "").toLowerCase();
  const applicationsHaveStructure = !facts || (typeof applications?.purposeAndWork === "object" && typeof applications?.relationshipsAndBoundaries === "object" &&
    purposeBody.includes("tenth whole-sign house") && purposeBody.includes("midheaven") && purposeBody.includes(tenthRuler.toLowerCase()) && purposeBody.includes(facts.chart.chartRuler.toLowerCase()) &&
    relationshipBody.includes("seventh whole-sign house") && relationshipBody.includes(seventhRuler.toLowerCase()) && relationshipBody.includes(facts.chart.sect.toLowerCase()));
  const supportedClaims = !facts || hasSupportedAspectClaims(allText, facts);
  return typeof report.title === "string" && typeof report.chartSentence === "string" && oneSentence(report.chartSentence) && report.chartSentence.length >= 70 && report.chartSentence.length <= 260 && typeof report.chartOverview === "string" && report.chartOverview.length >= 420 && titlesMatch && noUnsupportedNotation && applicationsHaveStructure && supportedClaims && validSignatures &&
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
  if (!hasReportShape(report)) throw new Error("openai-invalid-report-shape");
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
    if (value.operation === "review" && !hasReportShape(value.draft)) return NextResponse.json({ message: "Invalid draft." }, { status: 400 });
    const report = await callOpenAI(input, model);
    if (!isReport(report, value.facts)) {
      const candidate = report as unknown as Partial<EssentialReport>;
      const applications = candidate.applications;
      const purpose = applications?.purposeAndWork?.body?.toLowerCase() || "";
      const relationships = applications?.relationshipsAndBoundaries?.body?.toLowerCase() || "";
      const ascendantIndex = zodiac.indexOf(value.facts.chart.angles.ascendant.sign);
      const tenthRuler = rulers[zodiac[(ascendantIndex + 9) % 12]];
      const seventhRuler = rulers[zodiac[(ascendantIndex + 6) % 12]];
      console.error("essential-ai-chart-validation-failed", {
        title: candidate.title,
        chartSentenceLength: candidate.chartSentence?.length,
        chartOverviewLength: candidate.chartOverview?.length,
        hasOneSentence: candidate.chartSentence ? oneSentence(candidate.chartSentence) : false,
        titlesMatch: candidate.dominantSignatures?.every((signature, index) => signature.title === value.facts.chart.dominantSignatures[index]?.title),
        hasDecimalNotation: /\b\d+\.\d+\s*(?:degrees?|orb)\b/i.test(JSON.stringify(candidate)),
        hasNeutral: /\bneutral\b/i.test(JSON.stringify(candidate)),
        purposeRequirements: ["tenth whole-sign house", "midheaven", tenthRuler.toLowerCase(), value.facts.chart.chartRuler.toLowerCase()].map((phrase) => purpose.includes(phrase)),
        relationshipRequirements: ["seventh whole-sign house", seventhRuler.toLowerCase(), (value.facts as ChartFacts).chart.sect.toLowerCase()].map((phrase) => relationships.includes(phrase)),
        supportedAspectClaims: hasSupportedAspectClaims(JSON.stringify(candidate), value.facts),
      });
      return NextResponse.json({ message: "AI report failed chart validation." }, { status: 502 });
    }
    return NextResponse.json({ report });
  } catch (error) {
    console.error("essential-ai-generation-failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "AI generation failed." }, { status: 502 });
  }
}
