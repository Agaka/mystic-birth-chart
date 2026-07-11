# The Reading Room Letters: Integration Notes

The site renders the optional post-result invitation only when `NEXT_PUBLIC_NEWSLETTER_SIGNUP_URL` is configured.

## Current Behavior

- The Free Chart result remains visible without an email address.
- The invitation states what will be sent and that subscription is optional.
- Clicking the signup action opens the configured provider destination.
- Checkout consent is a separate, unchecked option and is not inferred from a purchase.
- No endpoint, API key, or subscriber database is invented in this repository.

## Provider Configuration Needed

1. Create the publication or list named `The Reading Room Letters`.
2. Configure a public signup URL in the provider.
3. Set `NEXT_PUBLIC_NEWSLETTER_SIGNUP_URL` in the deployment environment.
4. Confirm double opt-in, unsubscribe behavior, privacy wording, and export support.
5. Test the provider's confirmation email and mobile form.

## Data Policy

- Collect only the email and optional provider-supported name field needed for the newsletter.
- Do not send birth data, chart results, focus, or checkout notes to the newsletter provider.
- Do not subscribe customers silently.
- Keep an export process so the studio can retain its audience list if providers change.

## Editorial Cadence

Send one substantial weekly letter or two shorter notes. Do not mirror complete site articles automatically. A useful letter contains an original opening, one chart-led idea, one example, one limitation, and one relevant link back to the site.
