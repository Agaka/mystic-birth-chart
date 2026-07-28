import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EssentialStore } from "../src/store.ts";

function job(orderId: string) {
  return {
    orderId,
    mode: "test" as const,
    customer: { name: "Tester", email: "test@example.com" },
    birth: { date: "2002-08-18", time: "11:05", city: "Porto Alegre, Brazil" },
    focus: "general",
  };
}

test("store claims once, deduplicates delivered orders, and resumes retryable orders", () => {
  const directory = mkdtempSync(join(tmpdir(), "mystic-store-"));
  const store = new EssentialStore(join(directory, "essential.sqlite"));
  try {
    assert.equal(store.claimOrder(job("test_1")).kind, "claimed");
    store.markDelivered("test_1");
    assert.equal(store.claimOrder(job("test_1")).kind, "duplicate");

    assert.equal(store.claimOrder(job("test_2")).kind, "claimed");
    store.markRetryPending("test_2", "provider-timeout");
    assert.equal(store.claimOrder(job("test_2")).kind, "resume");
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("report tokens are not derived from the Stripe order id", () => {
  const directory = mkdtempSync(join(tmpdir(), "mystic-store-"));
  const store = new EssentialStore(join(directory, "essential.sqlite"));
  try {
    const result = store.claimOrder(job("test_secret_order"));
    assert.equal(result.kind, "claimed");
    assert.notEqual(result.order.reportToken, "test_secret_order");
    assert.ok(result.order.reportToken.length >= 43);
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("store persists the additional private inputs needed by specialized reports", () => {
  const directory = mkdtempSync(join(tmpdir(), "mystic-store-"));
  const store = new EssentialStore(join(directory, "essential.sqlite"));
  try {
    const result = store.claimOrder({
      ...job("test_dossier"),
      tier: "dossier",
      notes: "Focus on work.",
      annual: { cycleYear: 2027, returnCity: "Lisbon, Portugal" },
    });
    assert.equal(result.kind, "claimed");
    assert.equal(result.order.tier, "dossier");
    assert.equal(result.order.annual?.cycleYear, 2027);
    assert.equal(result.order.annual?.returnCity, "Lisbon, Portugal");
  } finally {
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
