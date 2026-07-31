import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { AnalyticsEvent } from "@/components/AnalyticsEvent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { FAQ } from "@/components/FAQ";
import { getArticleBySlug } from "@/lib/articles";
import type { CommercialLandingConfig } from "@/lib/commercialLandings";
import { getReadingOffer } from "@/lib/orders";
import { siteConfig } from "@/lib/site";

export function CommercialReadingLanding({ config }: { config: CommercialLandingConfig }) {
  const offer = getReadingOffer(config.tier);
  const sampleAnchor = config.tier === "kabbalah" ? "kabbalah" : config.tier === "basic" ? "essential" : "complete";
  const relatedArticles = config.relatedSlugs
    .map((slug) => getArticleBySlug(slug))
    .filter((article) => article !== null);
  const isComplete = config.tier === "complete";

  const faqItems = [
    {
      question: "What will I receive?",
      answer: `${offer.product.format}. ${offer.product.delivery}. ${offer.product.disclosure}`,
    },
    {
      question: "What birth information is needed?",
      answer:
        config.tier === "synastry"
          ? "Birth date, time if known, and city/country for both people, plus the relationship question you want prioritized."
          : "Your birth date, birth time as precisely as possible, birth city/country, and an optional focus or question.",
    },
    {
      question: "Is the reading automated?",
      answer: isComplete
        ? "No. The Complete Natal Reading is individually analyzed, prepared, reviewed, and refined before delivery."
        : "No. This focused reading is individually prepared. The separate $17 Essential Birth Chart Reading is the automated product.",
    },
    {
      question: "Does the reading guarantee an outcome?",
      answer:
        "No. The reading is a symbolic and educational interpretation of chart patterns. It does not guarantee events or replace medical, legal, financial, or psychological advice.",
    },
  ];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: offer.product.name,
    description: offer.product.summary,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: offer.product.price.replace(/[^0-9.]/g, ""),
      url: `${siteConfig.url}${config.path}`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <AnalyticsEvent
        name="view_item"
        params={{
          product_id: config.tier,
          product_category: "reading",
          funnel_step: "commercial-landing",
        }}
      />
      {[productJsonLd, faqJsonLd].map((value, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }}
        />
      ))}

      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Readings", href: "/birth-chart-report" },
              { label: offer.product.name, href: config.path },
            ]}
          />
          <p className="mb-4 mt-7 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/75">
            {config.eyebrow}
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            {config.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ivory/68">
            {config.intro}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href={offer.checkoutPath} size="lg">
              Order {offer.product.name} - {offer.product.price}
            </Button>
            <Button href={`/sample-report#${sampleAnchor}`} size="lg" variant="secondary">
              See a Sample Reading
            </Button>
          </div>
          <p className="mt-4 font-ui text-xs uppercase tracking-[0.12em] text-ivory/48">
            {offer.product.delivery} / {offer.product.format}
          </p>
        </div>
      </section>

      <section className="reading-area py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark/75">
              The question behind the reading
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold text-aubergine md:text-4xl">
              {config.question}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink/66">{config.excerpt}</p>
            <Link
              href={`/sample-report#${sampleAnchor}`}
              className="mt-6 inline-flex min-h-11 items-center font-ui text-sm font-semibold text-aubergine underline decoration-gold/55 underline-offset-4"
            >
              Read the editorial sample
            </Link>
          </div>

          <div className="border border-gold/22 bg-white/35 p-6 md:p-8">
            <h2 className="font-heading text-3xl font-semibold text-aubergine">
              What will be analyzed
            </h2>
            <ul className="mt-6 grid gap-3">
              {offer.features.map((feature) => (
                <li key={feature} className="flex gap-3 border-t border-gold/15 pt-3 text-sm leading-relaxed text-ink/68 first:border-0 first:pt-0">
                  <span aria-hidden="true" className="text-gold-dark">+</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-midnight py-16 text-ivory md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["01", "Submit the chart data", "Enter the required birth details and the question you want the reading to keep in view."],
              ["02", "The chart is analyzed", isComplete ? "The studio identifies hierarchy, repeated testimony, and the parts of the chart that deserve the most weight." : "The selected topic is studied inside the natal structure instead of as an isolated placement."],
              ["03", "Receive the written reading", `${offer.product.delivery}. The ${offer.product.format.toLowerCase()} is sent to the checkout email.`],
            ].map(([number, title, body]) => (
              <article key={number} className="border border-ivory/12 bg-ivory/[0.035] p-6">
                <span className="font-ui text-xs text-gold">{number}</span>
                <h3 className="mt-4 font-heading text-2xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/62">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-10 text-center font-heading text-3xl font-semibold text-ivory md:text-5xl">
            Questions before ordering
          </h2>
          <FAQ items={faqItems} />
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="reading-area py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-heading text-3xl font-semibold text-aubergine md:text-4xl">
              Study the question before you order
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedArticles.map((article) => <ArticleCard key={article.slug} {...article} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
