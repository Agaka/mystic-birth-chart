import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { createHmac, timingSafeEqual } from "node:crypto";
import { EssentialStore, type WorkerEssentialJob } from "./store.ts";
import { processEssentialOrder } from "./processOrder.ts";

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

createServer(async (request, response) => {
  const path = new URL(request.url || "/", "http://worker").pathname;
  if (request.method === "GET" && path === "/healthz") return json(response, 200, { ok: true });

  if (request.method === "GET" && path.startsWith("/orders/") && path.endsWith("/status")) {
    if (!valid(request, "")) return response.writeHead(401).end();
    const orderId = decodeURIComponent(path.slice("/orders/".length, -"/status".length));
    const status = store.getPublicStatus(orderId);
    return status ? json(response, 200, status) : json(response, 404, { message: "Not found." });
  }

  if (request.method === "POST" && path === "/jobs/essential") {
    let body = "";
    for await (const chunk of request) body += chunk;
    if (!valid(request, body)) return response.writeHead(401).end();
    try {
      const job = JSON.parse(body) as WorkerEssentialJob;
      const claim = store.claimOrder(job);
      json(response, claim.kind === "duplicate" ? 200 : 202, { accepted: true, duplicate: claim.kind === "duplicate" });
      if (claim.kind !== "duplicate") void processEssentialOrder(store, job.orderId);
    } catch {
      json(response, 400, { message: "Invalid job." });
    }
    return;
  }

  if (request.method === "GET" && path.startsWith("/reports/")) {
    const order = store.findByToken(path.slice("/reports/".length));
    if (!order?.reportPath) return response.writeHead(404).end();
    try {
      const file = await readFile(order.reportPath);
      response.writeHead(200, {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="essential-birth-chart-reading.pdf"',
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
