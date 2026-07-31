# Scheduled Editorial Series Design

## Goal

Publish fourteen original, research-led English articles over seven consecutive days, two per day, while deploying all content once and preventing future articles from appearing anywhere before their scheduled time.

## Publication Model

- Store the editorial date in `date` and the exact release instant in `publishAt`.
- Use `09:00` and `16:00` in `America/New_York` for each daily pair from July 31 through August 6, 2026.
- Treat articles without `publishAt` as already published according to their existing `date` field.
- Hide scheduled articles from the blog index, category pages, related articles, RSS, sitemap, metadata, and direct routes until their release instant.
- Revalidate public article surfaces every fifteen minutes so releases happen without a new deployment, cron job, database, or VPS service.

## Editorial Series

1. Combustion, under the beams, and cazimi.
2. Applying and separating aspects.
3. Reception and mutual reception.
4. Antiscia and contra-antiscia.
5. Fixed stars in natal astrology.
6. Zodiacal releasing from Fortune and Spirit.
7. The prenatal lunation or syzygy.
8. Dorotheus of Sidon and chart judgment.
9. Al-Kindi and the theory of stellar rays.
10. Iamblichus, celestial signs, and theurgy.
11. John Dee's astrology before angelic diaries.
12. Robert Fludd's macrocosm, music, and astrology.
13. Lunar mansions in Arabic and Western astrology.
14. Planetary hymns as safe devotional astrology.

The technical articles fill clear gaps in the existing library. The historical and magical articles remain directly tied to astrology and do not repeat the existing Agrippa, Picatrix, Golden Dawn, Sefer Yetzirah, Arbatel, or decan-angel introductions.

## Editorial Standard

- English prose aimed at thoughtful readers rather than specialists only.
- At least 1,800 words per article, with a target reading time above nine minutes.
- Explain method, historical context, interpretive hierarchy, practical use, limitations, and common errors.
- Include at least three relevant internal links and a final sources/further-study section.
- Prefer primary texts and institutional digital collections; distinguish primary sources, later transmission, and modern reconstruction.
- Keep magical practice contemplative, consent-respecting, non-toxic, and free of guaranteed claims.
- Do not invent exact quotations, dates, correspondences, manuscript claims, or technical rules.

## Quality Gates

- Reject missing or invalid `publishAt` values on newly scheduled articles.
- Reject scheduled articles below 1,800 words.
- Reject common drafting instructions, prompt language, placeholders, and AI self-reference.
- Reject duplicate long paragraphs across the library.
- Reject broken internal article links.
- Manually inspect every article for factual consistency, unsupported certainty, repeated sections, accidental Portuguese, and leaked drafting language.
- Run article audit, tests, typecheck, lint, and production build before publishing.

## Success Criteria

- Fourteen files are present in the repository and deployed once.
- Exactly two become public per calendar day at the configured New York times.
- Future articles are unavailable by direct URL and absent from all discovery surfaces.
- Each article is meaningfully distinct, exceeds the depth of a short three-to-four-minute post, and passes both automated and manual editorial review.
