import { Hero } from "@/components/Hero";
import { ArticleCard } from "@/components/ArticleCard";
import { CategoryCard } from "@/components/CategoryCard";
import { CTASection } from "@/components/CTASection";
import { BlogGrid } from "@/components/BlogGrid";
import { PrimaryReadingComparison } from "@/components/PrimaryReadingComparison";
import { SampleReportPreview } from "@/components/SampleReportPreview";
import { Button } from "@/components/Button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getAllArticles, getFeaturedArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { createPageMetadata } from "@/lib/metadata";
import { getBasicCheckoutUrl, siteConfig } from "@/lib/site";

export const metadata = createPageMetadata({
  title: "Traditional Birth Chart Readings",
  description:
    "Begin with a free birth chart preview, receive an automated Essential reading for $17, or order an individually prepared Complete natal reading for $97.",
  path: "/",
});

const authorityNotes = [
  {
    title: "Traditional-first synthesis",
    body: "We look beyond Sun sign summaries into houses, rulers, sect, aspects, angular emphasis, and chart context.",
  },
  {
    title: "Written for real decisions",
    body: "The reading connects symbolic patterns to love, career, temperament, money, purpose, and personal timing.",
  },
  {
    title: "Instant first step, manual depth",
    body: "Essential is automated and delivered instantly. Complete is hand-prepared in a limited daily queue.",
  },
];

const processSteps = [
  "Begin with the free preview or choose your reading",
  "Enter birth date, time, city, and focus before payment",
  "Receive an instant email reading or a hand-prepared PDF",
];

const comparisonRows = [
  {
    free: "Sun in Leo",
    full: "A Sun in Leo may speak differently in the 10th house than in the 4th. A reading studies its ruler, aspects, and repeated themes before deciding what that Sun emphasizes.",
  },
  {
    free: "Moon in Cancer",
    full: "Your Moon in Cancer in the 4th house is the emotional anchor of the chart. Its condition explains why safety feels non-negotiable.",
  },
  {
    free: "Venus in Scorpio",
    full: "Venus in Scorpio in the 8th house draws love toward intensity and depth. Its square to Mars shows why attraction and conflict keep arriving together.",
  },
];

export default function HomePage() {
  const allArticles = getAllArticles();
  const featuredArticles = getFeaturedArticles().slice(0, 3);
  const recentArticles = allArticles.slice(0, 6);

  return (
    <>
      <Hero
        eyebrow="Private natal chart readings"
        headline="Your birth chart has a hierarchy. Most people never see it."
        subheadline="The placements you already know are only the surface. Beneath them is a pattern of rulers, houses, and tensions that explains why your chart actually feels the way it does."
        primaryCta={{ label: "Get Instant Essential Reading", href: getBasicCheckoutUrl() }}
        secondaryCta={{ label: "Try the Free Chart Preview", href: "/free-birth-chart" }}
        imageSrc="/images/birth-chart-reading-hero.webp"
        imageAlt="An antique-style birth chart reading laid across a dark wooden desk with old books and brass tools."
        note={`${siteConfig.product.basic.name} ${siteConfig.product.basic.price}. ${siteConfig.product.complete.name} ${siteConfig.product.complete.price}.`}
        trustItems={[
          "Method|Traditional astrology plus modern synthesis",
          "Delivery|Essential instant email / Complete within 72 hours",
          "Queue|5 hand-prepared Complete readings per day",
        ]}
      />

      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <ScrollReveal>
            <div>
              <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
                Why this feels different
              </p>
              <h2 className="font-heading text-3xl font-semibold leading-tight text-ivory md:text-5xl">
                Open a private astrological notebook.
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className="text-lg leading-relaxed text-ivory/62">
              The experience is built around atmosphere and synthesis: a quiet,
              scholarly, old-world space where you can study astrology seriously,
              then order a personal reading when you want your own chart
              interpreted.
            </p>
          </ScrollReveal>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-5 px-6 md:grid-cols-3">
          {authorityNotes.map((note, index) => (
            <ScrollReveal key={note.title} delay={index * 120}>
              <article
                className="border border-ivory/10 bg-midnight-light/45 p-6 transition-all duration-300 hover:border-gold/25 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
              >
                <h3 className="font-heading text-2xl font-semibold text-ivory">
                  {note.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/52">
                  {note.body}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Before vs After — Contrast Effect */}
      <section className="parchment-surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark/80">
                The difference is depth
              </p>
              <h2 className="font-heading text-3xl font-semibold leading-tight text-aubergine md:text-5xl">
                A free app names the placement. A reading reveals the pattern.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink/62">
                Most chart calculators stop at surface labels. A real reading
                asks why the placement matters, where it acts, and what it
                connects to across the chart.
              </p>
              <p className="mt-3 font-ui text-xs uppercase tracking-[0.12em] text-ink/48">
                Illustrative examples only, not excerpts from client readings.
              </p>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-12 max-w-4xl">
            {comparisonRows.map((row, index) => (
              <ScrollReveal key={row.free} delay={index * 100}>
                <div className="grid gap-0 border-b border-gold/15 last:border-b-0 md:grid-cols-[0.3fr_0.7fr]">
                  <div className="border-r border-gold/15 bg-white/40 p-5 md:p-6">
                    <p className="mb-1 font-ui text-[0.62rem] uppercase tracking-[0.14em] text-ink/38">
                      What a free app shows
                    </p>
                    <p className="font-heading text-xl font-semibold text-ink/50 line-through decoration-rose/40 decoration-1">
                      {row.free}
                    </p>
                  </div>
                  <div className="bg-white/20 p-5 md:p-6">
                    <p className="mb-1 font-ui text-[0.62rem] uppercase tracking-[0.14em] text-gold-dark/70">
                      What the reading reveals
                    </p>
                    <p className="text-base leading-relaxed text-ink/78">
                      {row.full}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Free chart entry */}
      <section id="free-chart" className="bg-midnight py-16 md:py-24">
        <div className="mx-auto mb-16 grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <ScrollReveal>
            <div>
              <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
                Try your own chart first
              </p>
              <h2 className="font-heading text-3xl font-semibold leading-tight text-ivory md:text-5xl">
                Begin with a free chart preview.
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <div>
              <p className="text-lg leading-relaxed text-ivory/62">
                Before ordering, use the free chart tool to read the first layer
                of your pattern. It gives a richer sample of the interpretive
                style, then shows why a paid reading can go deeper.
              </p>
              <div className="mt-6">
                <Button
                  href="/free-birth-chart"
                  size="lg"
                  analytics={{
                    event: "cta_click",
                    params: {
                      cta_location: "homepage_free_chart_section",
                    },
                  }}
                >
                  Begin My Free Chart Preview
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why people order — Narrative Transportation */}
      <section className="wood-panel py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl">
            <ScrollReveal>
              <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
                After the preview
              </p>
              <h2 className="font-heading text-3xl font-semibold leading-tight text-ivory md:text-5xl">
                Why people order after the free preview.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <p className="mt-6 text-lg leading-relaxed text-ivory/68">
                Most people generate the free preview and notice something. A
                combination they did not expect. A tension between their Moon and
                Rising that explains a pattern they have lived for years. That is
                usually when they want the full chart read.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={250}>
              <p className="mt-4 text-base leading-relaxed text-ivory/55">
                The free preview names the doorway. The Essential reading maps the
                first room. The Complete reading reveals the whole architecture.
                Each step shows more of what was already there, waiting to be read.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={350}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  href={getBasicCheckoutUrl()}
                  size="lg"
                  analytics={{
                    event: "cta_click",
                    params: {
                      cta_location: "homepage_narrative_section",
                    },
                  }}
                >
                  Get Instant Essential Reading
                </Button>
                <span className="text-sm text-ivory/45">$17 · Automated · Instant email</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Readings section */}
      <section id="readings" className="parchment-surface scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark/80">
                Choose your reading
              </p>
              <h2 className="font-heading text-3xl font-semibold leading-tight text-aubergine md:text-5xl">
                Choose the depth of your reading.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink/62">
                Start with the focused $17 automated Essential reading, or choose
                the deeper $97 hand-prepared option when you want the full chart
                treated with more time and detail.
              </p>
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-12 max-w-5xl">
            <PrimaryReadingComparison />
          </div>
        </div>
      </section>

      {/* Sample Report */}
      <section className="wood-panel py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <ScrollReveal>
            <div>
              <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
                A reading you can imagine keeping
              </p>
              <h2 className="font-heading text-3xl font-semibold leading-tight text-ivory md:text-5xl">
                See the artifact before you order.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ivory/62">
                A sample reading lets you feel the tone before you buy. This is
                not a horoscope feed. It shows the kind of document the deeper
                hand-prepared Complete reading becomes.
              </p>
              <ol className="mt-8 space-y-3">
                {processSteps.map((step, index) => (
                  <li key={step} className="flex items-center gap-4">
                    <span className="flex h-8 w-8 items-center justify-center border border-gold/35 font-ui text-xs font-semibold text-gold">
                      {index + 1}
                    </span>
                    <span className="text-ivory/72">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <SampleReportPreview compact />
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Essays */}
      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <ScrollReveal>
              <div>
                <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
                  The reading room
                </p>
                <h2 className="font-heading text-3xl font-semibold text-ivory md:text-5xl">
                  Begin with the strongest essays.
                </h2>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p className="max-w-md text-sm leading-relaxed text-ivory/50">
                Use the essays to learn the language of the chart, then order a
                reading when you want your own pattern interpreted.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article, index) => (
              <ScrollReveal key={article.slug} delay={index * 120}>
                <ArticleCard {...article} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-ink py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
                Browse by study table
              </p>
              <h2 className="font-heading text-3xl font-semibold text-ivory md:text-5xl">
                Browse the study tables.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => (
              <ScrollReveal key={cat.slug} delay={index * 80}>
                <CategoryCard {...cat} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Recent articles */}
      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mb-12 text-center">
              <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
                Recent notes
              </p>
              <h2 className="font-heading text-3xl font-semibold text-ivory md:text-5xl">
                Recent notes from the reading room.
              </h2>
            </div>
          </ScrollReveal>

          <BlogGrid articles={recentArticles} />
        </div>
      </section>

      <CTASection
        title="Your chart is not a list of signs. It is a pattern."
        body="Start with the instant automated Essential reading, then upgrade when you want deeper hand-prepared synthesis."
        buttonLabel="Get Instant Essential Reading"
        buttonHref={getBasicCheckoutUrl()}
        variant="gradient"
        analyticsLocation="homepage_final_cta"
      />
    </>
  );
}
