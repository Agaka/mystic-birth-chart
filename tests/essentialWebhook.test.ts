import assert from "node:assert/strict";
import test from "node:test";
import { buildEssentialJob } from "../src/lib/essential/job.ts";

test("Essential webhook payload is derived only from private Stripe metadata", () => {
  const job = buildEssentialJob(
    {
      id: "cs_live_example",
      metadata: {
        customer_name: "Chart Holder",
        birth_date: "2002-08-18",
        birth_time: "11:05",
        birth_city: "Porto Alegre, Brazil",
        reading_focus: "career",
      },
      customer_details: { name: "Fallback Name" },
    },
    "holder@example.com",
  );

  assert.deepEqual(job, {
    orderId: "cs_live_example",
    mode: "live",
    customer: { name: "Chart Holder", email: "holder@example.com" },
    birth: { date: "2002-08-18", time: "11:05", city: "Porto Alegre, Brazil" },
    focus: "career",
  });
});
