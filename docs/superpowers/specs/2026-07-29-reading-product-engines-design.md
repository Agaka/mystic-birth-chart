# Mystic Reading Product Engines Design

## Objective

Complete the deterministic data and fulfillment engines for every currently sold Mystic reading except the unfinished Hermetic correspondence expansion. Keep all current public promises and visual identity unchanged. A report may use AI for prose only after its technical evidence has been calculated, normalized, and validated.

## Product Boundaries

- Essential remains its existing 16-20 page automated first synthesis.
- Complete becomes a 45-60 page whole natal judgment with seven traditional planets, twelve houses, dispositors, receptions, angularity, sect, dignities, repeated testimony, contradictions, and applied synthesis. It contains no timing.
- Love and Career use the same natal evidence engine but receive focused, product-specific evidence packets matching the owner's approved chapter lists.
- The 12-Month Forecast uses profection and selected natal transits only. It does not include a solar return or complete natal judgment.
- Synastry uses two natal evidence packets, inter-chart aspects, receptions, reliable angle contacts, and house overlays only where birth times permit them. It never produces a score.
- Premium Dossier combines the Complete natal foundation with profection, a calculated solar return, selected transits, convergence windows, quarterly/monthly timeline, an annual summary, an at-a-glance table, and an ICS calendar.
- House Almanac creates one idempotent monthly edition for an active subscription, stores every edition permanently, and exposes private history plus Stripe's customer portal for cancellation/reactivation.
- Hermetic Kabbalah continues using only the currently closed correspondence table. No new correspondence, angelic instruction, Psalm, color, metal, perfume, or path is added until the owner completes the audit.

## Architecture

### Natal evidence engine

`worker/src/natalEvidence.ts` consumes a calculated `FullChart` and produces typed evidence: twelve house judgments, traditional dispositors, dispositor chains, mutual or unilateral receptions by domicile/exaltation, angular planets, vocational and relational evidence packets, repeated testimonies, and a ranked natal hierarchy. The AI receives this result and may not infer missing technical facts.

### Timing engine

`worker/src/timingEngine.ts` calculates exact transit hits by bracketing and refining longitude-error minima instead of accepting a daily sample as the event. Every event records application-window start, exact date, separation-window end, orb rule, transit speed/direction, target, and category. It calculates profection changes at birthdays and groups dates where independent testimony converges.

### Synastry engine

`worker/src/synastryEngine.ts` builds traditional inter-chart aspects, sign receptions, reliable angle contacts, and house overlays. Unknown times remove angles, houses, sect, and chart ruler from that person's usable data. The Moon receives an explicit sign-range warning if it can change sign during the unknown birth date.

### Artifact engine

The product PDF receives product-specific technical appendices and chart wheels rather than only generic flowing prose. Dossier fulfillment also writes an annual summary PDF and RFC 5545 ICS file. Server downloads support PDF and ICS assets with private tokens.

### Subscription history

SQLite stores every Almanac edition by Stripe subscription and period key. The invoice ID remains the idempotency key. A signed Vercel-to-worker endpoint lists the authenticated customer's reports; a Vercel route creates Stripe Billing Portal sessions. Customer history is accessed through a signed email link because the site has no account/authentication system today.

## AI Contract and Validation

- Each chapter receives only the evidence relevant to that chapter plus a compact global hierarchy.
- Draft and review remain separate model calls.
- A deterministic pre-render validator rejects prose that cites an unsupported degree, aspect, house, dignity, date, planet, reception, or timing technique.
- Product word/page ranges are verified after rendering. A report outside its promised range fails fulfillment and retries rather than being delivered.
- Modern planets remain secondary and may not outrank the chart ruler, sect light, relevant house rulers, angular planets, dignity, or traditional aspects.

## Failure Handling

- Invalid birth data, missing product-specific input, failed geocoding, failed validation, and out-of-range reports become explicit retryable error codes.
- Duplicate Stripe events reuse the existing order/edition.
- Failed subscription payments create no new edition and never delete history.
- Kabbalah generation remains available only with the current audited subset; new unfinished correspondence fields are omitted, never guessed.

## Verification

Unit tests cover dispositors, receptions, evidence packets, exact transit refinement, birthday profection changes, unknown-time synastry, house overlays, ICS validity, period-key idempotency, and report validation. Integration tests render each product from deterministic fixtures without calling OpenAI. The final gate is root typecheck/tests/build plus worker typecheck/tests and local inspection of PDF page counts and artifacts.
