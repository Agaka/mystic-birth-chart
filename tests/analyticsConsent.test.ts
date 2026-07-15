import assert from "node:assert/strict";
import test from "node:test";
import {
  analyticsConsentStorageKey,
  readAnalyticsConsent,
  updateAnalyticsConsent,
} from "../src/lib/analyticsConsent.ts";

test("analytics consent stores an explicit choice and keeps ad storage denied", () => {
  const calls: unknown[][] = [];
  const memory = new Map<string, string>();
  const events: string[] = [];
  const fakeWindow = {
    dataLayer: [],
    gtag: (...args: unknown[]) => calls.push(args),
    localStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
    },
    dispatchEvent: (event: Event) => events.push(event.type),
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: fakeWindow,
  });

  assert.equal(readAnalyticsConsent(), null);
  updateAnalyticsConsent("granted");

  assert.equal(memory.get(analyticsConsentStorageKey), "granted");
  assert.equal(readAnalyticsConsent(), "granted");
  assert.deepEqual(calls, [
    [
      "consent",
      "update",
      {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ],
  ]);
  assert.deepEqual(events, ["mystic-analytics-consent-changed"]);

  delete (globalThis as { window?: unknown }).window;
});
