import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "About the Independent Astrology Studio",
  description:
    "Learn how Mystic Birth Chart uses a structured, traditional-first method while publishing as a private independent astrology studio.",
  path: "/about",
});

const methodSteps = [
  "Ascendant and chart ruler",
  "Sect: day or night chart",
  "Houses and house rulers",
  "Planetary condition and dignity",
  "Angular emphasis",
  "Major aspects",
  "Repeated chart patterns",
  "Practical synthesis",
];

export default function AboutPage() {
  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/75">
            About the studio
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            A private, method-led astrology studio.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ivory/68">
            Mystic Birth Chart is an independent digital astrology studio built
            around a structured, traditional-first interpretive method.
          </p>
        </div>
      </section>

      <section className="reading-area">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <div className="article-prose mx-auto">
            <h2>Why We Publish Under the Studio Name</h2>
            <p>
              Mystic Birth Chart is operated as a private independent studio. We
              publish under the studio name instead of building the work around a
              public personality. The method comes first: chart structure,
              traditional sources, interpretive consistency, and practical
              synthesis.
            </p>
            <p>
              This faceless structure is deliberate. It keeps the reader&apos;s chart,
              not a personal brand, at the center of the experience. Articles are
              signed by the {siteConfig.editorialName}.
            </p>

            <h2>The Interpretive Method</h2>
            <p>
              A chart is read in order. We begin with the structure that organizes
              the rest of the symbolism, then decide which testimonies repeat and
              which details are secondary.
            </p>
          </div>

          <ol className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            {methodSteps.map((step, index) => (
              <li key={step} className="flex items-center gap-4 border border-gold/22 bg-white/35 px-4 py-4 text-ink/72">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-gold/35 font-ui text-xs font-semibold text-gold-dark">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="article-prose mx-auto mt-14">
            <h2>Automated Essential vs Individually Prepared Complete</h2>
            <p>
              The <strong>Essential Birth Chart Reading</strong> is generated
              automatically from the birth data you provide using the Mystic
              Birth Chart interpretive framework. It is delivered instantly by
              email and is clearly presented as an automated first synthesis.
            </p>
            <p>
              Each <strong>Complete Natal Reading</strong> is individually
              analyzed, prepared, reviewed, and refined before delivery. It is a
              written PDF built around the hierarchy of that customer&apos;s chart,
              not a generic placement report.
            </p>

            <h2>Editorial Principles</h2>
            <ul>
              <li>Clarity before theatrical language</li>
              <li>Consistency before isolated placement claims</li>
              <li>Non-fatalistic interpretation and no guaranteed outcomes</li>
              <li>No medical or psychological diagnosis</li>
              <li>No legal, financial, or other professional advice</li>
            </ul>

            <h2>Birth Data and Privacy</h2>
            <p>
              Birth date, time, and city are used only to calculate and fulfill the
              requested chart experience. Payment card details are handled by
              Stripe, not stored by Mystic Birth Chart. Session data used to move
              from the free preview to checkout is temporary and is not sent to
              analytics.
            </p>

            <h2>Contact the Studio</h2>
            <p>
              Questions about a reading, delivery, corrections, or privacy can be
              sent to <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
            </p>
          </div>

          <div className="mt-16 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              href="/free-birth-chart"
              size="lg"
              variant="secondary"
              className="border-ink/25 text-ink hover:border-gold hover:bg-gold/10 hover:text-aubergine"
            >
              Try the Free Chart Preview
            </Button>
            <Button href="/birth-chart-report" size="lg">
              Compare Reading Options
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
