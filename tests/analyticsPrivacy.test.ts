import assert from "node:assert/strict";
import test from "node:test";
import { trackEvent } from "../src/lib/analytics.ts";

test("analytics drops personal and birth-chart data", () => {
  const calls: unknown[][] = [];
  const memory = new Map<string, string>();
  const fakeWindow = {
    location: {
      pathname: "/free-birth-chart",
      search: "?utm_source=pinterest&utm_medium=organic-social&utm_campaign=chart-ruler",
    },
    dataLayer: [],
    gtag: (...args: unknown[]) => calls.push(args),
    sessionStorage: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: fakeWindow,
  });

  trackEvent("free_chart_completed", {
    product_id: "basic",
    funnel_step: "preview",
    email: "private@example.com",
    birth_date: "2002-08-18",
    birth_time: "11:05",
    birth_city: "Porto Alegre",
    latitude: -30.0346,
    longitude: -51.2177,
    sun_sign: "Leo",
    report_text: "private interpretation",
  });

  assert.equal(calls.length, 1);
  const [, eventName, params] = calls[0] as [string, string, Record<string, unknown>];
  assert.equal(eventName, "free_chart_completed");
  assert.deepEqual(params, {
    page: "/free-birth-chart",
    utm_source: "pinterest",
    utm_medium: "organic-social",
    utm_campaign: "chart-ruler",
    product_id: "basic",
    funnel_step: "preview",
  });

  delete (globalThis as { window?: unknown }).window;
});

test("analytics keeps the standard purchase revenue fields", () => {
  const calls: unknown[][] = [];
  const fakeWindow = {
    location: { pathname: "/thank-you", search: "" },
    dataLayer: [],
    gtag: (...args: unknown[]) => calls.push(args),
    sessionStorage: { getItem: () => null, setItem: () => undefined },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: fakeWindow,
  });

  trackEvent("purchase", {
    product_id: "basic",
    product_category: "reading",
    value: 17,
    currency: "USD",
    transaction_id: "cs_live_example",
    items: [
      {
        item_id: "basic",
        item_category: "reading",
        price: 17,
        quantity: 1,
        customer_email: "private@example.com",
      },
    ] as never,
  });

  const [, eventName, params] = calls[0] as [string, string, Record<string, unknown>];
  assert.equal(eventName, "purchase");
  assert.deepEqual(params, {
    page: "/thank-you",
    product_id: "basic",
    product_category: "reading",
    value: 17,
    currency: "USD",
    transaction_id: "cs_live_example",
    items: [
      {
        item_id: "basic",
        item_category: "reading",
        price: 17,
        quantity: 1,
      },
    ],
  });

  delete (globalThis as { window?: unknown }).window;
});
