import type { ChartFacts } from "./chartFacts.ts";

export interface EssentialSection { title: string; body: string; }
export interface EssentialSignature {
  signatureRank: number;
  title: string;
  interpretation: string;
  constructiveExpression: string;
  shadow: string;
  practicalQuestion: string;
}
export interface EssentialReport {
  title: string;
  chartSentence: string;
  dominantSignatures: EssentialSignature[];
  bigThree: { sun: EssentialSection; moon: EssentialSection; ascendant: EssentialSection };
  chartRuler: EssentialSection;
  applications: { purposeAndWork: EssentialSection; emotionalNeeds: EssentialSection; relationshipsAndBoundaries: EssentialSection };
  practicalDirection: { strengths: string[]; tensions: string[]; actions: string[]; questions: string[] };
  closing: string;
  scopeNote: string;
}

import { createHmac } from "node:crypto";

type ProxyResponse = { report?: EssentialReport };

function sign(path: string, timestamp: string, body: string, secret: string): string {
  return createHmac("sha256", secret).update(`POST\n${path}\n${timestamp}\n${body}`).digest("hex");
}

async function callProxy(operation: "write" | "review", facts: ChartFacts, draft?: EssentialReport): Promise<EssentialReport> {
  const base = process.env.AI_PROXY_URL;
  const secret = process.env.ESSENTIAL_WORKER_SHARED_SECRET;
  if (!base || !secret) throw new Error("ai-proxy-not-configured");
  const endpoint = new URL("/api/internal/essential-ai", base);
  const body = JSON.stringify({ operation, facts, ...(draft ? { draft } : {}) });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mystic-timestamp": timestamp,
      "x-mystic-signature": sign(endpoint.pathname, timestamp, body, secret),
    },
    body,
    signal: AbortSignal.timeout(280_000),
  });
  if (!response.ok) throw new Error(`ai-proxy-http-${response.status}`);
  const payload = await response.json() as ProxyResponse;
  if (!payload.report) throw new Error("ai-proxy-empty-report");
  return payload.report;
}

export async function generateReviewedReport(facts: ChartFacts): Promise<EssentialReport> {
  if (process.env.AI_PROXY_URL) {
    const draft = await callProxy("write", facts);
    return callProxy("review", facts, draft);
  }
  throw new Error("ai-proxy-not-configured");
}
