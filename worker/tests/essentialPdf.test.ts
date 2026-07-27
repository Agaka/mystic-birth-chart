import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { createEssentialPdf } from "../src/essentialPdf.ts";

const longText = Array.from({ length: 90 }, (_, index) => `This is a distinct interpretive sentence for chapter ${index + 1}.`).join(" ");

test("Essential PDF preserves the full editorial chapter structure", async () => {
  const report = {
    title: "A First Study of Your Birth Chart",
    opening: longText,
    sections: Array.from({ length: 12 }, (_, index) => ({ eyebrow: `Chapter ${index + 1}`, title: `A meaningful chapter ${index + 1}`, body: longText })),
    focusSection: { eyebrow: "Selected focus", title: "Your chosen question", body: longText },
    closing: longText,
    scopeNote: longText,
  };
  const bytes = await createEssentialPdf({ sun: "Leo Sun", moon: "Capricorn Moon", rising: "Scorpio Rising", chartRuler: "Mars", sect: "Day chart", moonPhase: "Waxing Gibbous", focus: "general", calculationLimit: "Visible factors only." }, report);
  const document = await PDFDocument.load(bytes);
  assert.equal(document.getPageCount(), 17);
});
