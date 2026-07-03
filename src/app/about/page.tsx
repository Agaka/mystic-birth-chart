import type { Metadata } from "next";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mystic Birth Chart is a traditional-first astrology journal and natal reading studio focused on depth, synthesis, and practical self-understanding.",
};

export default function AboutPage() {
  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
            About the studio
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            A quiet room for serious astrology.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ivory/58">
            Mystic Birth Chart is an English-language astrology journal and
            natal reading studio for people who want depth without fatalism.
          </p>
        </div>
      </section>

      <section className="reading-area">
        <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
          <div className="article-prose mx-auto">
            <h2>What We Do</h2>
            <p>
              Mystic Birth Chart creates written natal chart readings for
              self-reflection, pattern recognition, and life direction. The goal
              is not to overwhelm you with every possible placement. The goal is
              to identify the chart patterns that matter most and translate them
              into clear language.
            </p>

            <h2>Our Approach</h2>
            <p>
              We favor traditional astrological structure: planets, houses,
              rulers, sect, angularity, aspects, and the condition of key
              significators. Modern psychological language is used when it makes
              the reading more useful, but the chart is treated as a whole
              system rather than a collection of isolated signs.
            </p>
            <p>
              Astrology is used here as symbolic study, not fixed destiny. A
              reading can name tendencies, tensions, strengths, and recurring
              themes. It should not remove your agency or pretend to guarantee
              future outcomes.
            </p>

            <h2>How Readings Are Prepared</h2>
            <p>Each reading is built from four layers:</p>
            <ul>
              <li>
                <strong>Birth data</strong> - date, exact time, and location
              </li>
              <li>
                <strong>Chart structure</strong> - houses, rulers, aspects, and
                emphasis
              </li>
              <li>
                <strong>Synthesis</strong> - the main pattern connecting the
                placements
              </li>
              <li>
                <strong>Human review</strong> - clarity, coherence, and
                usefulness before delivery
              </li>
            </ul>

            <h2>What We Are Not</h2>
            <p>
              Mystic Birth Chart does not provide medical, legal, financial, or
              psychological advice. The readings are not deterministic
              predictions. They are written for reflection, education, and
              personal meaning.
            </p>

            <h2>The Atmosphere</h2>
            <p>
              The site is designed to feel like an old study: dark wood, worn
              paper, quiet light, and a chart spread across the table. That is
              intentional. Astrology is easier to trust when it feels like
              careful study rather than noise.
            </p>
          </div>

          <div className="mt-16 text-center">
            <Button
              href="/birth-chart-report"
              size="lg"
              analytics={{
                event: "cta_click",
                params: {
                  cta_label: "View Reading Options",
                  cta_location: "about_page",
                },
              }}
            >
              View Reading Options
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
