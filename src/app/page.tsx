import { Hero } from "@/components/Hero";
import { ArticleCard } from "@/components/ArticleCard";
import { CategoryCard } from "@/components/CategoryCard";
import { CTASection } from "@/components/CTASection";
import { BlogGrid } from "@/components/BlogGrid";
import { ReadingOfferCards } from "@/components/ReadingOfferCards";
import { SampleReportPreview } from "@/components/SampleReportPreview";
import { Button } from "@/components/Button";
import { getAllArticles, getFeaturedArticles } from "@/lib/articles";
import { categories } from "@/lib/categories";
import { getBasicCheckoutUrl, siteConfig } from "@/lib/site";

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
  "Order Essential automated or Complete hand-prepared",
  "Send birth date, exact time, city, and focus",
  "Receive an instant email reading or a hand-prepared PDF",
];

export default function HomePage() {
  const allArticles = getAllArticles();
  const featuredArticles = getFeaturedArticles().slice(0, 3);
  const recentArticles = allArticles.slice(0, 6);

  return (
    <>
      <Hero
        eyebrow="Private natal chart readings"
        headline="Enter the old study. Leave with your chart understood."
        subheadline="Premium English-language astrology readings with a traditional foundation, written for people who want more than generic signs, vague predictions, or copy-paste interpretations."
        primaryCta={{ label: "Get Instant Essential Reading", href: getBasicCheckoutUrl() }}
        secondaryCta={{ label: "View Sample", href: "/sample-report" }}
        imageSrc="/images/birth-chart-reading-hero.png"
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
          <div>
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
              Why this feels different
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-ivory md:text-5xl">
              Open a private astrological notebook.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-ivory/62">
            The experience is built around atmosphere and synthesis: a quiet,
            scholarly, old-world space where you can study astrology seriously,
            then order a personal reading when you want your own chart
            interpreted.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-5 px-6 md:grid-cols-3">
          {authorityNotes.map((note) => (
            <article
              key={note.title}
              className="border border-ivory/10 bg-midnight-light/45 p-6"
            >
              <h3 className="font-heading text-2xl font-semibold text-ivory">
                {note.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/52">
                {note.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="readings" className="parchment-surface scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto mb-16 grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark/80">
              Try your own chart first
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-aubergine md:text-5xl">
              Begin with a free chart preview.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-ink/62">
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
                    cta_label: "Begin My Free Chart Preview",
                    cta_location: "homepage_free_chart_section",
                  },
                }}
              >
                Begin My Free Chart Preview
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6">
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

          <div className="mx-auto mt-12 max-w-5xl">
            <ReadingOfferCards />
          </div>
        </div>
      </section>

      <section className="wood-panel py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
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
          <SampleReportPreview />
        </div>
      </section>

      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
                The reading room
              </p>
              <h2 className="font-heading text-3xl font-semibold text-ivory md:text-5xl">
                Begin with the strongest essays.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-ivory/50">
              Use the essays to learn the language of the chart, then order a
              reading when you want your own pattern interpreted.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
              Browse by study table
            </p>
            <h2 className="font-heading text-3xl font-semibold text-ivory md:text-5xl">
              Browse the study tables.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} {...cat} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
              Recent notes
            </p>
            <h2 className="font-heading text-3xl font-semibold text-ivory md:text-5xl">
              Recent notes from the reading room.
            </h2>
          </div>

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
