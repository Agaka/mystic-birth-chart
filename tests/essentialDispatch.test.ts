import assert from "node:assert/strict";
import test from "node:test";
import {
  createDispatchSignature,
  dispatchEssentialJob,
  verifyDispatchSignature,
} from "../src/lib/essential/dispatch.ts";

const body = JSON.stringify({ orderId: "cs_live_123", mode: "live" });
const timestamp = "1721600000";
const secret = "test-secret";

test("dispatch signature binds method, path, timestamp and body", () => {
  const signature = createDispatchSignature("POST", "/jobs/essential", timestamp, body, secret);

  assert.equal(
    verifyDispatchSignature("POST", "/jobs/essential", timestamp, body, signature, secret, Number(timestamp)),
    true,
  );
  assert.equal(
    verifyDispatchSignature("POST", "/jobs/essential", timestamp, `${body}x`, signature, secret, Number(timestamp)),
    false,
  );
  assert.equal(
    verifyDispatchSignature("POST", "/jobs/essential", timestamp, body, signature, secret, Number(timestamp) + 301),
    false,
  );
});

test("dispatch sends a signed job to the worker", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const response = await dispatchEssentialJob(
    {
      orderId: "test_example",
      mode: "test",
      customer: { name: "Tester", email: "test@example.com" },
      birth: { date: "2002-08-18", time: "11:05", city: "Porto Alegre, Brazil" },
      focus: "general",
    },
    {
      workerUrl: "https://worker.example.com/base",
      sharedSecret: secret,
      fetchImpl: async (url, init) => {
        calls.push({ url: String(url), init });
        return new Response(JSON.stringify({ accepted: true }), { status: 202 });
      },
    },
  );

  assert.equal(response.status, 202);
  assert.equal(calls.length, 1);
  const call = calls[0]!;
  assert.equal(call.url, "https://worker.example.com/jobs/reports");
  assert.equal(call.init?.method, "POST");
  assert.ok(new Headers(call.init?.headers).get("x-mystic-signature"));
  assert.ok(new Headers(call.init?.headers).get("x-mystic-timestamp"));
});
