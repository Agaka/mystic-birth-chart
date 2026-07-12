# The Reading Room Letters

Last updated: 2026-07-12

## Current Integration

- The Free Chart remains fully visible without an email address.
- A seven-page aged-paper PDF can be downloaded without email.
- Email delivery is optional and uses the Hostinger SMTP mailbox.
- Newsletter consent is a separate, unchecked checkbox.
- Consenting contacts are added to Brevo only when `BREVO_API_KEY` and `BREVO_LIST_ID` are configured.
- Only email and the optional cover name are sent to Brevo. Birth data, chart results, focus, and checkout notes stay out of the newsletter provider.
- The endpoint limits repeated email and download requests to reduce abuse.

## Brevo Configuration

1. Create the list `The Reading Room Letters`.
2. Enable double opt-in if the signup countries or campaign strategy require it.
3. Add `BREVO_API_KEY` and `BREVO_LIST_ID` to Vercel Production, Preview, and Development as appropriate.
4. Create the five-email welcome automation below, triggered when a contact joins the list.
5. Use `hello@mysticbirthchart.com` as sender and verify the domain in Brevo.
6. Keep unsubscribe and company-address elements in every campaign footer.
7. Test signup, delivery, mobile layout, unsubscribe, and duplicate-contact behavior with an internal address.

## Welcome Automation

### Email 1: Immediately

Subject: `Your chart is not a list of placements`

Open by welcoming the reader to the reading room. Explain that Sun, Moon, and Rising are entry points, while rulers, houses, sect, aspects, and repeated testimony create hierarchy. Link to the Free Chart if they have not completed it. Close with one observation prompt: notice when purpose, need, and social approach disagree this week.

Primary link: `/free-birth-chart`

### Email 2: After 2 days

Subject: `The planet carrying your chart forward`

Teach the relationship between the Ascendant and its traditional ruler. Give one compact example showing why Scorpio Rising cannot be interpreted fully without Mars. Avoid generic sign lists. Invite the reader to return to their PDF and identify the ruler named there.

Primary link: `/blog/chart-ruler-ascendant-ruler`

### Email 3: After 4 days

Subject: `Why a convincing description can still be incomplete`

Explain the difference between recognition and judgment. A placement description may feel accurate while missing house, condition, reception, and repeated themes. Show what the free preview intentionally reveals and what remains unresolved. Present Essential as the accessible automated synthesis, clearly labeled as automated and instant.

Primary link: `/birth-chart-report`

### Email 4: After 7 days

Subject: `A traditional way to find the year that is speaking`

Teach annual profections without fatalism: the activated house names the field and the time lord manages it. Invite the reader to calculate the current year, then explain why natal condition and transits still matter.

Primary link: `/annual-time-lord`

### Email 5: After 10 days

Subject: `Choose the depth that matches your question`

Compare the automated Essential reading with the individually reviewed Complete reading. State price, process, delivery, and scope plainly. Recommend Essential for a first synthesis and Complete when the reader wants houses, aspects, condition, life topics, and prioritized whole-chart judgment. Never imply that the Complete queue is scarce unless capacity is genuinely limited at that moment.

Primary link: `/birth-chart-report`

## Ongoing Cadence

Send one substantial weekly letter or two shorter notes:

- one educational note tied to a planet, house, timing technique, or current transit;
- one commercial or case-study note using a real sample, FAQ, reading distinction, or genuine availability update.

Do not mirror complete site articles automatically. Each letter should contain an original opening, one chart-led idea, one example, one limitation, and one relevant link.

## Measurement

Track provider-side delivery, open, click, unsubscribe, and complaint rates. On-site links should use UTMs such as `utm_source=reading-room&utm_medium=email&utm_campaign=welcome_01`. Never append email addresses, names, birth details, signs, or contact IDs to URLs or GA4 events.
