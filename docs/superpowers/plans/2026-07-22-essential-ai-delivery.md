# Essential AI Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the $17 Essential Birth Chart Reading automatically as a reviewed Mystic PDF after verified Stripe payment, with a protected no-charge test route.

**Architecture:** Vercel verifies Stripe and dispatches a signed job. A Node worker on the Contabo VPS owns idempotency, chart-fact creation, two AI calls, PDF generation, private report storage and SMTP delivery. Checkout metadata remains the authoritative customer input.

**Tech Stack:** Next.js 16 route handlers, Stripe SDK, Node 20+, OpenAI SDK, SQLite, Nodemailer, pdf-lib, Docker Compose.

## Global Constraints

- Essential is automated, $17, instant delivery. Never call it hand-prepared.
- Complete remains a $97 hand-prepared product and must keep its existing path.
- The AI interprets server-calculated facts only; it cannot calculate placements.
- `OpenAiReadingProvider` is selected by environment variable. Its interface supports a future Anthropic adapter.
- Writer and reviewer are separate calls.
- Birth data, email, reports, report URLs and secrets never go to GA4, Brevo, browser analytics or logs.
- No API key is committed. Revoke the key pasted in chat and use a replacement secret.

---

## Task 1: Shared Essential contracts and signed dispatch

**Files:**
- Create: `src/lib/essential/contracts.ts`
- Create: `src/lib/essential/dispatch.ts`
- Test: `tests/essentialContracts.test.ts`
- Test: `tests/essentialDispatch.test.ts`

**Produces:** `EssentialJob`, `EssentialReport`, `EssentialReadingProvider`, `createDispatchSignature`, `verifyDispatchSignature`, `dispatchEssentialJob`.

- [ ] Write the failing test:

```ts
test("dispatch signature binds method, path, timestamp and body", () => {
  const body = JSON.stringify({ orderId: "cs_live_123", mode: "live" });
  const signature = createDispatchSignature("POST", "/jobs/essential", "1721600000", body, "secret");
  assert.equal(verifyDispatchSignature("POST", "/jobs/essential", "1721600000", body, signature, "secret", 1721600000), true);
  assert.equal(verifyDispatchSignature("POST", "/jobs/essential", "1721600000", `${body}x`, signature, "secret", 1721600000), false);
});
```

- [ ] Run `npm test -- tests/essentialContracts.test.ts tests/essentialDispatch.test.ts`; expected failure: modules not found.
- [ ] Implement:

```ts
export interface EssentialJob {
  orderId: string;
  mode: "live" | "test";
  customer: { email: string; name: string };
  birth: { date: string; time: string; city: string };
  focus: string;
}

export interface EssentialReadingProvider {
  write(input: EssentialWriterInput): Promise<EssentialDraft>;
  review(input: EssentialReviewInput): Promise<EssentialReport>;
}
```

Use `createHmac("sha256", secret)` over method, path, timestamp and body separated by newlines. Reject timestamps older than five minutes, use `timingSafeEqual`, require worker URL/HMAC secret and abort dispatch after eight seconds.

- [ ] Run `npm test -- tests/essentialContracts.test.ts tests/essentialDispatch.test.ts; npm run lint; npm run typecheck`; expected: pass.
- [ ] Commit with `git add src/lib/essential tests/essentialContracts.test.ts tests/essentialDispatch.test.ts` and `git commit -m "feat: add signed essential job dispatch"`.

## Task 2: Stripe is the only Essential fulfillment trigger

**Files:**
- Modify: `src/app/api/stripe/webhook/route.ts`
- Modify: `src/app/api/email/route.ts`
- Modify: `src/app/thank-you/page.tsx`
- Test: `tests/essentialWebhook.test.ts`

**Consumes:** Task 1 dispatch helper and existing Stripe verification.

**Produces:** Only a verified Stripe webhook can start a live Essential report. The browser never sends fulfillment requests.

- [ ] Write a test with an exported `handleCompletedCheckoutSession` helper. Assert Basic dispatches `EssentialJob` and never calls `fulfillOrder`; assert Complete still calls `fulfillOrder`.
- [ ] Run `npm test -- tests/essentialWebhook.test.ts`; expected: failure because the current webhook sends all tiers through `/api/email`.
- [ ] Implement Basic routing:

```ts
if (tier === "basic") {
  await dispatchEssentialJob({
    orderId: session.id,
    mode: "live",
    customer: { email, name: metadata.customer_name || session.customer_details?.name || "" },
    birth: { date: metadata.birth_date || "", time: metadata.birth_time || "", city: metadata.birth_city || "" },
    focus: metadata.reading_focus || "general",
  });
  return NextResponse.json({ received: true, dispatched: true });
}
```

Do not mark fulfilled in Vercel. Return 500 when dispatch fails so Stripe retries.

- [ ] After Stripe session verification, make `/api/email` return 409 for Basic and delete only the old static Essential generation/email helpers. Manual products must remain unchanged.
- [ ] Remove the `fetch("/api/email")` effect from `src/app/thank-you/page.tsx`. Essential copy says it is being prepared, not already sent.
- [ ] Run `npm test -- tests/essentialWebhook.test.ts; npm run test; npm run lint; npm run typecheck`; expected: pass.
- [ ] Commit with message `feat: dispatch essential orders to worker`.

## Task 3: Protected no-charge test entry

**Files:**
- Create: `src/lib/essential/testRequest.ts`
- Create: `src/app/api/internal/essential-test/route.ts`
- Test: `tests/essentialTestRoute.test.ts`

**Produces:** An unlinked route that dispatches `mode: "test"`, skips Stripe and does not emit analytics.

- [ ] Write test cases: missing `x-essential-test-secret` returns 401, bad secret 403, malformed fields 400, valid payload 202 with `{ queued: true, mode: "test" }`.
- [ ] Run `npm test -- tests/essentialTestRoute.test.ts`; expected failure: endpoint missing.
- [ ] Implement strict input validation using checkout's length/email rules; verify the secret with `timingSafeEqual`; generate `test_${crypto.randomUUID()}`; dispatch once.
- [ ] Add per-IP limiter: three accepted requests per 15 minutes. Further requests return 429 and `Retry-After: 900`.
- [ ] Run `npm test -- tests/essentialTestRoute.test.ts; npm run lint; npm run typecheck`; expected: pass.
- [ ] Commit with message `feat: add essential test delivery route`.

## Task 4: Durable VPS worker and report store

**Files:**
- Create: `worker/package.json`
- Create: `worker/tsconfig.json`
- Create: `worker/src/server.ts`
- Create: `worker/src/store.ts`
- Create: `worker/Dockerfile`
- Create: `worker/docker-compose.yml`
- Create: `worker/.env.example`
- Test: `worker/tests/store.test.ts`

**Produces:** Authenticated job intake, SQLite idempotency, report tokens, and downloadable PDF endpoint.

- [ ] Write store tests: first claim is `claimed`; delivered repeated id is `duplicate`; retryable order is `resume`; token has 32 random bytes and differs from order id.
- [ ] Run worker tests; expected failure: worker/store missing.
- [ ] Implement SQLite table `essential_orders` with primary key `order_id`, mode, state, minimized birth data, focus, token/path, attempts, timestamps and expiry. Only allow:

```text
paid/test -> processing -> generated -> delivered
processing -> retry_pending -> processing
processing -> failed
```

- [ ] Implement `POST /jobs/essential`: verify HMAC before parsing payload, return 202 for claim/resume and 200 for duplicate. Implement `GET /healthz` with no customer data. Implement `GET /reports/:token` only for unexpired records with `Cache-Control: private, no-store`.
- [ ] Docker mount `/data` for SQLite and `/data/reports`. Proxy HTTPS only for `/jobs/essential`, `/reports/*`, `/healthz`.
- [ ] Run from `worker`: `npm test; npm run typecheck`; expected: pass.
- [ ] Commit with message `feat: add essential delivery worker`.

## Task 5: Deterministic facts and two-call OpenAI provider

**Files:**
- Create: `worker/src/chartFacts.ts`
- Create: `worker/src/providers/types.ts`
- Create: `worker/src/providers/openai.ts`
- Create: `worker/src/providers/index.ts`
- Test: `worker/tests/provider.test.ts`

**Produces:** `ChartFacts`, `OpenAiReadingProvider` and a provider selector with no OpenAI dependencies outside the provider folder.

- [ ] Write tests using the current Porto Alegre regression chart: Leo Sun, Capricorn Moon, Scorpio Rising, Mars ruler, Day chart. With fake OpenAI client, assert writer runs before reviewer and neither prompt contains name/email.
- [ ] Run worker provider test; expected failure: modules missing.
- [ ] Use `calculateNatalSnapshot` to create exactly:

```ts
export interface ChartFacts {
  sun: string; moon: string; rising: string; chartRuler: string;
  sect: "Day chart" | "Night chart"; moonPhase: string; focus: string;
  calculationLimit: string;
}
```

Resolve canonical city coordinates/timezone once and persist the canonical result. The LLM never sees raw customer identity.

- [ ] Writer must return JSON `{ title, opening, sections, focusSection, closing, scopeNote }`. Reviewer receives the exact facts/draft and rejects invented placements/aspects/houses, fatalism, medical/legal/financial guidance, material guarantees, generic filler and “hand-prepared” claims.
- [ ] `AI_PROVIDER=openai` selects the adapter. `anthropic` throws a clear not-configured error until a future `AnthropicReadingProvider` implements the same interface.
- [ ] Run from `worker`: `npm test -- provider.test.ts; npm run typecheck`; expected: pass.
- [ ] Commit with message `feat: add reviewed OpenAI reading provider`.

## Task 6: Mystic PDF, branded email and processing orchestration

**Files:**
- Create: `worker/src/essentialPdf.ts`
- Create: `worker/src/email.ts`
- Create: `worker/src/processOrder.ts`
- Modify: `worker/src/server.ts`
- Test: `worker/tests/processOrder.test.ts`

**Produces:** A branded PDF attached/linked once per delivery.

- [ ] Write tests with fakes: success calls writer -> reviewer -> PDF -> mail -> delivered; provider timeout becomes retry pending and never calls mail; delivered duplicate does nothing.
- [ ] Run tests; expected failure: orchestration missing.
- [ ] Use pdf-lib and `public/brand/mystic-astrolabe-seal-transparent.png` plus the parchment texture. Render cover, chart-at-a-glance, four to six reviewed sections, focus section and scope note. Cover must say “Automated Essential Birth Chart Reading” and “Generated instantly from your submitted birth data.”
- [ ] Build a 620px table-compatible HTML email: dark header, hosted Mystic seal, parchment body, gold `Download your reading` button. State automated/instant once. Attach PDF only when under 7 MB; always include token URL.
- [ ] `processEssentialOrder` writes `/data/reports/<token>.pdf`, marks generated, sends client and owner e-mail, then marks delivered. Logs contain only order id, status and error class.
- [ ] Run `npm test -- processOrder.test.ts; npm run typecheck`, then render a sample PDF and visually inspect watermark/text bounds.
- [ ] Commit with message `feat: generate and deliver essential PDFs`.

## Task 7: Buyer status and configuration documentation

**Files:**
- Create: `src/app/api/orders/status/route.ts`
- Modify: `src/app/thank-you/page.tsx`
- Modify: `.env.example`
- Modify: `README.md`
- Test: `tests/essentialStatus.test.ts`

**Produces:** Truthful Essential delivery status and complete server-only configuration instructions.

- [ ] Write status test: reject missing/invalid session id; map worker status to only `processing`, `delivered`, `needs_support`; response cannot contain e-mail, birth details, report URL or worker error.
- [ ] Implement signed Vercel proxy to worker `GET /orders/:id/status`; Essential thank-you polls maximum 90 seconds. Processing says it is preparing; delivered says check e-mail; needs-support links `hello@mysticbirthchart.com`. Manual product UI remains unchanged.
- [ ] Add only empty variables to `.env.example`:

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_WRITER_MODEL=
OPENAI_REVIEWER_MODEL=
ESSENTIAL_WORKER_URL=
ESSENTIAL_WORKER_SHARED_SECRET=
ESSENTIAL_TEST_SECRET=
```

- [ ] Document Vercel config, VPS Docker deploy, provider key rotation and a redacted test curl request in README.
- [ ] Run `npm run test; npm run lint; npm run typecheck; npm run build`; expected: pass.
- [ ] Commit with message `feat: add essential delivery status`.

## Task 8: Production verification

- [ ] Deploy worker on Contabo using `/opt/mystic-essential/.env`, `docker compose up -d --build`, HTTPS reverse proxy and `/healthz` check.
- [ ] Add replacement OpenAI key, models, worker URL, HMAC secret and test secret to Vercel Production only.
- [ ] Run a protected no-charge end-to-end test to a controlled inbox. Confirm the e-mail, PDF, token URL and duplicate prevention.
- [ ] Ask explicit approval before making a real Essential live charge. Then verify Stripe event, worker state, delivery and GA4 purchase; refund if solely a launch test.

## Self-Review

- Tasks 1-3 establish signed Vercel entry, unique live trigger and no-charge testing.
- Tasks 4-6 establish durable processing, provider substitution, two-call generation/review, private PDF and delivery.
- Task 7 keeps buyer messaging honest and makes configuration repeatable.
- Task 8 requires test proof before any customer depends on fulfillment.
