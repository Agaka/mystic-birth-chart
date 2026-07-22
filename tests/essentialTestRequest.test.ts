import assert from "node:assert/strict";
import test from "node:test";
import { buildEssentialTestJob, hasValidTestSecret } from "../src/lib/essential/testRequest.ts";

test("test request accepts only complete chart details", () => {
  const job = buildEssentialTestJob({ name: "Tester", email: "test@example.com", birthDate: "2002-08-18", birthTime: "11:05", birthCity: "Porto Alegre, Brazil" });
  assert.equal(job?.mode, "test");
  assert.match(job?.orderId || "", /^test_/);
  assert.equal(buildEssentialTestJob({ name: "Tester", email: "bad", birthDate: "2002-08-18", birthTime: "11:05", birthCity: "Porto Alegre" }), null);
});

test("test secret comparison requires exact values", () => {
  assert.equal(hasValidTestSecret("secret", "secret"), true);
  assert.equal(hasValidTestSecret("secret", "different"), false);
  assert.equal(hasValidTestSecret(null, "secret"), false);
});
