# Mystic Birth Chart - AI Context and Growth Bible

Last updated: 2026-07-11

This file is the long-term memory for Mystic Birth Chart. Any AI, developer, designer, copywriter, or content assistant working on this project should read it before making decisions about copy, design, content, social media, SEO, conversion, or product strategy.

Do not store passwords, API keys, personal accounts, Stripe secrets, Vercel tokens, or private customer data in this file.

## 1. Project Summary

Mystic Birth Chart is an English-language astrology content site and sales funnel for personalized natal chart readings paid in USD.

The business goal is direct:

- Bring qualified traffic from Google, Instagram, Pinterest, YouTube, and other channels.
- Give real astrology education, not thin sales copy.
- Convert readers into paid written natal chart readings.
- Prioritize sales of personalized readings while keeping the site credible, useful, and aesthetically distinct.

Current public site:

- Public brand domain to use in copy, images, bios, pins, posts, SEO defaults, and customer-facing links: `https://mysticbirthchart.com`
- Domain status: purchased at Hostinger and connected to Vercel on 2026-07-04. Both `https://mysticbirthchart.com` and `https://www.mysticbirthchart.com` showed valid Vercel configuration and loaded the live site.
- DNS status: Hostinger nameservers remain active so Hostinger email records stay in place. The root `A` record points to Vercel at `216.198.79.1`; `www` is configured as a CNAME to `mysticbirthchart.com`.
- The Vercel preview URL is infrastructure only. Never use the Vercel URL in public-facing copy, images, social bios, social captions, Pinterest pins, screenshots, videos, or branded assets.
- GitHub repo: `https://github.com/Agaka/mystic-birth-chart`
- Repo name: `mystic-birth-chart`
- Vercel workspace: `allansobrero-2788's projects`
- Vercel public environment variables configured on 2026-07-04:
  - `NEXT_PUBLIC_SITE_URL=https://mysticbirthchart.com`
  - `NEXT_PUBLIC_SUPPORT_EMAIL=hello@mysticbirthchart.com`

Current tech stack:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Markdown articles in `src/content/articles`
- Stripe Checkout is now configured, with two current paid products and order email notifications working according to the owner.
- GA4 is still pending.

Important repo rule:

- This project has an `AGENTS.md` warning that this Next.js version may have breaking changes.
- Before editing Next.js code, read the relevant docs in `node_modules/next/dist/docs/`.

## 2. Business Model

The primary paid products are an automated entry reading and a hand-prepared complete reading:

### Essential Birth Chart Reading

- Price: `$17`
- Positioning: accessible automated entry reading, the first paid synthesis after the free preview
- Delivery promise: instant email delivery
- Format: automated email reading
- Disclosure: must be clearly described as generated automatically, not hand-prepared
- Scope:
  - First natal chart synthesis
  - Sun, Moon, Rising
  - Chart ruler
  - Sect/day or night chart
  - First core themes connected to the selected focus
  - Clear practical English

Important naming rule:

- Public copy should use "Essential Birth Chart Reading" or "Essential Natal Reading".
- Avoid "Simple Chart" because it lowers perceived value.
- Existing Stripe/product internals may still use older names like `basic`, but customer-facing copy should say "Essential".
- Essential must not be described as hand-prepared, handmade, manually written, or delivered in 48 hours.

### Complete Natal Reading

- Price: `$97`
- Positioning: deeper and more complete interpretation
- Delivery promise currently used in the site: hand-prepared and delivered within 72 hours
- Format: expanded hand-prepared PDF report
- Scope:
  - Traditional-first natal analysis
  - House rulers
  - Dignities
  - Aspects
  - Chart emphasis
  - Love, career, money, temperament, vocation themes
  - Prioritized integration notes and next-step guidance

### Capacity

The owner can produce about 5 hand-prepared Complete readings per day. This can be used as real operational scarcity for the manual product, but it should not be applied to the automated Essential offer.

Good wording:

- "5 hand-prepared Complete readings available per day."
- "Complete readings are prepared by hand, so the daily queue is limited."

Avoid:

- Fake countdown timers.
- Aggressive scarcity.
- Claims that cannot be fulfilled.

## 3. Core Positioning

The site should not feel like a generic purple mystical astrology template.

The intended feeling:

- A Victorian mystic studying astrology at an old wooden desk.
- Old books, old papers, candlelight, ink, parchment, chart wheels, handwritten notes.
- Warm, serious, intimate, intelligent, and slightly mysterious.
- A place where the reader feels like they are entering an old study and learning real astrology.

Main differentiator:

### The Old Study Method

This is the brand's editorial and product method. It means:

- Read the chart as a whole, not as isolated placements.
- Start with structure: Ascendant, chart ruler, sect, houses, dignities, aspects, and repeated patterns.
- Translate traditional astrology into clear modern language.
- Give the client an interpretation they can actually use.
- Avoid generic automated chart text.

Possible tagline variants:

- "Traditional astrology readings for modern questions."
- "Enter the old study of your birth chart."
- "Start instantly, then go deeper by hand."
- "Traditional astrology, practical synthesis, no generic app report."

Core promise:

Mystic Birth Chart helps people understand the deeper structure of their natal chart through traditional-first astrology, written in practical language.

### Hermetic Astrology Boundary

The brand may publish and sell content about magic, Hermetic Qabalah, decan angels, planetary spirits, alchemy, Golden Dawn-style correspondences, Arbatel, and Western esotericism only when the subject is directly tied to astrology.

Allowed bridges:

- planets;
- signs;
- houses;
- decans;
- planetary days and hours;
- electional timing;
- solar and lunar rhythm;
- natal chart structure;
- chart ruler;
- planetary dignity;
- Hermetic Qabalah as applied through astrology;
- angelic or devotional practice tied to zodiacal decans or planets.

Do not publish random occult content that cannot be explained through astrology. Even a topic like Arbatel must be framed through planetary astrology, not as general grimoire entertainment.

The promise of Hermetic practice can include realistic inner qualities:

- confidence;
- joy;
- intuition;
- discipline;
- courage;
- clarity;
- patience;
- emotional steadiness;
- spiritual focus;
- devotional connection.

Avoid material guarantees, coercive promises, medical claims, fear-based claims, or claims of guaranteed results.

## 4. Audience

Primary audience:

- English-speaking buyers, mostly US/Canada/UK/Australia or people comfortable paying in USD.
- Age range likely 20-45.
- Interested in astrology beyond sun signs.
- Often comes through Instagram, Pinterest, YouTube, or Google search.
- Wants insight about identity, love, purpose, career, emotional patterns, timing, and self-understanding.
- Has probably used Co-Star, Cafe Astrology, Astro-Seek, astro.com, TikTok astrology, or a free birth chart calculator before.
- Feels that automated reports are interesting but fragmented or generic.

Emotional state:

- Curious, reflective, sometimes overwhelmed.
- Wants the chart to feel personal.
- Wants serious interpretation without cold academic language.
- Wants the comfort of meaning and the clarity of practical synthesis.

What they need to believe before buying:

- This site understands astrology beyond memes.
- The Essential reading is transparently automated and instant.
- The Complete reading is hand-prepared, not automated.
- The reading will be written clearly.
- The product will synthesize the chart, not copy and paste isolated placement descriptions.
- The purchase feels safe and professional.
- The price feels accessible compared with higher-end astrologers.

## 5. Brand Voice

Voice should be:

- Intelligent
- Warm
- Clear
- Slightly literary
- Traditional-first but not elitist
- Practical
- Calm
- Specific
- Human

Voice should not be:

- Overly witchy
- Generic New Age
- Overly purple/mystical
- Academic to the point of being dry
- Fear-based
- Meme-only
- Fake guru
- Hyperbolic

Good language:

- "chart ruler"
- "house topics"
- "sect"
- "dignity"
- "condition of a planet"
- "the chart as a whole"
- "pattern"
- "testimony"
- "temperament"
- "vocation"
- "emotional rhythm"
- "practical synthesis"
- "automated Essential reading"
- "hand-prepared Complete reading"
- "not a generic app report"
- "old study"

Avoid or use carefully:

- "manifest"
- "high vibration"
- "divine feminine"
- "soulmate guaranteed"
- "your destiny is fixed"
- "this placement means you will..."
- "cursed"
- "bad chart"
- "100% accurate prediction"

Ethical stance:

- Astrology is for self-reflection and education.
- Do not provide medical, legal, financial, psychological, or guaranteed predictive advice.
- Do not create fear around placements.
- Do not tell users they are doomed.

## 6. Visual Direction

Visual goal:

The interface should feel like an old astrological study, not a modern SaaS dashboard and not a purple spiritual template.

Current direction:

- Dark wooden surfaces
- Warm ivory/parchment reading areas
- Antique gold accents
- Deep ink and midnight backgrounds
- Aubergine/rose used sparingly
- Serif headings
- Clear body copy
- Strong contrast

Important user feedback:

- The user liked the old-study/Victorian direction.
- The user disliked fake-looking heavy wood texture.
- Use wood texture only when it feels subtle, natural, and not like a forged pattern.
- Contrast matters: some previous text was too hard to read.

Design tokens currently in `src/app/globals.css`:

- `--color-midnight: #120e0a`
- `--color-aubergine: #301b17`
- `--color-ivory: #f4ead7`
- `--color-gold: #b88a3a`
- `--color-rose: #8e4f45`
- `--color-lavender: #8a927f`
- `--color-ink: #090705`

Fonts:

- Headings: Cormorant Garamond
- Body: Lora
- UI: Inter

Design rules:

- Prioritize readability over atmosphere.
- Never place low-contrast gold text on gray-brown backgrounds.
- Use parchment/ivory surfaces for long reading.
- Use wood panels sparingly for atmosphere or product cards.
- Avoid generic neon astrology gradients.
- Avoid too much purple.
- Avoid decorative clutter that slows reading or hurts conversion.

## 7. Site Structure

Current important routes:

- `/` - home page
- `/blog` - article index
- `/blog/[slug]` - individual article pages
- `/blog/category/[category]` - category pages
- `/free-birth-chart` - free birth chart preview tool
- `/birth-chart-report` - sales page for readings
- `/sample-report` - sample report preview
- `/checkout/basic` - custom checkout pre-payment page
- `/checkout/complete` - custom checkout pre-payment page
- `/checkout/pending` - fallback page when Stripe is not configured
- `/thank-you` - post-purchase birth details page
- `/about` - brand/methodology page
- `/privacy` - privacy policy
- `/terms` - terms of service

Current content:

- 87 English blog posts in `src/content/articles`.
- 10 categories:
  - Chart Basics
  - Moon & Emotions
  - Love & Venus
  - Career & Purpose
  - Saturn & Growth
  - Deep Chart Patterns
  - Hermetic Astrology
  - The 12 Houses
  - Predictive Astrology
  - Planetary Magic & Timing

The free tool:

- Route: `/free-birth-chart`
- Uses city search, not manual latitude/longitude.
- Uses Open-Meteo geocoding.
- Gives static but dense first-reading interpretations.
- It is a lead magnet, not a full reading replacement.
- Public copy should call it a "free chart preview" or "first chart reading", not a "snapshot".
- The output must feel personal enough to create recognition, but incomplete enough to make the user want the full chart interpreted.

## 8. Funnel Strategy

The newest funnel strategy is documented in:

- `docs/strategy/free-chart-funnel-and-product-ladder.md`

The key shift is that the free chart should become a guided, progressive experience:

Social/search/ad/blog traffic -> zodiac sign entry -> intention -> birth data -> calculation screen -> useful free preview -> optional email/PDF capture -> personalized paid reading recommendation.

The experience should borrow the conversion psychology of astrology quizzes without using predatory tactics, fake proof, hidden subscriptions, or guaranteed prediction claims.

Primary traffic path:

Social or Google -> free birth chart tool or blog post -> internal CTA -> reading sales page -> custom checkout -> Stripe payment -> thank-you birth details -> PDF delivery by email.

Best landing pages for traffic:

- `/free-birth-chart`
- `/blog`
- Strong individual blog posts
- `/birth-chart-report`
- `/sample-report`

Primary CTA:

- "Get Instant Essential Reading"
- "Begin My Free Chart Preview"
- "Order Essential Reading"
- "Order Complete Reading"

CTA logic:

- Cold social traffic should usually go to `/free-birth-chart`.
- Warm blog readers can go to `/birth-chart-report`.
- People comparing offers should go to `/sample-report` or `/checkout/basic`.
- Pinterest users should often land on specific blog posts or the free chart tool.

Do not make the site feel like only a sales page. It must feel like a real astrology library with a paid reading offer naturally available.

## 9. Checkout Status

The site already has custom checkout pages before Stripe:

- `/checkout/basic`
- `/checkout/complete`

The card payment step is handled by Stripe Checkout through:

- `src/app/api/checkout/route.ts`

Stripe Checkout is configured according to the owner, with two current products ready for purchase and email notifications working after purchase.

Environment variables used by the app:

- `STRIPE_SECRET_KEY`
- `STRIPE_BASIC_PRICE_ID`
- `STRIPE_COMPLETE_PRICE_ID`

If those are missing in an environment, the API redirects to:

- `/checkout/pending`

The user wants checkout to feel custom to the site, with Stripe only at the payment moment. Keep that direction.

Public seller name for now:

- `Mystic Birth Chart`

This can change later if the owner decides to use a personal astrologer name.

## 10. Analytics Status

GA4 and Search Console are configured for the live site.

GA4 production configuration completed on 2026-07-11:

- Property: `Mystic Birth Chart` (`544188641`)
- Web stream: `Mystic Birth Chart Website` (`15200693261`)
- Measurement ID: `G-7NZP3N06DK`
- Live domain verified loading the GA4 tag: `https://mysticbirthchart.com`
- Vercel variable `NEXT_PUBLIC_GA_MEASUREMENT_ID` is available to Production and Preview.
- Reporting country/time zone: Brazil / `(GMT-03:00) Sao Paulo`
- Reporting currency: USD
- Event and user-data retention: 14 months
- Search Console domain property `mysticbirthchart.com` is linked to the web stream.
- `stripe.com` is excluded from referrals so payment returns do not overwrite attribution.
- Cross-domain tag configuration includes only `mysticbirthchart.com`, not Vercel preview domains.
- Email redaction is enabled in the web stream.
- `purchase` is the only GA4 key event. Unused GA defaults `qualify_lead` and `close_convert_lead` were unmarked.
- Event-scoped custom dimensions exist for `product_id`, `product_category`, `funnel_step`, `cta_location`, and `experiment_variant`.

Environment variables:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`

Tracked events include:

- `cta_click`
- `reading_offer_click`
- `checkout_submit_attempt`
- `free_chart_city_search`
- `free_chart_preview_generated`
- `birth_details_submit_attempt`

Next tracking expansion should support the guided free-chart funnel:

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

Capture UTMs and origin, but never send birth date, birth time, birth city, full name, email, or other sensitive personal data to analytics.

Important privacy rule:

- Do not send birth date, birth time, birth city, full name, email, or other sensitive personal data to analytics events.

## 11. Email and Newsletter Strategy

The intended public domain is `mysticbirthchart.com`.

Recommended setup:

- Use a professional mailbox for support/contact after buying the domain.
- Use a marketing email service for newsletters and automations.
- Brevo is a practical first option for marketing emails.
- Hostinger email is acceptable for a basic mailbox, but not ideal as the main newsletter/automation engine.

Send about 2 emails per week:

1. One educational email:
   - chart concept
   - house/planet lesson
   - traditional astrology explanation
   - link to a blog post

2. One conversion email:
   - sample interpretation
   - reading invitation
   - FAQ
   - testimonial when available
   - limited reading queue if true

Possible welcome sequence:

Email 1: "Your birth chart is not a list of placements"
Email 2: "The Ascendant and chart ruler: where a reading begins"
Email 3: "Why automated chart reports feel incomplete"
Email 4: "How the Old Study Method reads your chart"
Email 5: "Choose your reading: Essential or Complete"

## 12. Competitor Notes

### Typewriter Astrology

Detailed content analysis file:

- `marketing/content-strategy/typewriter-astrology-analysis.md`

Important competitor because it has:

- Strong vintage/typewriter aesthetic.
- Clear personal voice.
- Product ladder.
- Annual guide.
- Membership.
- Higher-priced chart reports.
- Anonymous submissions/community prompts.
- Instagram account with strong visual identity.
- Dense, useful carousel posts tied to current or yearly astrology timing.
- Rising-sign breakdowns that translate major transits into concrete house topics.

What to learn:

- A distinctive aesthetic makes the brand memorable.
- A product ladder lets buyers start small and upgrade later.
- A personal/editorial voice builds trust.
- Submissions create repeatable social content.
- Timely posts about planets entering signs, retrogrades, lunations, and yearly transits feel more useful than generic evergreen astrology.
- Future Mystic carousels should be more text-rich when the subject benefits from explanation, especially for transit notes, rising-sign forecasts, and planet/sign columns.

What not to copy directly:

- Do not clone the exact typewriter look.
- Do not copy product names.
- Do not copy posts or visual layouts.
- Do not copy exact wording, captions, CTA mechanics, or brand marks.

### Co-Star

What works:

- Extremely shareable blunt language.
- Minimal black/white brand.
- Simple app CTA.

What to learn:

- Short, sharp copy is very shareable.
- People share astrology when it feels personal and specific.

What not to copy:

- Do not become another detached app.
- Mystic Birth Chart should feel human and old-study even when the Essential offer is automated. Complete must remain clearly hand-prepared.

### Meme Accounts

Examples from screenshots:

- `astrhology`
- `thezodiacstea`

What works:

- Identity-based humor.
- Shareability.
- Fast growth through relatable posts.

Risk:

- Meme traffic does not always convert.
- Reposted/unoriginal meme content can be downranked.

Use the lesson, not the lazy version:

- Make original or meaningfully transformed astrology memes.
- Tie memes back to a chart concept or reading CTA.
- Avoid relying only on reposts.

### Niche/Gimmick Accounts

One screenshot showed a highly specific astrology gimmick account. The useful lesson is not the NSFW subject, but the strategy:

- A strange, clear hook can make an account memorable.
- Anonymous submissions can create repeatable content.
- People like seeing charts applied to real stories.

Clean version for Mystic Birth Chart:

- Anonymous chart confessions.
- "What your 12th house hides."
- "Venus stories."
- "Saturn lessons."
- "Guess the chart pattern."

## 13. Social Media Strategy

The user plans:

- Instagram
- YouTube
- Pinterest

TikTok is not a priority right now because the user believes reaching English-speaking traffic there would require a foreign phone number and VPS setup.

Main link for social:

- Use `/free-birth-chart` as the default cold-traffic link.

Secondary links:

- `/birth-chart-report`
- `/sample-report`
- Best blog posts for the topic being discussed

### Instagram

Profile direction:

Name:

- Mystic Birth Chart

Bio draft:

```text
Traditional astrology for modern questions
Free birth chart preview below
Instant Essential reading from $17
```

Highlights:

- Start Here
- Readings
- Sample
- Reviews
- FAQ
- Chart Basics

Content pillars:

1. Relatable astrology
   - original memes
   - sign/house/planet humor
   - identity content people share

2. Old Study mini-lessons
   - chart ruler
   - sect
   - houses
   - dignities
   - aspects
   - why one placement is not enough

3. Anonymous chart confessions
   - user-submitted stories
   - anonymized chart patterns
   - "what placement would explain this?"

4. Sales/proof
   - sample reading snippets
   - queue updates
   - FAQ
   - before/after: "free calculator vs hand synthesis"

5. Aesthetic authority posts
   - old paper
   - chart wheels
   - study notes
   - short quotes from the brand method

Posting rhythm:

- 1 feed post or Reel per day if possible.
- Stories several times per week.
- Reuse blog ideas as carousel posts.
- Use Reels/Shorts scripts across Instagram and YouTube Shorts.

Good Instagram post formats:

- "Your Sun sign is not the whole sentence."
- "The Ascendant is the door. The chart ruler is where the story starts moving."
- "A free chart calculator can list your placements. It cannot decide which ones matter most."
- "If your Venus sign never made sense, check the house and condition of Venus."
- "Saturn is not punishment. Saturn is where life asks for form."

### Pinterest

Pinterest should be treated as search traffic, not only social media.

Boards:

- Birth Chart Basics
- Traditional Astrology
- Hermetic Astrology
- Decan Angels
- Rising Signs
- Moon Sign Meanings
- Venus in Astrology
- Saturn Return
- Astrology Houses
- Astrology Aesthetic
- Free Birth Chart
- Astrology Journal Prompts

Pin strategy:

- Every blog post should become 5-10 pins over time.
- Pins should link to blog posts or `/free-birth-chart`.
- Use vertical 1000x1500 or 1080x1920 formats.
- Use old-paper, chart-wheel, book, desk, and type/ink motifs.
- Keep text large and readable on mobile.

Pin title examples:

- "How to Read Your Birth Chart Without Getting Lost"
- "Why Your Rising Sign Matters More Than You Think"
- "The Chart Ruler: The Planet That Leads Your Birth Chart"
- "What Saturn Means in Traditional Astrology"
- "Free Birth Chart Calculators Are Not Enough"
- "Traditional Astrology vs Modern Astrology"
- "Venus Is Not Just Love"
- "The 10th House and Your Public Life"
- "What Your Moon Sign Actually Describes"
- "Birth Chart Reading Online: What to Expect"

### YouTube

YouTube should build authority. Shorts can bring discovery; longer videos build trust.

Suggested cadence:

- 3 Shorts per week.
- 2 longer videos per month.

Shorts structure:

1. Hook in first 1-2 seconds.
2. One concrete astrology idea.
3. One example.
4. CTA to free birth chart preview or full reading.

Long video structure:

1. Title answers a search query.
2. Open with the problem.
3. Teach one clear framework.
4. Show a simple example.
5. Mention the free chart tool.
6. Invite viewers to order a reading.

Good long video topics:

- "How to Read a Birth Chart: Where Traditional Astrologers Start"
- "Why Your Rising Sign Changes the Whole Chart"
- "Chart Ruler Explained: The Planet That Leads Your Life Story"
- "Saturn Return Meaning Without Fear-Based Astrology"
- "Why Automated Birth Chart Reports Feel Generic"

## 14. AI Video Workflow

The user has access to AI tools such as ElevenLabs and Leonardo.ai through a shared AI package. The site/content strategy should assume videos can be produced with AI voice and AI visuals.

Recommended video style:

- 9:16 vertical format for Shorts/Reels.
- Old study visuals.
- Slow desk/candle/paper/book movement.
- Typewriter-style text overlays.
- Warm but readable subtitles.
- Avoid purple mystical stock-video style.

Voice style:

- Calm, intelligent, intimate.
- English language.
- Not too theatrical.
- Not fake horror/mystery.
- Pace: medium-slow but not sleepy.

Shorts script template:

```text
Hook:
Most people read their birth chart backwards.

Body:
They start with random placements: Moon in Libra, Venus in Scorpio, Mars in Gemini.
But a real reading starts with the structure of the chart.
The Ascendant shows the doorway.
The chart ruler shows where the life story begins to move.
The houses show the topics.

CTA:
If you want a clear first look at your chart, use the free birth chart preview on Mystic Birth Chart.
```

Video prompt template:

```text
Vertical 9:16 cinematic shot of an old Victorian astrology study, dark wooden desk, parchment birth chart, antique books, brass candle holder, warm candlelight, ink pen, subtle dust in the air, realistic texture, no modern objects, no neon, no purple fantasy glow, elegant and quiet, shallow depth of field, premium editorial mood
```

Negative prompt:

```text
neon, purple glow, modern laptop, plastic, cheap fantasy, cartoon, cluttered UI, illegible text, fake symbols, distorted hands, horror, skulls, low contrast
```

Subtitle style:

- Ivory or parchment text.
- Dark shadow or translucent ink backing.
- Large enough for mobile.
- Never cover important chart/desk detail.

## 15. Content Strategy for Blog

The blog must bring real traffic and build authority.

Every article should:

- Answer a concrete search intent.
- Teach something useful.
- Use clear English.
- Include internal links to related articles.
- Include a relevant CTA to the free chart tool or paid reading.
- Avoid thin SEO filler.
- Avoid making claims astrology cannot responsibly make.
- Speak directly to the reader and make them ask, "how does this work in my chart?"
- Feel like a partial reading, not a cold encyclopedia entry.
- Show why the concept becomes personal only when the whole chart is interpreted.
- Lead toward the paid reading through affinity and recognition, not pressure.

Article structure:

1. Clear intro that names the problem in the reader's life.
2. Explain the concept in plain language.
3. Give examples that feel lived, not only technical.
4. Show how the reader can look for the theme in their own chart.
5. Show why isolated placements are not enough.
6. Link to related topics.
7. Soft CTA to the free chart preview or full reading.

High-intent articles should usually be 1,200-1,800 words when the topic deserves it. Short 400-600 word posts are acceptable for small glossary topics, but priority articles should feel dense enough to hold attention and build trust.

Good article angles:

- "What is X in astrology?"
- "How to read X in your birth chart"
- "X sign vs X house"
- "Why X is not enough"
- "Traditional astrology meaning of X"
- "How X appears in Hermetic astrology"
- "How X connects to planets, decans, timing, or the birth chart"
- "What to expect from a birth chart reading"
- "Free calculator vs personal chart reading"

Internal link rules:

- Link Chart Basics posts to free chart tool.
- Link advanced/traditional posts to paid reading.
- Link love posts to Venus articles and Complete Reading.
- Link career posts to 10th house/Midheaven and Complete Reading.
- Link Saturn posts to Saturn Return and Complete Reading.
- Link comparison posts to sample report and checkout pages.
- Link Hermetic Astrology posts back to astrology foundations, decans, planetary dignity, the free chart tool, and reading options.
- Do not publish magic posts unless they are directly connected to astrology.

CTA examples:

- "If you want the chart read as a whole, order a personalized birth chart reading."
- "Start with the free chart preview, then choose a full reading if the pattern resonates."
- "A calculator can name your placements. A reading decides what matters most."

## 16. Content Production Templates

### Instagram Carousel Template

Slide 1:

- Strong claim or question.

Slide 2:

- The common mistake.

Slide 3:

- The traditional astrology principle.

Slide 4:

- Example.

Slide 5:

- What this means for the reader.

Slide 6:

- CTA: free chart preview or reading.

Example:

```text
Slide 1: Your Venus sign is not your whole love style.
Slide 2: Most people stop at "Venus in Scorpio" or "Venus in Libra."
Slide 3: But Venus has a house, aspects, condition, and a role in the whole chart.
Slide 4: Venus in the 10th speaks differently than Venus in the 4th.
Slide 5: A real reading asks: where does Venus act, what supports it, and what complicates it?
Slide 6: Get your chart read as a whole at Mystic Birth Chart.
```

### Instagram Caption Template

```text
Most birth chart advice treats placements like separate personality traits.

Traditional astrology asks a better question:
what is this planet doing in the structure of the whole chart?

That is why two people with the same Moon sign can experience it very differently.

If you want your chart read as a whole, start with the free birth chart preview, then choose the automated Essential reading or the hand-prepared Complete reading.
```

### YouTube Short Template

```text
Hook:
Your Rising sign is not just your "first impression."

Body:
In traditional astrology, the Rising sign sets the entire house structure.
It decides which topics belong to which parts of life.
It also points to the chart ruler, one of the first planets an astrologer studies.

CTA:
That is why a real chart reading starts there. Try the free chart preview at Mystic Birth Chart.
```

### Pinterest Pin Copy Template

Title:

```text
What Your Chart Ruler Means in Astrology
```

Overlay:

```text
The planet that leads your birth chart
```

Description:

```text
Learn why traditional astrologers begin with the Ascendant and chart ruler, and how this changes the way you read your whole birth chart.
```

Destination:

- Relevant blog post or `/free-birth-chart`.

## 17. Product Copy Bank

Use these ideas across the site, emails, social posts, and ads.

### Short CTAs

- "Start with a free chart preview"
- "Get the instant Essential Reading"
- "Order a hand-prepared Complete Reading"
- "Read your chart as a whole"
- "Get the Essential Birth Chart Reading"
- "Go deeper with the Complete Reading"
- "See a sample report"

### Offer Headlines

- "A birth chart reading that does not stop at your Sun sign."
- "Your chart is not a list of placements."
- "Traditional astrology, translated into clear modern guidance."
- "An instant automated first reading for people who want more than the free preview."
- "A hand-prepared Complete report for people who want the whole pattern."
- "Know where your chart begins, what it repeats, and what it asks of you."

### Objection Handling

Objection: "Why pay if calculators are free?"

Answer:

```text
A free calculator can list placements. A reading decides which placements matter most, how they connect, and what the chart is emphasizing as a whole.
```

Objection: "Will this predict my future?"

Answer:

```text
The reading is not a guaranteed prediction service. It is a structured interpretation of your natal chart for self-reflection, clarity, and practical insight.
```

Objection: "I do not know my birth time."

Answer:

```text
A birth time makes the reading more precise, especially for houses and the Ascendant. If the time is unknown, the reading can still discuss planets and aspects, but some parts will be limited.
```

## 18. Future Product Ladder

Do not build these before the core funnel works, but keep them in mind.

Possible future products:

- Mini Venus Reading
- Saturn Return Reading
- Career/Vocation Reading
- Love Pattern Reading
- Annual Astrology Guide
- Solar Return / Year Ahead Reading
- Decan Angel Practice Guide ebook
- Hermetic Birth Angel Reading
- Complete Natal + Hermetic Angel Reading
- Monthly astrology membership
- Transit update PDF
- Synastry/couple reading
- Anonymous chart submission paid feature

Priority order:

1. Make Essential and Complete readings sell consistently.
2. Add testimonials and sample excerpts.
3. Add email capture and welcome flow.
4. Add small digital products or mini readings.
5. Add membership only if there is repeat demand.

## 19. Growth Priorities

Highest priority before serious traffic:

1. Buy domain.
2. Connect domain to Vercel.
3. Configure professional support email.
4. Configure Stripe.
5. Configure GA4 and Search Console.
6. Configure newsletter capture.
7. Add at least one real sample/testimonial after first clients.

Content priority:

1. Keep improving high-intent blog posts.
2. Create Pinterest assets for existing posts.
3. Create Instagram/Reels/Shorts from existing articles.
4. Build an anonymous submissions page or form.
5. Create a repeatable weekly content calendar.

Conversion priority:

1. Ensure every major page has a clear CTA.
2. Ensure checkout is simple on mobile.
3. Add trust details: delivery time, what is included, refund policy, sample report.
4. Add testimonials when available.
5. Test Essential vs Complete emphasis.

## 20. Technical Operations

Important commands:

```bash
npm run dev
npm run lint
npm run build
```

Before pushing:

- Run lint.
- Run build if code changed.
- Check key routes if possible.

Known issue:

- `npm audit --omit=dev` previously showed moderate vulnerabilities related to `postcss` under `next`.
- Do not run `npm audit fix --force` blindly because it may downgrade or break Next.
- Wait for compatible Next updates or evaluate carefully.

Environment variables from `.env.example`:

```text
NEXT_PUBLIC_SITE_URL=https://mysticbirthchart.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_SUPPORT_EMAIL=hello@mysticbirthchart.com
STRIPE_SECRET_KEY=
STRIPE_BASIC_PRICE_ID=
STRIPE_COMPLETE_PRICE_ID=
NEXT_PUBLIC_BIRTH_DETAILS_FORM_URL=
```

Do not commit real `.env.local` secrets.

### VPS Availability

The owner has access to a capable Contabo VPS. It currently runs a WhatsApp Evolution instance and can be used if the project needs backend work.

Use Vercel first for the public frontend, simple APIs, checkout redirects, and basic email notifications. Consider the VPS later for:

- PDF generation queues.
- Email retry logs.
- Scheduled jobs.
- A small private admin backend.
- Persistent lead/order storage.
- Stripe webhook processing that benefits from durable logs.
- WhatsApp or CRM integrations.

Do not move the frontend away from Vercel unless there is a clear operational reason.

## 21. Pending Setup Checklist

Domain:

- Done: buy final domain.
- Done: connect root domain and `www` in Vercel.
- Done: update `NEXT_PUBLIC_SITE_URL` in Vercel.

Email:

- Done: create `hello@mysticbirthchart.com` mailbox.
- Done: update `NEXT_PUBLIC_SUPPORT_EMAIL` in Vercel.
- Done: Hostinger MX, SPF, DKIM, and DMARC records are present in DNS.
- Done: buyer receives email after purchase and the owner receives the order email, according to the owner.
- Pending: keep monitoring deliverability and spam placement.

Stripe:

- Done: two products exist and are ready to buy, according to the owner.
- Done: checkout and post-purchase emails are working, according to the owner.
- Done: public naming moved from Simple/Basic to Essential Birth Chart Reading in the site copy.
- Done: Essential repositioned as a $17 automated instant email reading in public copy and post-purchase email logic.
- Pending: ensure `STRIPE_BASIC_PRICE_ID` points to the live $17 Stripe price.
- Pending: verify all live purchase events are tracked after GA4 setup.

Analytics:

- Done: GA4 property and production web stream configured.
- Done: GA4 measurement ID verified in Vercel and on the live domain.
- Done: Search Console linked to GA4.
- Done: GA4 retention, referral exclusion, domain configuration, custom dimensions, reporting currency, reporting time zone, and key-event cleanup configured.
- Done locally: privacy-safe funnel event instrumentation and an event map are implemented.
- Done: Search Console/indexing handled by the owner.
- Done locally: expanded funnel events and session-scoped UTM capture are implemented.
- Pending: run one real Essential purchase and confirm the complete `begin_checkout` -> `purchase` chain in GA4 after processing delay.

### 2026-07-11 local optimization state

- The primary funnel is Free Chart -> automated Essential ($17) -> individually reviewed Complete ($97).
- The five-step Free Chart flow is preserved, supports unknown birth time, and carries birth details into checkout with sessionStorage.
- About and article authorship are faceless and method-led under Mystic Birth Chart Editorial Studio.
- Fake social-proof notifications were removed completely and must not be restored without a real, consented data source.
- Commercial landing pages exist for Complete, Love, Career, Year Ahead, and Synastry readings.
- Dynamic sitemap, robots, RSS, social metadata, canonical URLs, structured data, security headers, and noindex rules are implemented locally.
- `docs/growth-strategy.md`, `docs/content-intent-map.md`, `docs/analytics-event-map.md`, and newsletter/proof setup notes document the acquisition system.
- Automated tests cover product truth, analytics privacy, and natal calculations for Porto Alegre, New York, and London.
- Final local validation passed lint, typecheck, 8 tests, production build, 73 public routes, 78 internal links, and 28 responsive page/viewport combinations.

### 2026-07-12 free-tool and fulfillment expansion

- The Free Chart now includes a denser calculated synthesis, natal Moon phase, chart ruler, sect, intention lens, and practical observation.
- Users can keep a seven-page personalized PDF with a subtle generated parchment texture and the Mystic Birth Chart mark. Download does not require email; optional email delivery and newsletter consent are separate.
- New free tools exist at `/annual-time-lord` and `/natal-moon-phase`, joining `/planetary-hours`. All three appear in desktop/mobile navigation, the footer, sitemap, and a homepage study-instruments section.
- Annual Time Lord uses whole-sign annual profections, traditional rulers, birthday-to-birthday periods, and a twelve-year cycle. It is educational timing rather than deterministic prediction.
- Natal Moon Phase calculates the solar-lunar angle, illumination, one of eight phases, the Moon sign, and a developmental task from birth date, time, and city.
- Checkout now preserves fulfillment details in private Stripe Session and PaymentIntent metadata. A signed Stripe webhook can fulfill paid orders independently of the browser return page, with idempotency and retry status.
- The Free Chart PDF endpoint recalculates charts server-side, uses no-store responses, limits repeated requests, sends through Hostinger SMTP, and can add separately consenting contacts to Brevo using only email and optional name.
- `docs/newsletter-setup.md` contains the five-email Reading Room welcome automation and twice-weekly editorial cadence.
- Automated coverage now includes annual profections, all eight Moon-phase boundaries, illumination, and minimum free-reading depth. Current local validation: lint clean, typecheck clean, 12 tests passing, production build passing with 139 generated pages.
- Pending external setup: add the live Stripe webhook signing secret as `STRIPE_WEBHOOK_SECRET`; create/configure the Brevo list and set `BREVO_API_KEY` plus `BREVO_LIST_ID`; then run one controlled end-to-end purchase test.

Newsletter:

- Chosen integration: Brevo.
- Done locally: separate consent, contact API integration, and five-email welcome sequence specification.
- Pending: create the Brevo list and automation, then add production API key and list ID in Vercel.

Social:

- Create Instagram.
- Create Pinterest business account.
- Create YouTube channel.
- Use same handle if available.
- Make `/free-birth-chart` the default link-in-bio destination.

Proof:

- Add testimonials after first real readings.
- Add anonymized sample excerpts.
- Add delivery screenshots or review snippets if allowed.

## 22. AI Collaboration Rules

When another AI works on this project:

- Read this file first.
- Preserve the old-study/Victorian astrology direction.
- Do not turn the site into a generic purple mystical design.
- Do not remove the real educational angle to make it only a sales page.
- Keep English copy aimed at USD buyers.
- Keep the free chart tool easy: city input, no latitude/longitude requirement.
- Protect readability and contrast.
- Keep checkout custom until the final Stripe payment step.
- Do not invent fake testimonials.
- Do not let magic content drift away from astrology; every esoteric topic must be tied to planets, decans, timing, signs, houses, or natal chart structure.
- Do not make medical, legal, financial, psychological, or guaranteed predictive claims.
- Do not commit secrets.
- Update this file after major changes to product, positioning, channels, or technical setup.
