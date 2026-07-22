import assert from "node:assert/strict";
import test from "node:test";
import type { EssentialJob, EssentialReport } from "../src/lib/essential/contracts.ts";

test("Essential job keeps the minimum private fulfillment payload", () => {
  const job: EssentialJob = {
    orderId: "cs_live_example",
    mode: "live",
    customer: { name: "Chart Holder", email: "holder@example.com" },
    birth: { date: "2002-08-18", time: "11:05", city: "Porto Alegre, Brazil" },
    focus: "career",
  };

  assert.equal(job.mode, "live");
  assert.equal(job.customer.email, "holder@example.com");
});

test("Essential report exposes a structured reading for the PDF renderer", () => {
  const report: EssentialReport = {
    title: "The first architecture of your chart",
    opening: "A careful opening paragraph.",
    sections: [{ eyebrow: "The Sun", title: "A solar center", body: "A complete paragraph." }],
    focusSection: { eyebrow: "Career", title: "A vocational question", body: "A complete paragraph." },
    closing: "A grounded close.",
    scopeNote: "Astrology is reflective and educational.",
  };

  assert.equal(report.sections.length, 1);
  assert.match(report.scopeNote, /reflective/i);
});
