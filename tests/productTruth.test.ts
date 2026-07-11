import assert from "node:assert/strict";
import test from "node:test";
import { siteConfig } from "../src/lib/site.ts";

test("Essential remains the automated $17 instant-email product", () => {
  const essential = siteConfig.product.basic;

  assert.equal(essential.price, "$17");
  assert.match(essential.priceNote, /automated/i);
  assert.match(essential.delivery, /instantly by email/i);
  assert.match(essential.format, /automated email/i);
  assert.match(essential.disclosure, /automatically/i);
  assert.match(essential.disclosure, /not hand-prepared/i);
});

test("Complete remains the individually reviewed $97 PDF product", () => {
  const complete = siteConfig.product.complete;

  assert.equal(complete.price, "$97");
  assert.match(complete.priceNote, /hand-prepared/i);
  assert.match(complete.delivery, /within 72 hours/i);
  assert.match(complete.format, /PDF/i);
  assert.match(complete.summary, /individually analyzed/i);
  assert.match(complete.disclosure, /individually prepared and reviewed/i);
  assert.match(complete.disclosure, /limited daily queue/i);
});

test("longer hand-prepared products keep their real delivery windows", () => {
  assert.match(siteConfig.product.synastry.delivery, /within 7 days/i);
  assert.match(siteConfig.product.kabbalah.delivery, /within 7 days/i);
  assert.match(siteConfig.product.dossier.delivery, /within 10 days/i);
});
