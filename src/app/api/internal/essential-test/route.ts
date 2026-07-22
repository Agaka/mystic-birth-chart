import { NextResponse } from "next/server";
import { dispatchEssentialJob } from "@/lib/essential/dispatch";
import { buildEssentialTestJob, hasValidTestSecret } from "@/lib/essential/testRequest";

export const runtime = "nodejs";

const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 3;
const buckets = new Map<string, number[]>();

function canSubmit(request: Request): boolean {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((value) => now - value < RATE_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return false;
  recent.push(now);
  buckets.set(key, recent);
  return true;
}

export async function POST(request: Request) {
  const suppliedSecret = request.headers.get("x-essential-test-secret");
  if (!suppliedSecret) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  if (!hasValidTestSecret(suppliedSecret, process.env.ESSENTIAL_TEST_SECRET)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }
  if (!canSubmit(request)) {
    return NextResponse.json({ message: "Too many test requests." }, { status: 429, headers: { "Retry-After": "900" } });
  }

  const job = buildEssentialTestJob(await request.json().catch(() => null));
  if (!job) return NextResponse.json({ message: "Enter complete test chart details." }, { status: 400 });

  try {
    await dispatchEssentialJob(job);
    return NextResponse.json({ queued: true, mode: "test" }, { status: 202 });
  } catch {
    return NextResponse.json({ message: "Test delivery could not be queued." }, { status: 503 });
  }
}
