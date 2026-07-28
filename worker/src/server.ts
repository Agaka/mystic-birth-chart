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

function reportLandingPage(response: ServerResponse, token: string, title = "Reading", eyebrow = "Personal Study", dossier = false): void {
  const downloadPath = `/reports/${encodeURIComponent(token)}/download`;
  response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store", "x-content-type-options": "nosniff" });
  const extras = dossier ? `<p><a class="button secondary" href="/reports/${encodeURIComponent(token)}/summary" download>Quick-reference PDF</a> <a class="button secondary" href="/reports/${encodeURIComponent(token)}/calendar" download>Calendar (.ics)</a></p>` : "";
  response.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your ${escapeHtml(title)} is ready | Mystic Birth Chart</title><style>body{margin:0;background:#140f0b;color:#f4ead7;font-family:Georgia,serif;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}.panel{width:min(680px,100%);box-sizing:border-box;background:#f7efdf;color:#301b17;border:1px solid #b88a3a;padding:44px 32px;text-align:center}.seal{width:82px;height:82px;object-fit:contain;margin-bottom:20px}.eyebrow{font:700 11px Arial,sans-serif;letter-spacing:2px;color:#9b742e}.title{font-size:36px;line-height:1.15;font-weight:500;margin:12px 0 18px}.copy{font-size:17px;line-height:1.7;margin:0 auto 28px;max-width:480px}.button{display:inline-block;background:#b88a3a;color:#140f0b;padding:15px 24px;text-decoration:none;font:700 14px Arial,sans-serif;margin:4px}.secondary{background:#301b17;color:#f7efdf}.note{font:13px Arial,sans-serif;line-height:1.6;color:#624d42;margin:24px auto 0;max-width:460px}</style></head><body><main class="panel"><img class="seal" src="https://mysticbirthchart.com/brand/mystic-astrolabe-seal-transparent.png" alt="Mystic Birth Chart astrolabe seal"><div class="eyebrow">${escapeHtml(eyebrow).toUpperCase()}</div><h1 class="title">Your ${escapeHtml(title)} is ready.</h1><p class="copy">Your personalized study has been prepared from the details you submitted.</p><a class="button" href="${escapeHtml(downloadPath)}" download>Download the full reading</a>${extras}<p class="note">Your private download links remain available for 30 days.</p></main></body></html>`);
}

function libraryPage(response: ServerResponse, token: string, orders: ReturnType<EssentialStore["findLibrary"]>): void {
  const items = orders.map((order) => `<li><div><strong>${escapeHtml(new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }))}</strong><span>${escapeHtml(order.birth.city)}</span></div><a href="/library/${encodeURIComponent(token)}/${encodeURIComponent(order.orderId)}/download">Download PDF</a></li>`).join("");
  response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "private, no-store", "x-content-type-options": "nosniff" });
  const portalUrl = `https://mysticbirthchart.com/api/almanac/portal?token=${encodeURIComponent(token)}`;
  response.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Almanac Library | Mystic Birth Chart</title><style>body{margin:0;background:#140f0b;color:#301b17;font-family:Georgia,serif;padding:24px}.panel{max-width:720px;margin:40px auto;background:#f7efdf;border:1px solid #b88a3a;padding:38px;box-sizing:border-box}.seal{display:block;width:72px;margin:0 auto 18px}.eyebrow{text-align:center;font:700 11px Arial,sans-serif;letter-spacing:2px;color:#9b742e}h1{text-align:center;font-weight:400;font-size:38px;margin:12px 0 10px}.intro{text-align:center;line-height:1.6;color:#624d42}.manage{text-align:center;margin:24px 0 4px}ul{list-style:none;padding:0;margin:32px 0 0}li{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:20px 0;border-top:1px solid #d9c9ae}li span{display:block;color:#756157;font-size:13px;margin-top:5px}a{display:inline-block;background:#b88a3a;color:#140f0b;text-decoration:none;padding:11px 15px;font:700 12px Arial,sans-serif}.secondary{background:#301b17;color:#f7efdf}@media(max-width:520px){.panel{padding:28px 20px}li{align-items:flex-start;flex-direction:column}}</style></head><body><main class="panel"><img class="seal" src="https://mysticbirthchart.com/brand/mystic-astrolabe-seal-transparent.png" alt="Mystic Birth Chart"><div class="eyebrow">PERSONAL MONTHLY ALMANAC</div><h1>Your private library</h1><p class="intro">Every delivered edition remains here for comparison and review. Keep this private link.</p><p class="manage"><a class="secondary" href="${escapeHtml(portalUrl)}">Manage subscription</a></p><ul>${items}</ul></main></body></html>`);
}

async function processWithRetries(orderId: string): Promise<void> {
  const backoffs = [10_000, 60_000];
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await processReportOrder(store, orderId);
    const current = store.findByOrderId(orderId);
    if (!current || current.status === "delivered") return;
    if (attempt === 2) {
      store.markFailed(orderId, `delivery-failed-after-${attempt + 1}-attempts`);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, backoffs[attempt]));
    store.claimOrder(current);
  }
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
      if (claim.kind !== "duplicate") void processWithRetries(job.orderId);
    } catch {
      json(response, 400, { message: "Invalid job." });
    }
    return;
  }

  if (request.method === "GET" && path.startsWith("/libraries/") && path.endsWith("/subscription")) {
    if (!valid(request, "")) return response.writeHead(401).end();
    const token = decodeURIComponent(path.slice("/libraries/".length, -"/subscription".length));
    const subscriptionId = store.findLibrarySubscription(token);
    return subscriptionId ? json(response, 200, { subscriptionId }) : json(response, 404, { message: "Not found." });
  }

  if (request.method === "GET" && path.startsWith("/library/")) {
    const parts = path.slice("/library/".length).split("/").map(decodeURIComponent);
    const token = parts[0] || "";
    if (parts.length === 1) {
      const orders = store.findLibrary(token);
      return orders.length ? libraryPage(response, token, orders) : response.writeHead(404).end();
    }
    if (parts.length === 3 && parts[2] === "download") {
      const order = store.findLibraryReport(token, parts[1] || "");
      if (!order?.reportPath) return response.writeHead(404).end();
      try {
        const file = await readFile(order.reportPath);
        response.writeHead(200, { "content-type": "application/pdf", "content-disposition": `attachment; filename="hermetic-almanac-${order.orderId.replace(/[^a-zA-Z0-9_-]/g, "")}.pdf"`, "content-length": String(file.byteLength), "cache-control": "private, no-store", "x-content-type-options": "nosniff" });
        response.end(file);
      } catch { response.writeHead(404).end(); }
      return;
    }
    return response.writeHead(404).end();
  }

  if (request.method === "GET" && path.startsWith("/reports/")) {
    const rawToken = path.slice("/reports/".length);
    const artifact = rawToken.endsWith("/download") ? "report" : rawToken.endsWith("/summary") ? "summary" : rawToken.endsWith("/calendar") ? "calendar" : "landing";
    const suffix = artifact === "report" ? "/download" : artifact === "summary" ? "/summary" : artifact === "calendar" ? "/calendar" : "";
    const token = suffix ? rawToken.slice(0, -suffix.length) : rawToken;
    const order = store.findByToken(decodeURIComponent(token));
    if (!order?.reportPath) return response.writeHead(404).end();
    const blueprint = blueprintFor(order.tier);
    if (artifact === "landing") return reportLandingPage(response, token, blueprint.title, blueprint.eyebrow, order.tier === "dossier");
    try {
      const filePath = artifact === "summary" ? order.summaryPath : artifact === "calendar" ? order.calendarPath : order.reportPath;
      if (!filePath) return response.writeHead(404).end();
      const file = await readFile(filePath);
      const isCalendar = artifact === "calendar";
      response.writeHead(200, {
        "content-type": isCalendar ? "text/calendar; charset=utf-8" : "application/pdf",
        "content-disposition": `attachment; filename="${artifact === "summary" ? "annual-quick-reference.pdf" : isCalendar ? "mystic-annual-timing.ics" : blueprint.fileName}"`,
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
}).listen(port, "0.0.0.0", () => {
  for (const order of store.findRecoverableOrders()) {
    if (order.status === "retry_pending") store.claimOrder(order);
    void processWithRetries(order.orderId);
  }
});
