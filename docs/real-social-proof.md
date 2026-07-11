# Future Real Social Proof

The former randomized purchase toast was removed and must not return.

Real social proof may be added only when there is a documented source and permission. Acceptable future inputs include:

- a customer-provided review with explicit publication consent;
- a verified order count generated from completed payment records;
- an anonymized fulfillment metric derived from real events;
- editorial feedback clearly labeled as feedback rather than a customer result.

## Implementation Requirements

1. Store consent and the exact approved quote.
2. Remove names, birth details, locations, order notes, and chart information unless the customer explicitly approves each field.
3. Do not create random recency labels or imply live activity.
4. Do not add `Review` or `AggregateRating` structured data without eligible, visible, sourced reviews.
5. Make withdrawal and correction possible.
6. Keep proof static or event-backed and test that no PII reaches analytics.
