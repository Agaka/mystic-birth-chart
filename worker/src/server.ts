import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createHmac, timingSafeEqual } from "node:crypto";
import { EssentialStore, type WorkerEssentialJob } from "./store.ts";
import { processEssentialOrder } from "./processOrder.ts";

const port = Number(process.env.PORT || 3005), store = new EssentialStore(process.env.SQLITE_PATH || "/data/essential.sqlite"), secret = process.env.ESSENTIAL_WORKER_SHARED_SECRET || "";
function sign(method: string, path: string, timestamp: string, body: string) { return createHmac("sha256", secret).update(`${method}\n${path}\n${timestamp}\n${body}`).digest("hex"); }
function valid(request: import("node:http").IncomingMessage, body: string) { const timestamp = request.headers["x-mystic-timestamp"], signature = request.headers["x-mystic-signature"]; if (!secret || typeof timestamp !== "string" || typeof signature !== "string" || Math.abs(Math.floor(Date.now()/1000)-Number(timestamp))>300) return false; const expected=Buffer.from(sign(request.method || "POST", new URL(request.url || "/", "http://worker").pathname, timestamp, body), "hex"), supplied=Buffer.from(signature,"hex"); return supplied.length===expected.length && timingSafeEqual(supplied, expected); }
createServer(async (request, response) => { const path = new URL(request.url || "/", "http://worker").pathname; if (request.method === "GET" && path === "/healthz") { response.writeHead(200,{"content-type":"application/json"}); return response.end('{"ok":true}'); }
  if (request.method === "POST" && path === "/jobs/essential") { let body=""; for await (const chunk of request) body += chunk; if (!valid(request,body)) { response.writeHead(401); return response.end(); } try { const job=JSON.parse(body) as WorkerEssentialJob; const claim=store.claimOrder(job); response.writeHead(claim.kind === "duplicate" ? 200 : 202,{"content-type":"application/json"}); response.end(JSON.stringify({accepted:true,duplicate:claim.kind==="duplicate"})); if(claim.kind!=="duplicate") void processEssentialOrder(store,job.orderId); } catch { response.writeHead(400); response.end(); } return; }
  if (request.method === "GET" && path.startsWith("/reports/")) { const order=store.findByToken(path.slice("/reports/".length)); if(!order?.reportPath) { response.writeHead(404); return response.end(); } try { const file=await readFile(order.reportPath); response.writeHead(200,{"content-type":"application/pdf","content-disposition":"attachment; filename=essential-birth-chart-reading.pdf","cache-control":"private, no-store"}); response.end(file); } catch { response.writeHead(404); response.end(); } return; }
  response.writeHead(404); response.end();
}).listen(port, "127.0.0.1");
