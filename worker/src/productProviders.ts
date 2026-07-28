import { createHmac } from "node:crypto";
import type { ProductFacts } from "./reportFacts.ts";
import type { ReportBlueprint, ReportChapter } from "./reportCatalog.ts";
import { evidenceForChapter } from "./productEvidence.ts";

export type ProductReportChapter = { key: string; title: string; body: string };
export type ProductReport = {
  title: string;
  introduction: string;
  chapters: ProductReportChapter[];
  practicalSummary: string;
  closing: string;
  scopeNote: string;
};

type ProxyResponse = { chapter?: ProductReportChapter; framing?: Omit<ProductReport, "chapters"> };

function signature(path: string, timestamp: string, body: string, secret: string): string {
  return createHmac("sha256", secret).update(`POST\n${path}\n${timestamp}\n${body}`).digest("hex");
}

async function callProxy(input: unknown): Promise<ProxyResponse> {
  const base = process.env.AI_PROXY_URL;
  const secret = process.env.ESSENTIAL_WORKER_SHARED_SECRET;
  if (!base || !secret) throw new Error("ai-proxy-not-configured");
  const endpoint = new URL("/api/internal/report-ai", base);
  const body = JSON.stringify(input);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", "x-mystic-timestamp": timestamp, "x-mystic-signature": signature(endpoint.pathname, timestamp, body, secret) },
    body,
    signal: AbortSignal.timeout(280_000),
  });
  if (!response.ok) throw new Error(`report-ai-http-${response.status}`);
  return response.json() as Promise<ProxyResponse>;
}

function targetWords(blueprint: ReportBlueprint): number {
  const midpoint = (blueprint.targetWords[0] + blueprint.targetWords[1]) / 2;
  return Math.max(850, Math.round((midpoint - 1200) / Math.max(1, blueprint.chapters.length)));
}

function checkChapter(chapter: ProductReportChapter | undefined, source: ReportChapter, minimum: number): ProductReportChapter {
  if (!chapter || chapter.key !== source.key || chapter.title !== source.title || typeof chapter.body !== "string" || chapter.body.length < minimum) {
    throw new Error(`invalid-report-chapter-${source.key}`);
  }
  return chapter;
}

export async function generateReviewedProductReport(blueprint: ReportBlueprint, facts: ProductFacts): Promise<ProductReport> {
  const framingResponse = await callProxy({ operation: "framing", blueprint, facts });
  const framing = framingResponse.framing;
  if (!framing || typeof framing.title !== "string" || typeof framing.introduction !== "string" || typeof framing.practicalSummary !== "string" || typeof framing.closing !== "string" || typeof framing.scopeNote !== "string") throw new Error("invalid-report-framing");

  const minimum = Math.max(2600, Math.round(targetWords(blueprint) * 4));
  const chapters: ProductReportChapter[] = [];
  for (const chapter of blueprint.chapters) {
    const chapterFacts = evidenceForChapter(blueprint, chapter, facts);
    const draftResponse = await callProxy({ operation: "chapter-write", blueprint, chapter, facts: chapterFacts, targetWords: targetWords(blueprint) });
    const draft = checkChapter(draftResponse.chapter, chapter, minimum);
    const reviewResponse = await callProxy({ operation: "chapter-review", blueprint, chapter, facts: chapterFacts, draft, targetWords: targetWords(blueprint) });
    chapters.push(checkChapter(reviewResponse.chapter, chapter, minimum));
  }
  return { ...framing, chapters };
}
