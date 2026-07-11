# GA4 Event Map

Last updated: 2026-07-10

## Funnel

`Traffic -> free_chart_started -> free_chart_completed -> product CTA -> begin_checkout -> payment_redirect -> purchase`

`purchase` is emitted only after the confirmation page verifies a paid Stripe Checkout Session and the fulfillment endpoint succeeds. A redirect to Stripe is not a purchase.

## Events

| Event | Trigger | Funnel role | Safe parameters |
| --- | --- | --- | --- |
| `hero_primary_cta` | Primary Home hero CTA click | Direct product interest | `page`, `cta_location`, UTM |
| `hero_free_chart_cta` | Free Chart hero CTA click | Acquisition | `page`, `cta_location`, UTM |
| `free_chart_started` | Free Chart experience mounts | Start | `page`, `funnel_step`, UTM |
| `free_chart_sun_selected` | User selects a sign or asks the calculator to determine it | Micro-commitment | `page`, `funnel_step` |
| `free_chart_intention_selected` | User selects a focus | Micro-commitment | `page`, `funnel_step` |
| `free_chart_birth_data_completed` | Valid birth data is submitted | Activation | `page`, `funnel_step` |
| `free_chart_calculation_started` | Calculation begins | Activation | `page`, `funnel_step` |
| `free_chart_completed` | Preview is revealed | Value delivered | `page`, `funnel_step` |
| `free_chart_email_offer_viewed` | Optional Reading Room Letters offer renders after the result | Retention offer | `page`, `cta_location` |
| `free_chart_email_opt_in` | User explicitly opens the configured signup destination | Consent action | `page`, `cta_location` |
| `sample_report_viewed` | Sample Report page mounts | Commercial investigation | `page`, `funnel_step` |
| `reading_recommendation_selected` | Need selector choice | Product discovery | `page`, `product_id`, `product_category`, `funnel_step` |
| `view_item` | Product landing or checkout viewed | Product interest | `page`, `product_id`, `product_category`, `funnel_step` |
| `select_item` | Catalog recommendation/offer selected | Product interest | `page`, `product_id`, `product_category`, `cta_location` |
| `essential_reading_cta` | Essential CTA click | Core offer | `page`, `product_id`, `product_category`, `cta_location` |
| `complete_reading_cta` | Complete CTA click | Upgrade offer | `page`, `product_id`, `product_category`, `cta_location` |
| `begin_checkout` | Valid checkout details are submitted to create Stripe Checkout | Checkout | `page`, `product_id`, `product_category`, `funnel_step` |
| `checkout_validation_error` | Checkout cannot proceed because a field or server response is invalid | Checkout diagnostics | `page`, `product_id`, `funnel_step` |
| `payment_redirect` | Browser is about to leave for Stripe | Payment handoff | `page`, `product_id`, `funnel_step` |
| `purchase` | Paid Stripe session and fulfillment are verified | Conversion | `page`, `product_id`, `product_category` |

## Parameter Policy

Allowed campaign and funnel data:

- page path;
- product id;
- product category;
- funnel step;
- experiment variant;
- CTA location;
- UTM source, medium, and campaign.

Never send:

- name or email;
- birth date or time;
- city, country, timezone, latitude, or longitude;
- selected or calculated signs;
- chart ruler, sect, houses, aspects, or interpretations;
- focus when it can be connected to an identified customer;
- notes, report text, partner data, or Stripe session id.

The analytics helper uses an allowlist and stores only UTM attribution in `sessionStorage`. GA4 page views do not include arbitrary query parameters.

## A/B Test Deferred

No feature-flag platform exists in the project. Keep the optimized five-step Free Chart as the control. A later test may compare it with a three-step variant only after:

1. a stable anonymous assignment mechanism exists;
2. `experiment_variant` is included without birth data;
3. both variants preserve free value and accessibility;
4. sample size and success criteria are defined before launch.

Primary success metric: Free Chart completion to verified purchase. Guardrails: completion rate, time to value, checkout validation errors, and accessibility regressions.
