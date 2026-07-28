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

test("Almanac renewals share one private library and preserve report history", () => {
  const directory = mkdtempSync(join(tmpdir(), "mystic-store-"));
  const store = new EssentialStore(join(directory, "essential.sqlite"));
  try {
    const first = store.claimOrder({ ...job("invoice_1"), tier: "almanac", subscriptionId: "sub_1" });
    assert.equal(first.kind, "claimed");
    store.markGenerated("invoice_1", "/tmp/one.pdf"); store.markDelivered("invoice_1");
    const second = store.claimOrder({ ...job("invoice_2"), tier: "almanac", subscriptionId: "sub_1" });
    assert.equal(second.kind, "claimed");
    store.markGenerated("invoice_2", "/tmp/two.pdf"); store.markDelivered("invoice_2");
    assert.ok(first.order.libraryToken);
    assert.equal(second.order.libraryToken, first.order.libraryToken);
    assert.equal(store.findLibrary(first.order.libraryToken!).length, 2);
    assert.equal(store.findLibraryReport(first.order.libraryToken!, "invoice_1")?.reportPath, "/tmp/one.pdf");
    assert.equal(store.findLibrarySubscription(first.order.libraryToken!), "sub_1");
  } finally {
    store.close(); rmSync(directory, { recursive: true, force: true });
  }
});

test("store exposes unfinished orders for restart recovery and records terminal failure", () => {
  const directory = mkdtempSync(join(tmpdir(), "mystic-store-"));
  const store = new EssentialStore(join(directory, "essential.sqlite"));
  try {
    store.claimOrder(job("processing"));
    store.claimOrder(job("retry")); store.markRetryPending("retry", "provider-timeout");
    store.claimOrder(job("generated")); store.markGenerated("generated", "/tmp/generated.pdf");
    store.claimOrder(job("delivered")); store.markDelivered("delivered");
    assert.deepEqual(store.findRecoverableOrders().map((item) => item.orderId), ["processing", "retry", "generated"]);
    store.markFailed("retry", "delivery-failed-after-3-attempts");
    assert.equal(store.findByOrderId("retry")?.status, "failed");
  } finally {
    store.close(); rmSync(directory, { recursive: true, force: true });
  }
});
