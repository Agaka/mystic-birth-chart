import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { createHmac, timingSafeEqual } from "node:crypto";
import { EssentialStore, type WorkerEssentialJob } from "./store.ts";
import { processReportOrder } from "./processOrder.ts";
import { blueprintFor } from "./reportCatalog.ts";

const port = Number(process.env.PORT || 3005);
const store = new EssentialStore(process.env.SQLITE_PATH || "/data/essential.sqlite");
const secret = process.env.ESSENTIAL_WORKER_SHARED_SECRET || "";

function sign(method: string, path: string, timestamp: string, body: string) {
  return createHmac("sha256", secret).update(`${method}\n${path}\n${timestamp}\n${body}`).digest("hex");
}

function valid(request: IncomingMessage, body: string): boolean {
  const timestamp = request.headers["x-mystic-timestamp"];
  const signature = request.headers["x-mystic-signature"];
  if (!secret || typeof timestamp !== "string" || typeof signature !== "string" || Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > 300) return false;
  const path = new URL(request.url || "/", "http://worker").pathname;
  const expected = Buffer.from(sign(request.method || "POST", path, timestamp, body), "hex");
  const supplied = Buffer.from(signature, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function json(response: ServerResponse, status: number, value: unknown): void {
  response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  response.end(JSON.stringify(value));
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function reportLandingPage(response: ServerResponse, token: string, title = "Reading", eyebrow = "Personal Study"): void {
  const downloadPath = `/reports/${encodeURIComponent(token)}/download`;
  response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store", "x-content-type-options": "nosniff" });
  response.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your ${escapeHtml(title)} is ready | Mystic Birth Chart</title><style>body{margin:0;background:#140f0b;color:#f4ead7;font-family:Georgia,serif;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}.panel{width:min(620px,100%);box-sizing:border-box;background:#f7efdf;color:#301b17;border:1px solid #b88a3a;padding:44px 32px;text-align:center}.seal{width:82px;height:82px;object-fit:contain;margin-bottom:20px}.eyebrow{font:700 11px Arial,sans-serif;letter-spacing:2px;color:#9b742e}.title{font-size:36px;line-height:1.15;font-weight:500;margin:12px 0 18px}.copy{font-size:17px;line-height:1.7;margin:0 auto 28px;max-width:480px}.button{display:inline-block;background:#b88a3a;color:#140f0b;padding:15px 24px;text-decoration:none;font:700 14px Arial,sans-serif}.note{font:13px Arial,sans-serif;line-height:1.6;color:#624d42;margin:24px auto 0;max-width:460px}</style></head><body><main class="panel"><img class="seal" src="https://mysticbirthchart.com/brand/mystic-astrolabe-seal-transparent.png" alt="Mystic Birth Chart astrolabe seal"><div class="eyebrow">${escapeHtml(eyebrow).toUpperCase()}</div><h1 class="title">Your ${escapeHtml(title)} is ready.</h1><p class="copy">Your personalized PDF has been prepared from the details you submitted.</p><a class="button" href="${escapeHtml(downloadPath)}" download>Download your PDF</a><p class="note">Your private download link remains available for 30 days.</p></main></body></html>`);
}

createServer(async (request, response) => {
  const path = new URL(request.url || "/", "http://worker").pathname;
  if (request.method === "GET" && path === "/healthz") return json(response, 200, { ok: true });

  if (request.method === "GET" && path.startsWith("/orders/") && path.endsWith("/status")) {
    if (!valid(request, "")) return response.writeHead(401).end();
    const orderId = decodeURIComponent(path.slice("/orders/".length, -"/status".length));
    const status = store.getPublicStatus(orderId);
    return status ? json(response, 200, status) : json(response, 404, { message: "Not found." });
  }

  if (request.method === "POST" && (path === "/jobs/essential" || path === "/jobs/reports")) {
    let body = "";
    for await (const chunk of request) body += chunk;
    if (!valid(request, body)) return response.writeHead(401).end();
    try {
      const job = JSON.parse(body) as WorkerEssentialJob;
      const claim = store.claimOrder(job);
      json(response, claim.kind === "duplicate" ? 200 : 202, { accepted: true, duplicate: claim.kind === "duplicate" });
      if (claim.kind !== "duplicate") void processReportOrder(store, job.orderId);
    } catch {
      json(response, 400, { message: "Invalid job." });
    }
    return;
  }

  if (request.method === "GET" && path.startsWith("/reports/")) {
    const rawToken = path.slice("/reports/".length);
    const isDownload = rawToken.endsWith("/download");
    const token = isDownload ? rawToken.slice(0, -"/download".length) : rawToken;
    const order = store.findByToken(decodeURIComponent(token));
    if (!order?.reportPath) return response.writeHead(404).end();
    const blueprint = blueprintFor(order.tier);
    if (!isDownload) return reportLandingPage(response, token, blueprint.title, blueprint.eyebrow);
    try {
      const file = await readFile(order.reportPath);
      response.writeHead(200, {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${blueprint.fileName}"`,
        "content-length": String(file.byteLength),
        "accept-ranges": "bytes",
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      });
      response.end(file);
    } catch {
      response.writeHead(404).end();
    }
    return;
  }

  response.writeHead(404).end();
}).listen(port, "0.0.0.0");
