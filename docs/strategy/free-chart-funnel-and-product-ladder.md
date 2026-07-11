# Mystic Birth Chart - Free Chart Funnel and Product Ladder

> Historical planning note. Some prices, routes, event names, and proposed email/PDF features below were exploratory and are not current product truth. Use `MYSTIC_CONTEXT.md`, `docs/growth-strategy.md`, and `docs/analytics-event-map.md` for current implementation decisions. The current core offers are the automated Essential Reading at $17 and the individually prepared Complete Reading at $97.

Last updated: 2026-07-09

This document records the next strategic direction for Mystic Birth Chart after the initial site, domain, email, Search Console, and Stripe setup. It should be read together with `MYSTIC_CONTEXT.md`.

## Current Stage

Mystic Birth Chart is no longer only a content site with a reading offer. It is now entering funnel optimization:

- The site is live at `https://mysticbirthchart.com`.
- The site has been submitted/indexed through Google Search Console.
- Email is configured.
- Stripe is configured.
- Two paid products exist: an automated Essential Birth Chart Reading at `$17` and a hand-prepared Complete Chart around `$97`.
- The buyer receives an email after purchase and the owner receives the order email.
- The free chart tool exists and should become the main cold-traffic conversion path.
- GA4 has not been configured yet.

## Core Funnel Goal

Transform the free chart into a guided, progressive, mobile-first experience:

1. Ad, social post, search result, or blog post.
2. Simple zodiac sign entry.
3. User intention selection.
4. Birth data form.
5. Premium calculation screen.
6. Useful free chart preview.
7. Optional email capture after value is delivered.
8. Personalized product recommendation.
9. Paid reading checkout.
10. Email follow-up and future product ladder.

This should borrow the psychology of astrology quizzes that convert well, but without predatory patterns.

Do not use:

- Palm reading hooks.
- Fake proof.
- False urgency.
- Hidden subscriptions.
- Predatory trials.
- Guaranteed prediction claims.
- "The universe chose you" language.
- Email walls before the user receives value.

## Central Message

Use this idea repeatedly:

> Your Sun sign is only the first layer. A real birth chart is a hierarchy of planets, houses, rulers, aspects, and repeated themes.

Supporting idea:

> A chart is not a list of placements. It is a hierarchy.

## Tone

The experience should feel:

- Serious.
- Elegant.
- Traditional.
- Symbolic.
- Personal without pretending certainty.
- Mysterious without becoming fantasy.
- Commercial without feeling like a cheap psychic funnel.

Avoid generic horoscope language and exaggerated claims.

## Free Chart Experience

### Step 1: Zodiac Entry

Headline:

```text
Start with your zodiac sign.
```

Subheadline:

```text
Your Sun sign is only the first layer. Reveal your Moon, Rising sign, chart ruler, and day or night chart.
```

Show the 12 zodiac signs as a clickable grid.

After the user selects a sign:

```text
Leo is only the first layer. Let's calculate the structure behind it.
```

The selected sign reduces friction only. The real Sun sign must still be calculated from birth data. If the selected sign and calculated sign differ, trust the calculated result.

### Step 2: User Intention

Ask:

```text
What do you want your chart to clarify?
```

Options:

- Love and relationships
- Career and vocation
- Emotional patterns
- Life direction
- Current life phase
- Shadow and personal growth
- I want to understand my whole chart

Use the selected intention for:

- Result copy.
- CTA copy.
- Product recommendation.
- Email segmentation.
- Remarketing audiences.
- Future content planning.

### Step 3: Birth Data

Ask for:

- Birth date.
- Birth time.
- Birth city.

Explain:

```text
Your birth time determines your Rising sign, houses, chart ruler, and day or night chart.
```

Keep city search intelligent. Do not ask normal users to enter latitude and longitude.

Privacy expectations:

- Explain clearly where the data is processed.
- Do not claim everything stays in the browser if backend processing is used.
- Store only what is needed.
- Do not require an account.

### Step 4: Calculation Screen

Replace generic loading with a short premium sequence:

- Calculating your Sun...
- Locating your Moon...
- Finding your Rising sign...
- Following your chart ruler...
- Checking whether this is a day or night chart...
- Preparing your first synthesis...

Guidelines:

- Do not create a long fake wait.
- Aim for about 3 to 8 seconds if the flow needs a transition.
- Use a subtle progress state or forming chart wheel.
- Keep the animation readable and fast on mobile.

### Step 5: Free Result

The free result must be useful enough to create trust and recognition.

Show:

1. A headline such as:

```text
Leo Sun. Capricorn Moon. Scorpio Rising.
```

2. A short synthesis such as:

```text
A chart of controlled fire: visibility, ambition, privacy, and intensity trying to serve one direction.
```

3. Sun.
4. Moon.
5. Rising sign.
6. Traditional chart ruler.
7. Day or night chart.
8. One initial central pattern or tension.
9. One intention-based reflection or action.

Use this bridge to the paid reading:

```text
This preview identifies the front door of the chart. The complete reading reveals the architecture behind it.
```

Avoid wording that devalues the free preview:

- "static interpretation"
- "generic interpretation"
- "basic automated text"

### Step 6: Locked Value Cards

After the free result, show a section:

```text
Still hidden in your full chart
```

Possible cards:

- The house where your Sun operates.
- Where your Moon seeks protection.
- The position and condition of your chart ruler.
- Your strongest or most emphasized planets.
- Major aspects and internal tensions.
- Love and attachment patterns.
- Career and vocation signatures.
- Repeated themes across the chart.
- Current timing and upcoming transits.

Do not use fake blurred answers. The cards should honestly explain what the paid reading interprets.

### Step 7: Email Capture After Value

Do not place an email wall before the result.

After value is delivered, offer:

```text
Send my chart preview as a PDF
```

or:

```text
Save my chart and receive the PDF by email.
```

The free PDF should include:

- Name.
- Birth data.
- Sun, Moon, Rising.
- Chart ruler.
- Day/night chart.
- Initial synthesis.
- CTA for the recommended product.

Needed fallback states:

- Resend button.
- Spam-folder reminder.
- Temporary download link if possible.
- Send log.
- Error handling.

### Step 8: Personalized Offer

Recommend by intention:

- Love -> Love & Relationship Reading.
- Career -> Career & Vocation Reading.
- Current phase -> 12-Month Transit Forecast.
- Whole chart/general -> Essential or Complete Natal Reading.
- Emotional patterns -> Complete Natal Reading.
- Shadow/growth -> Complete Natal Reading.

Base offer copy:

```text
Your free preview names the first layer. The full reading shows how the chart works as one system.
```

## Product Ladder

Do not build everything at once. Build in phases.

### Phase 1: Core Products

#### Free Chart Preview

Purpose:

- Acquisition.
- Trust.
- Email capture.
- Entry into the paid funnel.

Includes:

- Sun.
- Moon.
- Rising.
- Chart ruler.
- Sect/day-night chart.
- Initial synthesis.

#### Save My Chart PDF

This is not a separate catalog product. It is the free email-capture asset attached to the chart preview.

#### Essential Birth Chart Reading - $17

Publicly rename the current lower-ticket product from "Simple Chart" or "Basic" to:

```text
Essential Birth Chart Reading
```

Avoid "Simple" because it lowers perceived value.

Suggested scope:

- Automated reading, clearly disclosed as automatic and not hand-prepared.
- Instant email delivery after purchase and birth details.
- Deeper reading than the free preview.
- Sun, Moon, and Rising in context.
- Chart ruler.
- Sect.
- Most important houses.
- Main aspects.
- 3 to 5 central themes.
- Main tensions.
- Integration prompts.

#### Complete Natal Reading - $97

This remains the main product.

Promise:

```text
Not a list of placements. A complete synthesis of the chart.
```

Suggested scope:

- Whole chart interpreted as a system.
- Houses.
- Rulers.
- Aspects.
- Planetary condition.
- Sect.
- Angularity.
- Repeated patterns.
- Chart hierarchy.
- Emotional dynamics.
- Relationships.
- Vocation.
- Pressures and development potential.

### Phase 2: Higher Ticket Products

Build only after the main funnel has evidence.

- Love & Relationship Pattern Reading - `$79`
- Synastry & Compatibility Reading - `$129`
- Career & Vocation Reading - `$79`
- 12-Month Transit Forecast - `$129`
- Full Chart Dossier - `$197`

### Phase 3: Recurrence and Education

Possible recurring offer:

- Monthly Transit Letter - `$9/month`

Start simple:

- One monthly letter for each Rising sign.
- 12 versions per month.
- Delivered by email and/or PDF.
- No member dashboard required at first.

Future personalized version:

- Personalized Monthly Transit Letter - `$19/month`

Only build this after the simpler version validates demand.

Potential future course:

- Read Your Birth Chart in 7 Days - `$79` to `$97`

Do not build the course before improving the free chart, validating traffic, and selling current offers.

## Products Not To Prioritize

- Palm reading.
- Psychic reading.
- Hidden trials.
- 3-day predatory subscriptions.
- Affiliate offers as the core funnel.
- A 7-day journal as a primary paid product.

## Suggested Routes

These can be separate routes or implemented as one progressive experience:

- `/free-chart`
- `/chart/start`
- `/chart/intent`
- `/chart/birth-data`
- `/chart/calculating`
- `/chart/result/[id]`
- `/readings/essential`
- `/readings/complete`
- `/readings/love`
- `/readings/synastry`
- `/readings/career`
- `/readings/year-ahead`
- `/readings/full-dossier`
- `/monthly-transit-letter`
- `/thank-you`
- `/email/verify-or-resend`

Do not break currently indexed URLs. Use redirects when needed.

## Readings Page Structure

Create or evolve a "Readings" / "Choose Your Reading" page organized by intention:

### Understand My Whole Chart

- Essential Birth Chart Reading - `$17`
- Complete Natal Reading - `$97`
- Full Chart Dossier - `$197`

### Love And Relationships

- Love & Relationship Pattern - `$79`
- Synastry & Compatibility - `$129`

### Career And Direction

- Career & Vocation Reading - `$79`

### Current Timing

- 12-Month Transit Forecast - `$129`
- Monthly Transit Letter - `$9/month`

In any result or recommendation view, show at most one primary recommendation and one alternative.

## Email Sequence After Free Chart

### Email 1: Immediately

Subject:

```text
Your chart preview is ready
```

Content:

- Deliver PDF.
- Summarize Sun, Moon, Rising.
- Link back to result.
- Present recommended product.

### Email 2: After 1 Day

Subject:

```text
Your Sun sign is not the whole chart
```

Content:

- Explain chart ruler and synthesis.
- CTA to Essential or Complete.

### Email 3: After 3 Days

Segment by intention:

- Love.
- Career.
- Emotional patterns.
- Current phase.
- Whole chart.

### Email 4: After 5 Days

Subject:

```text
What your free chart cannot show yet
```

Content:

- Houses.
- Aspects.
- Planetary condition.
- Repeated themes.
- CTA.

### Email 5: After 7 Days

Content:

- Reminder.
- Compare Essential, Complete, and future Full Dossier.
- No fake urgency.

## Analytics Events

Implement these before serious ads:

- `chart_entry_viewed`
- `zodiac_selected`
- `intent_selected`
- `birth_data_started`
- `birth_data_completed`
- `chart_calculation_started`
- `chart_preview_viewed`
- `locked_section_viewed`
- `email_capture_started`
- `email_captured`
- `pdf_sent`
- `pdf_send_failed`
- `product_recommended`
- `product_viewed`
- `checkout_started`
- `purchase_completed`
- `subscription_started`

Capture UTMs and traffic origin:

- Google Ads.
- Instagram.
- Pinterest.
- YouTube.
- Organic search.
- Email.
- Direct.

Analytics should help compare:

- Intention.
- Recommended product.
- Country.
- Device.
- Abandonment step.
- Preview-to-email rate.
- Email-to-checkout rate.
- Checkout-to-purchase rate.

Never send sensitive birth data, full names, or email addresses to analytics events.

## Design Direction

The funnel should remain:

- Dark celestial.
- Editorial.
- Premium.
- Old-study inspired.
- Mobile first.
- Readable.
- Based on real charts, paper, books, and symbols.

Avoid:

- Cheap psychic app aesthetics.
- Excessive glow.
- Excessive stars.
- Small text.
- Long artificial loaders.
- Overdone blur.
- Fake urgency.

## CTA Bank

Entry:

- Start My Chart
- Reveal My First Chart Layer
- Calculate My Chart
- Begin My Reading

Preview:

- Send My Chart PDF
- Save My Chart
- Explore the Full Pattern
- Unlock the Complete Synthesis

Avoid:

- Get My Prediction
- Reveal My Destiny
- Claim My Future
- Your Ex Is Thinking About You

## Acceptance Criteria

1. User reaches the preview in less than 3 minutes.
2. Preview remains free and has no email wall.
3. Email is requested only after value is delivered.
4. PDF arrives quickly.
5. Result recommends a product according to intention.
6. No fake promises or fake proof.
7. Calculated astrology data comes from the calculation engine.
8. Any AI writing is based only on structured chart data.
9. Product differences are clear.
10. Mobile is the priority experience.
11. Stripe remains checkout.
12. Important steps generate analytics events.
13. Indexed URLs are preserved.
14. Redirects are created only when needed.
15. SEO and performance are preserved.

## Implementation Order

### Sprint 1

- Keep Simple/Basic renamed to Essential Birth Chart Reading in public copy.
- Keep Essential positioned as automated, `$17`, and instantly delivered by email.
- Improve the two existing product offers.
- Add locked cards to the free preview.
- Add contextual CTA to the free preview.
- Implement Save My Chart PDF.
- Connect the related email.
- Implement tracking events.

### Sprint 2

- Create progressive flow: zodiac sign -> intent -> birth data -> calculating -> result.
- Keep the current form accessible.
- Compare conversion.

### Sprint 3

- Launch Love & Relationship Reading.
- Launch Career & Vocation Reading.
- Launch Full Chart Dossier.

### Sprint 4

- Launch 12-Month Transit Forecast.
- Then launch Synastry & Compatibility.

### Sprint 5

- Validate Monthly Transit Letter.
- Start with 12 letters by Rising sign.
- Use Stripe recurring and email delivery.

## VPS Guidance

The available Contabo VPS can be useful later, but should not be used just because it exists.

Vercel is enough for:

- The public site.
- Current checkout redirects.
- Basic serverless API calls.
- Simple email notifications.
- Free chart calculation if performance remains acceptable.

Consider the VPS when the project needs:

- Reliable PDF generation queues.
- Email retry logs.
- Scheduled jobs.
- A small private admin backend.
- Persistent lead/order database.
- Webhook processing that should not depend only on serverless execution.
- WhatsApp or CRM integrations.

Do not move the frontend away from Vercel without a strong reason.
