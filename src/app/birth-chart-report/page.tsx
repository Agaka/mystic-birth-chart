import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { SampleReportPreview } from "@/components/SampleReportPreview";
import { FAQ } from "@/components/FAQ";
import { CTASection } from "@/components/CTASection";
import { PrimaryReadingComparison } from "@/components/PrimaryReadingComparison";
import { ReadingNeedSelector } from "@/components/ReadingNeedSelector";
import { ReadingOfferCards } from "@/components/ReadingOfferCards";
import { createPageMetadata } from "@/lib/metadata";
import { getBasicCheckoutUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Natal Chart Readings",
  description:
    "Order an automated Essential birth chart reading for $17, delivered instantly by email, or a hand-prepared Complete natal reading for deeper synthesis.",
  path: "/birth-chart-report",
});

const included = [
  "Essential: an automated email reading generated from your birth date, exact time, and city",
  "Complete: a hand-prepared PDF reading written with deeper chart judgment",
  "Traditional-first analysis of planets, houses, rulers, and aspects",
  "Clear synthesis for purpose, relationships, career, money, and temperament",
  "A private document you can revisit instead of a disposable horoscope",
  "Delivery instantly by email for Essential, or within 72 hours for Complete",
];

const method = [
  {
    title: "Calculate the chart",
    body: "The reading begins with your birth data, house placements, planetary condition, aspects, and chart emphasis.",
  },
  {
    title: "Choose the depth",
    body: "Essential gives you an automated first synthesis. Complete is the hand-prepared option for a fuller chart hierarchy.",
  },
  {
    title: "Receive the reading",
    body: "The Essential reading arrives instantly by email. The Complete reading is prepared by hand and delivered as a PDF.",
  },
];

const faqItems = [
  {
    question: "Is this a live astrology consultation?",
    answer:
      "No. Essential is an automated written reading delivered instantly by email. Complete is an individually prepared written PDF you can revisit whenever you want.",
  },
  {
    question: "Is this generated automatically?",
    answer:
      "The Essential Birth Chart Reading is generated automatically from your birth data and delivered instantly by email. The Complete Natal Reading is not automated; it is prepared by hand in a limited daily queue.",
  },
  {
    question: "What birth information do I need?",
    answer:
      "You need your birth date, birth time as precisely as possible, and birth city/country. You can also choose a focus such as love, career, money, emotional patterns, or general direction.",
  },
  {
    question: "What if I do not know my exact birth time?",
    answer:
      "Birth time affects the Rising sign, houses, and Midheaven. If you do not know it, we can still read planetary signs and aspects, but house-based sections will be less precise or omitted.",
  },
  {
    question: "Which reading should I choose?",
    answer:
      "Choose Essential if you want the most accessible first paid synthesis and instant delivery. Choose Complete if you want deeper house ruler analysis, more life areas, and a hand-prepared interpretation.",
  },
  {
    question: "Does this predict my future?",
    answer:
      "No. The reading is symbolic and reflective. It describes tendencies, patterns, pressures, and potentials. It does not guarantee outcomes or replace professional advice.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "For the automated Essential reading, delivery begins immediately after purchase and birth details, so refunds are generally not offered once it is sent. For Complete, refunds are available before the hand-prepared work begins unless there is a clear fulfillment issue.",
  },
];

export default function BirthChartReportPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero
        eyebrow="Natal chart reading studio"
        headline="Order a chart reading prepared like an old astrological dossier."
        subheadline="A written birth chart interpretation with a traditional foundation, clear synthesis, and enough practical language to make the symbolism useful."
        primaryCta={{ label: "Choose a Reading", href: "#readings" }}
        secondaryCta={{ label: "View Sample", href: "/sample-report" }}
        compact
      />

      <section id="readings" className="parchment-surface scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark/80">
              Reading options
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-aubergine md:text-5xl">
              Start instantly at $17. Go deeper by hand at $97.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/62">
              Essential is the automated entry reading: lower price, instant
              email delivery, and clear first synthesis. Complete is for people
              who want the fuller chart architecture interpreted by hand.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            <PrimaryReadingComparison />
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <ReadingNeedSelector />
          </div>

          <div className="mx-auto mt-16 max-w-6xl">
            <div className="mb-10 max-w-3xl">
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark/75">
                Full catalog
              </p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-aubergine md:text-5xl">
                Browse every reading by the question it answers.
              </h2>
            </div>
            <ReadingOfferCards />
          </div>
        </div>
      </section>

      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
              What you receive
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-ivory md:text-5xl">
              A clear path from instant insight to hand-prepared depth.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ivory/58">
              Many free tools can list your placements. Essential gives you the
              first automated synthesis quickly. Complete adds the human judgment
              needed for deeper hierarchy, emphasis, and nuance.
            </p>
          </div>

          <ul className="space-y-4">
            {included.map((item) => (
              <li
                key={item}
                className="border border-ivory/10 bg-midnight-light/45 p-5 text-ivory/70"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="wood-panel py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
              Method
            </p>
            <h2 className="font-heading text-3xl font-semibold text-ivory md:text-5xl">
              Traditional structure. Modern clarity.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {method.map((item, index) => (
              <article
                key={item.title}
                className="border border-gold/18 bg-ink/36 p-6"
              >
                <span className="font-ui text-xs font-semibold uppercase tracking-[0.2em] text-gold/60">
                  Step {index + 1}
                </span>
                <h3 className="mt-4 font-heading text-2xl font-semibold text-ivory">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/55">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
              Preview
            </p>
            <h2 className="font-heading text-3xl font-semibold text-ivory md:text-5xl">
              See the tone before you order.
            </h2>
          </div>
          <SampleReportPreview compact />
          <div className="mt-8 text-center">
            <Button
              href="/sample-report"
              variant="secondary"
              size="md"
              analytics={{
                event: "cta_click",
                params: {
                  cta_location: "readings_page_preview",
                },
              }}
            >
              View Full Sample
            </Button>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-ink py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center font-heading text-3xl font-semibold text-ivory md:text-5xl">
            Questions before ordering
          </h2>
          <FAQ items={faqItems} />
        </div>
      </section>

      <CTASection
        title="Start now, or choose the deeper hand-prepared path."
        body={`Essential is automated and instant. Complete is prepared by hand, with ${siteConfig.capacity.toLowerCase()}.`}
        buttonLabel="Get Instant Essential Reading"
        buttonHref={getBasicCheckoutUrl()}
        variant="gradient"
        analyticsLocation="readings_page_final_cta"
      />
    </>
  );
}
