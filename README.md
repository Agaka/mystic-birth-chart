# Mystic Birth Chart

**Traditional astrology readings for modern questions.**

An English-language astrology journal and sales funnel for personalized natal chart readings. Built with Next.js App Router, TypeScript, and Tailwind CSS.

## Overview

Mystic Birth Chart is an editorial astrology site that teaches real chart concepts and guides readers toward paid written readings. The site includes:

- Home page with hero, free chart CTA, featured articles, category browsing, and reading offers
- Blog with 44 articles across 7 astrology categories
- Free birth chart snapshot tool with city search and static interpretations
- Reading sales page for Basic ($29) and Complete ($97) reports
- Sample report preview with fictional data
- About page with methodology and ethical positioning
- Thank-you page with birth details form
- Legal pages: Privacy Policy and Terms of Service
- GA4/Search Console hooks plus CTA and tool-use events

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Install dependencies

```bash
cd mystic-birth-chart
npm install
```

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Build for production

```bash
npm run build
npm start
```

The sitemap is generated automatically after each build via `next-sitemap`.

## Environment Variables

Create a `.env.local` file in the project root. See `.env.example` for all available variables.

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production URL, for example `https://mysticbirthchart.com` | Recommended |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID, for example `G-...` | Recommended |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console HTML tag token | Recommended |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Public support email shown in legal pages and mailto fallbacks | Recommended |
| `NEXT_PUBLIC_BIRTH_DETAILS_FORM_URL` | External form URL, such as Tally, Formspree, or Google Forms | Optional |
| `STRIPE_SECRET_KEY` | Stripe secret key for API checkout | For payment |
| `STRIPE_BASIC_PRICE_ID` | Stripe price ID for Basic Reading | For payment |
| `STRIPE_COMPLETE_PRICE_ID` | Stripe price ID for Complete Reading | For payment |

## Analytics Setup

1. Create a GA4 web stream and copy the Measurement ID.
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local` and in Vercel.
3. Add the Search Console verification token to `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
4. Deploy and use GA4 Realtime to confirm page views and events.

Tracked events:

- `cta_click`
- `reading_offer_click`
- `checkout_submit_attempt`
- `free_chart_city_search`
- `free_chart_snapshot_generated`
- `birth_details_submit_attempt`

The free chart tool does not send birth date, birth time, or birth city to GA events.

## Payment Setup

The site uses custom checkout pages at `/checkout/basic` and `/checkout/complete`.
The final card payment step is handled by Stripe Checkout through `/api/checkout`.

1. Create one Stripe product/price for Basic Reading.
2. Create one Stripe product/price for Complete Reading.
3. Set `STRIPE_SECRET_KEY`, `STRIPE_BASIC_PRICE_ID`, and `STRIPE_COMPLETE_PRICE_ID`.
4. Redeploy.

Without Stripe variables, the checkout form redirects to `/checkout/pending` instead of failing.

## Form Setup

1. Create a form on Tally, Formspree, Google Forms, or another form tool.
2. Set `NEXT_PUBLIC_BIRTH_DETAILS_FORM_URL` to the form URL.
3. The thank-you page form will redirect to your form.

Without a form URL, the form falls back to opening the user's email client.

## Adding Blog Posts

1. Create a new `.md` file in `src/content/articles/`.
2. Add frontmatter:

```yaml
---
title: "Your Article Title"
excerpt: "A short description of the article."
category: "Chart Basics"
categorySlug: "chart-basics"
date: "2026-07-01"
author: "Mystic Birth Chart"
featured: false
---
```

3. Write the article content in Markdown below the frontmatter.
4. The article will automatically appear in the blog and its category page.

### Available Categories

| Category | Slug |
|---|---|
| Chart Basics | `chart-basics` |
| Moon & Emotions | `moon-emotions` |
| Love & Venus | `love-venus` |
| Career & Purpose | `career-purpose` |
| Saturn & Growth | `saturn-growth` |
| Deep Chart Patterns | `deep-chart-patterns` |
| Hermetic Astrology | `hermetic-astrology` |

## Project Structure

```text
src/
|-- app/                    # Next.js App Router pages
|   |-- about/              # About page
|   |-- api/checkout/       # Stripe Checkout API route
|   |-- birth-chart-report/ # Reading sales page
|   |-- blog/
|   |   |-- [slug]/         # Individual article pages
|   |   `-- category/
|   |       `-- [category]/ # Category pages
|   |-- checkout/           # Custom checkout pages before Stripe payment
|   |-- free-birth-chart/   # Free chart snapshot tool
|   |-- privacy/            # Privacy policy
|   |-- sample-report/      # Sample report preview
|   |-- terms/              # Terms of service
|   |-- thank-you/          # Post-purchase birth details form
|   |-- globals.css         # Global styles and design tokens
|   |-- layout.tsx          # Root layout with fonts, JSON-LD, analytics
|   `-- page.tsx            # Home page
|-- components/             # Reusable UI components
|-- content/articles/       # Blog articles
`-- lib/                    # Utilities, config, analytics, chart logic
```

## Deploy to Vercel

1. Push the repository to GitHub.
2. Import the repository on Vercel.
3. Set the root directory to `mystic-birth-chart` if the project is in a subdirectory.
4. Add the environment variables in Vercel.
5. Deploy.

The site is mostly static and builds quickly.

## Design

- Ink and midnight backgrounds for the old study atmosphere
- Dark wood texture for Victorian desk surfaces
- Warm ivory and parchment for reading areas
- Antique gold for CTAs, dividers, and accents
- Restrained aubergine and rose accents

Fonts: Cormorant Garamond for headings, Lora for body text, Inter for UI.

## Disclaimer

Mystic Birth Chart readings are for self-reflection and educational purposes only. They do not provide medical, legal, financial, psychological, or guaranteed predictive advice.
