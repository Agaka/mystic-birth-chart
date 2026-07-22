import { createHmac, timingSafeEqual } from "node:crypto";
import type { EssentialJob } from "./contracts";

const MAX_SIGNATURE_AGE_SECONDS = 5 * 60;

export interface EssentialDispatchOptions {
  workerUrl?: string;
  sharedSecret?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

function signingPayload(method: string, path: string, timestamp: string, body: string): string {
  return `${method.toUpperCase()}\n${path}\n${timestamp}\n${body}`;
}

export function createDispatchSignature(
  method: string,
  path: string,
  timestamp: string,
  body: string,
  secret: string,
): string {
  return createHmac("sha256", secret).update(signingPayload(method, path, timestamp, body)).digest("hex");
}

export function verifyDispatchSignature(
  method: string,
  path: string,
  timestamp: string,
  body: string,
  signature: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  const timestampSeconds = Number(timestamp);
  if (!Number.isInteger(timestampSeconds) || Math.abs(nowSeconds - timestampSeconds) > MAX_SIGNATURE_AGE_SECONDS) {
    return false;
  }

  const expected = createDispatchSignature(method, path, timestamp, body, secret);
  const supplied = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return supplied.length === expectedBuffer.length && timingSafeEqual(supplied, expectedBuffer);
}

function workerEndpoint(workerUrl: string): URL {
  const endpoint = new URL("/jobs/essential", workerUrl);
  if (endpoint.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new Error("Essential worker must use HTTPS in production.");
  }
  return endpoint;
}

export async function dispatchEssentialJob(
  job: EssentialJob,
  options: EssentialDispatchOptions = {},
): Promise<Response> {
  const workerUrl = options.workerUrl || process.env.ESSENTIAL_WORKER_URL;
  const sharedSecret = options.sharedSecret || process.env.ESSENTIAL_WORKER_SHARED_SECRET;
  if (!workerUrl || !sharedSecret) {
    throw new Error("Essential delivery worker is not configured.");
  }

  const endpoint = workerEndpoint(workerUrl);
  const body = JSON.stringify(job);
  const timestamp = String(Math.floor((options.now || Date.now)() / 1000));
  const signature = createDispatchSignature("POST", endpoint.pathname, timestamp, body, sharedSecret);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await (options.fetchImpl || fetch)(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-mystic-timestamp": timestamp,
        "x-mystic-signature": signature,
      },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Essential worker rejected dispatch with status ${response.status}.`);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
