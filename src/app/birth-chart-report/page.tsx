import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Button } from "@/components/Button";
import { SampleReportPreview } from "@/components/SampleReportPreview";
import { FAQ } from "@/components/FAQ";
import { CTASection } from "@/components/CTASection";
import { ReadingOfferCards } from "@/components/ReadingOfferCards";
import { getBasicCheckoutUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Natal Chart Readings",
  description:
    "Order a written natal chart reading grounded in traditional astrology, practical synthesis, and clear personal guidance. Basic readings start at $29.",
};

const included = [
  "A written PDF reading prepared from your birth date, exact time, and city",
  "Traditional-first analysis of planets, houses, rulers, and aspects",
  "Clear synthesis for purpose, relationships, career, money, and temperament",
  "A private document you can revisit instead of a disposable horoscope",
  "Delivery within 48 to 72 hours depending on the reading option",
];

const method = [
  {
    title: "Calculate the chart",
    body: "The reading begins with your birth data, house placements, planetary condition, aspects, and chart emphasis.",
  },
  {
    title: "Find the ruling pattern",
    body: "We look for the chart's hierarchy: angular planets, rulers, Saturn, Venus, the Moon, and repeating themes.",
  },
  {
    title: "Write the synthesis",
    body: "The final reading connects the pieces into a coherent narrative, with practical guidance instead of fatalistic claims.",
  },
];

const faqItems = [
  {
    question: "Is this a live astrology consultation?",
    answer:
      "No. This is a written natal chart reading delivered as a PDF. That keeps the price accessible and lets you revisit the interpretation whenever you want.",
  },
  {
    question: "Is this generated automatically?",
    answer:
      "No generic automated report is sent directly to you. The reading is prepared from your birth data, structured through astrological interpretation, and reviewed for clarity, coherence, and usefulness before delivery.",
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
      "Choose Basic if you want an accessible first reading of your core chart pattern. Choose Complete if you want deeper house ruler analysis, more life areas, and a fuller synthesis.",
  },
  {
    question: "Does this predict my future?",
    answer:
      "No. The reading is symbolic and reflective. It describes tendencies, patterns, pressures, and potentials. It does not guarantee outcomes or replace professional advice.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Refunds are available before the reading work begins. Once a personalized reading is prepared or delivered, refunds are generally not offered unless there is a clear fulfillment issue.",
  },
];

export default function BirthChartReportPage() {
  return (
    <>
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
              Start at $29. Go deeper at $97.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/62">
              Basic is built for first-time buyers. Complete is for people who
              want the fuller chart synthesis and are ready for a deeper reading.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
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
              A personal reading, not a pile of disconnected meanings.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ivory/58">
              Many free tools can list your placements. The value here is
              synthesis: how those placements work together, which themes matter
              most, and what the chart seems to ask from you.
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
          <SampleReportPreview />
          <div className="mt-8 text-center">
            <Button
              href="/sample-report"
              variant="secondary"
              size="md"
              analytics={{
                event: "cta_click",
                params: {
                  cta_label: "View Full Sample",
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
        title="There are only so many charts one person can read well in a day."
        body={`${siteConfig.capacity}. Choose the reading depth that matches where you are now.`}
        buttonLabel="Order a Reading"
        buttonHref={getBasicCheckoutUrl()}
        variant="gradient"
        analyticsLocation="readings_page_final_cta"
      />
    </>
  );
}
