# Essential AI Delivery Design

## Purpose

Deliver the paid **Essential Birth Chart Reading** automatically after a successful live Stripe purchase. The product is a $17 automated, instant delivery and must be plainly described as such. It is not a hand-prepared reading.

The service will calculate chart facts deterministically, use an AI provider to write and review a traditional-first interpretation, render a branded Mystic Birth Chart PDF, and send a transactional HTML email with a private download link.

## Scope

This design covers the Essential product only. The $97 Complete Natal Reading remains a hand-prepared product and must not enter this automated pipeline.

## Architecture

```text
Stripe live payment                 Protected internal test request
        |                                       |
        +------------------+--------------------+
                           |
                    Order creation
                    (idempotent state)
                           |
              secured durable job dispatch
                           |
                   Contabo VPS worker
                           |
  deterministic chart facts -> AI writer -> AI reviewer
                           |
              branded PDF -> private storage
                           |
            Hostinger SMTP HTML delivery email
```

Vercel continues to host the public Next.js site, Stripe webhook and protected test endpoint. The Contabo VPS runs the private generation worker, which is better suited to long-lived jobs, retries and PDF rendering than a synchronous webhook. Transactional product delivery uses the existing Hostinger SMTP configuration; Brevo remains limited to newsletter automation.

## Entry Points

### Live fulfillment

The existing verified Stripe webhook receives a completed live Checkout Session for the Essential price. It creates or retrieves one order keyed by Stripe session/event data, records the status as `paid`, and dispatches a generation job. The webhook returns promptly after durable dispatch; it never waits for AI or PDF generation.

### Internal no-charge test

`POST /api/internal/essential-test` accepts a valid test payload only when it presents a dedicated high-entropy administrator secret. It follows the same order, generation, PDF and email pipeline as a live purchase, but marks the order as `test` and does not call Stripe or report analytics.

This endpoint is not linked publicly, is rate-limited, and is not an alternative checkout path.

## Provider Boundary

The application exposes a provider-neutral interface, conceptually:

```ts
interface EssentialReadingProvider {
  write(input: EssentialReadingInput): Promise<EssentialDraft>;
  review(input: EssentialReviewInput): Promise<EssentialReading>;
}
```

The initial implementation is `OpenAiReadingProvider`. It is selected with environment configuration, rather than referenced throughout fulfillment code. A future `AnthropicReadingProvider` can implement the same interface without changing checkout, calculations, PDF or email behavior.

The initial pipeline uses two independent calls:

1. **Writer** produces structured sections in Mystic's clear, traditional-first voice.
2. **Reviewer** receives the draft plus the exact chart facts and must return a corrected structured reading or a rejection.

The model never calculates astrology. It is only given normalized, server-calculated chart facts. The reviewer must reject invented placements, contradictions, fatalistic statements, medical/legal/financial claims, material promises, generic filler and undisclosed hand-prepared language.

## Chart Facts and Interpretation

The worker derives a stable `ChartFacts` object from birth date, time, city coordinates and timezone. It contains only facts needed for the Essential scope:

- Sun, Moon and Ascendant;
- chart ruler and its sign/house/condition when available;
- day or night sect;
- selected focus supplied at checkout;
- a limited set of relevant aspects and repeated themes.

The generated report is an interpretation of this hierarchy, not a list of disconnected placements. It uses careful, non-fatalistic language and includes a short scope note that astrology is reflective and educational.

## PDF and Delivery

A paid-report PDF renderer will reuse the established Mystic visual language: parchment ground, dark ink, gold details and the astrolabe seal as a watermark. It will produce a compact but substantial Essential report, rather than the free chart preview.

The generated PDF is stored privately under a random identifier. The delivery email is HTML, branded with the Mystic seal, states that the Essential Reading is automated and instant, and provides a clear download button. The email may attach the file when it is safely below the configured attachment threshold; the private download is always the reliable delivery method.

## Data Handling and Security

- Birth data, email addresses, secrets and PDF links never go to GA4, Brevo, public logs or client analytics.
- No OpenAI/Anthropic key is committed, written into a document, or exposed to the browser.
- The AI prompt excludes the buyer's name and email; only the necessary chart facts and selected focus are sent.
- Vercel-to-worker requests are signed with a timestamped HMAC to prevent replay and forged jobs.
- Orders use explicit states: `paid`, `processing`, `generated`, `delivered`, `retry_pending`, `failed` and `test`.
- Stripe retries and worker retries must not create duplicate reports or duplicate delivery emails.
- Completed report data is retained only for an explicit re-download/support period, then removed according to the product privacy policy.

## Failure Handling

If any generation step fails, the order moves to `retry_pending` with an internal error code. The worker retries bounded times with exponential delay. A final failure alerts the owner without exposing customer data in the alert. A retry resumes the order rather than starting a second report.

## Verification

Before enabling reliance on live deliveries, verify:

1. Protected test request creates a report, emails it, and produces a readable branded PDF.
2. A repeated test request with the same idempotency key does not duplicate delivery.
3. Invalid worker signature and invalid test secret are rejected.
4. Reviewer rejects an intentionally contradictory/invented draft.
5. A live Essential purchase is processed end-to-end, then refunded if used solely as a launch test.
6. The Complete product remains outside the automatic pipeline.

## Required Configuration

- `AI_PROVIDER=openai`
- `OPENAI_API_KEY`
- `OPENAI_WRITER_MODEL`
- `OPENAI_REVIEWER_MODEL`
- worker URL and shared signing secret
- internal test secret
- private report storage credentials
- existing Hostinger SMTP credentials

All values are server-only environment variables. The user must revoke the OpenAI key pasted into the chat and create a replacement before it is configured.
