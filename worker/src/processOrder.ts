import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildChartFacts } from "./chartFacts.ts";
import { sendEssentialDelivery } from "./email.ts";
import { createEssentialPdf } from "./essentialPdf.ts";
import { generateReviewedReport } from "./providers.ts";
import { EssentialStore } from "./store.ts";

export async function processEssentialOrder(store: EssentialStore, orderId: string) {
  const order = store.findByOrderId(orderId); if (!order || order.status === "delivered") return;
  try {
    const facts = await buildChartFacts(order); const report = await generateReviewedReport(facts); const pdf = await createEssentialPdf(facts, report);
    const reportsDir = process.env.REPORTS_DIR || "/data/reports"; await mkdir(reportsDir, { recursive: true }); const path = join(reportsDir, `${order.reportToken}.pdf`); await writeFile(path, pdf); store.markGenerated(orderId, path);
    const base = (process.env.PUBLIC_WORKER_URL || "").replace(/\/$/, ""); if (!base) throw new Error("public-worker-url-not-configured");
    await sendEssentialDelivery({ to: order.customer.email, name: order.customer.name, url: `${base}/reports/${order.reportToken}`, pdf }); store.markDelivered(orderId);
  } catch (error) { store.markRetryPending(orderId, error instanceof Error ? error.message.slice(0, 80) : "unknown"); }
}
