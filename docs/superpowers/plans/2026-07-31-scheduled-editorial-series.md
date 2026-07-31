# Scheduled Editorial Series Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy fourteen deeply researched astrology articles once and release two automatically per day for seven days.

**Architecture:** Frontmatter carries an exact `publishAt` timestamp. A pure scheduling helper gates every article reader, while fifteen-minute route revalidation refreshes the index, category, article, RSS, and sitemap surfaces without external infrastructure. The existing article audit becomes the editorial acceptance gate for long scheduled content.

**Tech Stack:** Next.js 16 App Router, TypeScript, gray-matter, Markdown, Node test runner, Vercel ISR.

## Global Constraints

- Public content is English and uses `https://mysticbirthchart.com` links only.
- Two articles release daily at 09:00 and 16:00 America/New_York from 2026-07-31 through 2026-08-06.
- Scheduled articles contain at least 1,800 words, three internal links, and a sources section.
- Magic remains astrological, contemplative, non-coercive, and free of guaranteed outcomes.
- No prompt language, drafting instructions, placeholders, invented quotations, or customer data may enter an article.

---

### Task 1: Publication Gate

**Files:**
- Create: `src/lib/articlePublishing.ts`
- Modify: `src/lib/articles.ts`
- Test: `tests/articlePublishing.test.ts`

**Interfaces:**
- Produces: `resolvePublishInstant(date: string, publishAt?: string): number`
- Produces: `isPublished(date: string, publishAt: string | undefined, now?: Date): boolean`
- `ArticleMeta` gains `publishAt: string`.

- [ ] Write tests covering past, exact-boundary, future, invalid, and date-only publication values.
- [ ] Run `npm test -- tests/articlePublishing.test.ts` and verify failure before implementation.
- [ ] Implement the pure publication helper and filter both list and slug readers.
- [ ] Run the focused test and confirm it passes.

### Task 2: Runtime Release Surfaces

**Files:**
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `src/app/blog/category/[category]/page.tsx`
- Modify: `src/app/rss.xml/route.ts`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: publication-filtered functions from `src/lib/articles.ts`.
- Produces: all public discovery surfaces refreshed at most fifteen minutes after release.

- [ ] Add `revalidate = 900` to every article discovery surface.
- [ ] Ensure future slugs return `notFound()` and emit no metadata.
- [ ] Ensure RSS uses `publishAt` for `pubDate` and a fifteen-minute shared-cache TTL.
- [ ] Add tests proving future entries are excluded from list and slug readers.

### Task 3: Editorial Audit Expansion

**Files:**
- Modify: `scripts/audit-articles.mjs`

**Interfaces:**
- Consumes: article Markdown and frontmatter.
- Produces: a non-zero exit for thin scheduled articles, invalid timestamps, instruction leakage, duplicate long paragraphs, missing sources, or insufficient internal links.

- [ ] Add the scheduled-article validation rules.
- [ ] Add targeted forbidden patterns without blocking legitimate educational prose.
- [ ] Add duplicate-paragraph detection for normalized paragraphs of at least 180 characters.
- [ ] Run `npm run audit:articles` against the existing library and tune false positives before adding new content.

### Task 4: Technical Astrology Articles

**Files:**
- Create seven Markdown files under `src/content/articles/` for combustion, aspect phase, reception, antiscia, fixed stars, zodiacal releasing, and prenatal syzygy.

**Interfaces:**
- Consumes: established article frontmatter and internal-link format.
- Produces: seven scheduled long-form studies with primary-source bibliographies.

- [ ] Research Ptolemy, Valens, Firmicus, Dorotheus, and relevant source editions.
- [ ] Write each article to at least 1,800 words with distinct structure and practical examples.
- [ ] Add three or more contextually useful internal links to each article.
- [ ] Review every claim against its cited source and run the article audit.

### Task 5: Historical and Magical Astrology Articles

**Files:**
- Create seven Markdown files under `src/content/articles/` for Dorotheus, al-Kindi, Iamblichus, John Dee, Robert Fludd, lunar mansions, and planetary hymns.

**Interfaces:**
- Consumes: Mystic's Hermetic editorial boundaries.
- Produces: seven source-aware studies that keep magic directly tied to astrology.

- [ ] Research primary texts and institutional digital collections.
- [ ] Write each article to at least 1,800 words while distinguishing historical source, later reception, and modern practice.
- [ ] Include explicit safety, consent, and epistemic limits wherever practical material appears.
- [ ] Review every claim against its cited source and run the article audit.

### Task 6: Final Editorial Acceptance

**Files:**
- Review: all fourteen new Markdown files.
- Review: scheduling and audit files from Tasks 1-3.

**Interfaces:**
- Produces: a deployable seven-day editorial series.

- [ ] Run a scan for prompt leakage, Portuguese fragments, placeholders, raw drafting notes, repeated paragraphs, and unsupported exact claims.
- [ ] Verify the schedule contains exactly fourteen unique timestamps and two releases per day.
- [ ] Run `npm run audit:articles`, `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- [ ] Confirm today's two articles are public and tomorrow's two return 404 in a production-equivalent local run.
- [ ] Commit and push the verified series to `main` for Vercel deployment.
