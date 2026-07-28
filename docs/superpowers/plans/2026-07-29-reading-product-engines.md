# Mystic Reading Product Engines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver technically grounded automated fulfillment for every current Mystic reading except the unfinished Hermetic correspondence expansion.

**Architecture:** Derive typed natal, timing, and synastry evidence before AI writing; validate report claims before rendering; produce product-specific PDF/calendar artifacts; persist recurring Almanac history. Existing Stripe, HMAC, OpenAI proxy, branded PDF, and email boundaries remain in place.

**Tech Stack:** TypeScript, Node 22, astronomy-engine, pdf-lib, SQLite/better-sqlite3, Next.js 16, Stripe.

## Global Constraints

- Do not change public hand-prepared wording or prices in this phase.
- Do not add or modify unfinished Kabbalah correspondences.
- Use tropical zodiac, whole-sign houses, traditional rulers, and traditional-first hierarchy.
- Never generate unsupported astrology claims, deterministic predictions, medical/financial/legal advice, or relationship verdicts.
- Every implementation task follows red-green-refactor and ends with focused tests.

---

### Task 1: Shared Natal Evidence Engine

**Files:**
- Create: `worker/src/natalEvidence.ts`
- Create: `worker/tests/natalEvidence.test.ts`
- Modify: `worker/src/reportFacts.ts`
- Modify: `worker/src/reportCatalog.ts`

**Interfaces:**
- Consumes: `FullChart` from `worker/src/fullChart.ts`.
- Produces: `buildNatalEvidence(chart): NatalEvidence`, including `houses`, `dispositors`, `receptions`, `angularPlanets`, `repeatedTestimony`, `relationship`, and `vocation`.

- [ ] Write literal tests for domicile dispositors, mutual reception, all twelve house packets, seventh-house relationship hierarchy, and tenth-house vocational hierarchy.
- [ ] Run `npm test -- tests/natalEvidence.test.ts` in `worker` and confirm missing-module failure.
- [ ] Implement the typed engine with no prose generation.
- [ ] Connect evidence to ProductFacts and specialized blueprints.
- [ ] Run worker typecheck and tests.

### Task 2: Exact Timing and Forecast Engine

**Files:**
- Create: `worker/src/timingEngine.ts`
- Create: `worker/tests/timingEngine.test.ts`
- Modify: `worker/src/reportFacts.ts`
- Modify: `worker/src/productPdf.ts`

**Interfaces:**
- Produces `TimingEvent` with `applyingAt`, `exactAt`, `separatingAt`, `orb`, `direction`, `technique`, `target`, and `category`.
- Produces `TimingCycle` with profection periods, twelve months, selected events, and convergence windows.

- [ ] Write tests proving refined exactness is closer than daily sampling and a birthday changes profection on the correct date.
- [ ] Run focused tests and confirm failure.
- [ ] Implement bracket/refinement, event selection, deduplication, and convergence grouping.
- [ ] Replace the daily threshold forecast and feed date tables into PDF facts.
- [ ] Run worker typecheck and tests.

### Task 3: Complete, Love, Career, and Dossier Evidence

**Files:**
- Modify: `worker/src/reportCatalog.ts`
- Modify: `worker/src/reportFacts.ts`
- Modify: `worker/src/productProviders.ts`
- Modify: `src/app/api/internal/report-ai/route.ts`
- Create: `worker/tests/productEvidence.test.ts`

**Interfaces:**
- Produces chapter-specific evidence slices, not the entire raw JSON for every call.
- Dossier includes both `AnnualFacts` and `TimingCycle` beginning at the solar return.

- [ ] Write tests that each promised section has a corresponding evidence key and that Forecast excludes solar return while Dossier includes it.
- [ ] Confirm tests fail on current generic facts.
- [ ] Expand product blueprints into editorial chapters sized to the approved page/word promises.
- [ ] Route only relevant evidence to each AI chapter and preserve two-pass generation.
- [ ] Run app and worker focused tests/typecheck.

### Task 4: Synastry Engine and Chart Assets

**Files:**
- Create: `worker/src/synastryEngine.ts`
- Create: `worker/src/chartWheel.ts`
- Create: `worker/tests/synastryEngine.test.ts`
- Modify: `worker/src/reportFacts.ts`
- Modify: `worker/src/productPdf.ts`
- Modify: `src/components/CheckoutForm.tsx`

**Interfaces:**
- Produces `SynastryEvidence` with inter-chart contacts, receptions, overlays, reliability warnings, and Moon uncertainty.
- Produces deterministic SVG/PNG-compatible wheel drawing data for each natal chart and bi-wheel.

- [ ] Write tests for known-known, known-unknown, and unknown-unknown birth times.
- [ ] Confirm current contacts fail overlay/reception/reliability expectations.
- [ ] Implement evidence and chart wheel renderer.
- [ ] Render two natal wheels plus bi-wheel in the Synastry PDF.
- [ ] Run focused and full worker tests.

### Task 5: Dossier Companion Artifacts

**Files:**
- Create: `worker/src/calendar.ts`
- Create: `worker/tests/calendar.test.ts`
- Modify: `worker/src/processOrder.ts`
- Modify: `worker/src/store.ts`
- Modify: `worker/src/server.ts`
- Modify: `worker/src/email.ts`
- Modify: `src/app/api/internal/essential-email/route.ts`

**Interfaces:**
- Produces a valid RFC 5545 calendar and annual-summary PDF from selected timing events.
- Stores `calendar_path` and `summary_path`; exposes private `/calendar` and `/summary` downloads.

- [ ] Write tests for escaping, UTC timestamps, stable UIDs, and three stored assets.
- [ ] Confirm failure before implementation.
- [ ] Implement ICS/summary generation, storage, downloads, and branded email links/attachments.
- [ ] Run worker and app tests/typecheck.

### Task 6: Almanac History and Subscription Control

**Files:**
- Modify: `worker/src/store.ts`
- Modify: `worker/src/server.ts`
- Modify: `src/app/api/stripe/webhook/route.ts`
- Create: `src/app/api/almanac/history/route.ts`
- Create: `src/app/api/almanac/portal/route.ts`
- Create: `src/app/almanac-library/page.tsx`
- Create: `worker/tests/almanacHistory.test.ts`

**Interfaces:**
- Edition key: `${subscriptionId}:${YYYY-MM}` in customer time zone.
- Signed history token maps to subscription/customer without exposing email or birth data.

- [ ] Write tests for monthly dedupe, preserved failed-payment history, and ordered edition listing.
- [ ] Confirm failure on current order-only store.
- [ ] Implement edition persistence, signed history endpoint, library view, and Stripe portal session.
- [ ] Ensure `invoice.paid` is the only generation trigger and failed payments create nothing.
- [ ] Run root and worker test suites.

### Task 7: Deterministic Validation and Release Gate

**Files:**
- Create: `worker/src/reportValidator.ts`
- Create: `worker/tests/reportValidator.test.ts`
- Modify: `worker/src/processOrder.ts`
- Modify: `worker/src/productPdf.ts`
- Modify: `MYSTIC_CONTEXT.md`

**Interfaces:**
- `validateProductReport(blueprint, facts, report): ValidationResult` rejects unsupported technical tokens and range failures.

- [ ] Write failing tests for invented aspects, houses, dates, dignity, insufficient words, and out-of-range pages.
- [ ] Implement pre-render claim validation and post-render page-count validation.
- [ ] Render deterministic fixtures for every non-Kabbalah product and inspect artifact counts/page ranges.
- [ ] Run `npm run typecheck`, `npm test`, and `npm run build` at root; run `npm run typecheck` and `npm test` in worker.
- [ ] Update context, commit the completed branch, integrate to main, deploy Vercel/VPS, and verify public health/routes.
