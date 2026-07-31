import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { buildChartFacts } from "./chartFacts.ts";
import { sendEssentialDelivery, sendReportDelivery } from "./email.ts";
import { createEssentialPdf } from "./essentialPdf.ts";
import { generateReviewedReport } from "./providers.ts";
import { EssentialStore } from "./store.ts";
import { blueprintFor } from "./reportCatalog.ts";
import { buildProductFacts } from "./reportFacts.ts";
import { createDossierSummaryPdf, createProductPdf } from "./productPdf.ts";
import { generateReviewedProductReport } from "./productProviders.ts";
import { normalizeNatalDegreeClaims, validateProductReport, validateRenderedPdf } from "./reportValidator.ts";
import { createTimingCalendar } from "./calendar.ts";

export async function processEssentialOrder(store: EssentialStore, orderId: string) {
  const order = store.findByOrderId(orderId); if (!order || order.status === "delivered") return;
  try {
    if (order.reportPath) {
      const pdf = await readFile(order.reportPath);
      const base = (process.env.PUBLIC_WORKER_URL || "").replace(/\/$/, ""); if (!base) throw new Error("public-worker-url-not-configured");
      await sendEssentialDelivery({ to: order.customer.email, name: order.customer.name, url: `${base}/reports/${order.reportToken}`, pdf }); store.markDelivered(orderId); return;
    }
    const facts = await buildChartFacts(order); const report = await generateReviewedReport(facts); const pdf = await createEssentialPdf(facts, report);
    const reportsDir = process.env.REPORTS_DIR || "/data/reports"; await mkdir(reportsDir, { recursive: true }); const path = join(reportsDir, `${order.reportToken}.pdf`); await writeFile(path, pdf); store.markGenerated(orderId, path);
    const base = (process.env.PUBLIC_WORKER_URL || "").replace(/\/$/, ""); if (!base) throw new Error("public-worker-url-not-configured");
    await sendEssentialDelivery({ to: order.customer.email, name: order.customer.name, url: `${base}/reports/${order.reportToken}`, pdf }); store.markDelivered(orderId);
  } catch (error) { store.markRetryPending(orderId, error instanceof Error ? error.message.slice(0, 80) : "unknown"); }
}

export async function processReportOrder(store: EssentialStore, orderId: string) {
  const order = store.findByOrderId(orderId);
  if (!order || order.status === "delivered") return;
  if (order.tier === "basic") return processEssentialOrder(store, orderId);
  try {
    const blueprint = blueprintFor(order.tier);
    if (order.reportPath) {
      const pdf = await readFile(order.reportPath);
      const base = (process.env.PUBLIC_WORKER_URL || "").replace(/\/$/, ""); if (!base) throw new Error("public-worker-url-not-configured");
      const deliveryUrl = order.tier === "almanac" && order.libraryToken ? `${base}/library/${order.libraryToken}` : `${base}/reports/${order.reportToken}`;
      const manageUrl = order.tier === "almanac" && order.libraryToken ? `https://mysticbirthchart.com/api/almanac/portal?token=${encodeURIComponent(order.libraryToken)}` : undefined;
      await sendReportDelivery({ to: order.customer.email, name: order.customer.name, url: deliveryUrl, pdf, title: blueprint.title, eyebrow: blueprint.eyebrow, fileName: blueprint.fileName, manageUrl });
      store.markDelivered(orderId); return;
    }
    const facts = await buildProductFacts(order);
    if (order.tier === "almanac" && order.subscriptionId) {
      const previous = store.findPreviousAlmanac(order.subscriptionId, order.orderId);
      if (previous?.sourcePath) {
        try {
          const prior = JSON.parse(await readFile(previous.sourcePath, "utf8")) as { title?: string; chapters?: Array<{ key?: string; body?: string }> };
          facts.almanacHistory = { title: prior.title || "Previous edition", chapterDigests: (prior.chapters || []).map((chapter) => ({ key: chapter.key || "chapter", digest: (chapter.body || "").slice(0, 1200) })) };
        } catch { /* A missing historical source must not block the paid edition. */ }
      }
    }
    const generatedReport = await generateReviewedProductReport(blueprint, facts);
    const report = normalizeNatalDegreeClaims(blueprint, facts, generatedReport);
    const reportErrors = validateProductReport(blueprint, facts, report);
    if (reportErrors.length) throw new Error(`report-validation:${reportErrors.slice(0, 3).join(",")}`);
    const pdf = await createProductPdf(blueprint, facts, report);
    const pageCount = (await PDFDocument.load(pdf)).getPageCount();
    const pdfErrors = validateRenderedPdf(blueprint, pageCount);
    if (pdfErrors.length) throw new Error(`pdf-validation:${pdfErrors.join(",")}`);
    const reportsDir = process.env.REPORTS_DIR || "/data/reports";
    await mkdir(reportsDir, { recursive: true });
    const path = join(reportsDir, `${order.reportToken}.pdf`);
    const sourcePath = join(reportsDir, `${order.reportToken}.json`);
    await Promise.all([writeFile(path, pdf), writeFile(sourcePath, JSON.stringify(report), "utf8")]);
    let summaryPath: string | undefined;
    let calendarPath: string | undefined;
    if (order.tier === "dossier") {
      if (!facts.forecast) throw new Error("dossier-timing-not-built");
      const summary = await createDossierSummaryPdf(facts, report);
      summaryPath = join(reportsDir, `${order.reportToken}-summary.pdf`);
      calendarPath = join(reportsDir, `${order.reportToken}-calendar.ics`);
      await Promise.all([writeFile(summaryPath, summary), writeFile(calendarPath, createTimingCalendar(facts.forecast, "Mystic Birth Chart Annual Timing"), "utf8")]);
    }
    store.markGenerated(orderId, path, { summaryPath, calendarPath, sourcePath });
    const base = (process.env.PUBLIC_WORKER_URL || "").replace(/\/$/, "");
    if (!base) throw new Error("public-worker-url-not-configured");
    const deliveryUrl = order.tier === "almanac" && order.libraryToken ? `${base}/library/${order.libraryToken}` : `${base}/reports/${order.reportToken}`;
    const manageUrl = order.tier === "almanac" && order.libraryToken ? `https://mysticbirthchart.com/api/almanac/portal?token=${encodeURIComponent(order.libraryToken)}` : undefined;
    await sendReportDelivery({ to: order.customer.email, name: order.customer.name, url: deliveryUrl, pdf, title: blueprint.title, eyebrow: blueprint.eyebrow, fileName: blueprint.fileName, manageUrl });
    store.markDelivered(orderId);
  } catch (error) {
    store.markRetryPending(orderId, error instanceof Error ? error.message.slice(0, 80) : "unknown");
  }
}
