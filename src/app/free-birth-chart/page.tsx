import type { Metadata } from "next";
import { NatalChartSnapshotTool } from "@/components/NatalChartSnapshotTool";
import { ReadingOfferCards } from "@/components/ReadingOfferCards";
import { CTASection } from "@/components/CTASection";
import { getBasicCheckoutUrl, getCompleteCheckoutUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Birth Chart Snapshot",
  description:
    "Calculate a free natal chart snapshot with Sun, Moon, Rising, chart ruler, and a short traditional-first interpretation.",
};

const reasons = [
  {
    title: "It gives the surface",
    body: "Sun, Moon, Rising, chart ruler, and day or night chart are enough to feel the language of your chart without pretending to replace a full synthesis.",
  },
  {
    title: "It stays private",
    body: "The sample runs in your browser. It does not require an account, email signup, or a stored profile.",
  },
  {
    title: "It points to the real work",
    body: "A complete reading studies houses, rulers, aspects, condition, emphasis, and how the placements speak to each other.",
  },
];

export default function FreeBirthChartPage() {
  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
              Free natal chart snapshot
            </p>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
              Take a first look at your chart before ordering a reading.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-ivory/68">
            Enter your birth details and receive a quick traditional-first
            snapshot: Sun, Moon, Rising, chart ruler, day or night chart, and a
            short interpretation of what those placements suggest.
          </p>
        </div>
      </section>

      <section className="bg-midnight py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <NatalChartSnapshotTool
            basicHref={getBasicCheckoutUrl()}
            completeHref={getCompleteCheckoutUrl()}
          />
        </div>
      </section>

      <section className="parchment-surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark/80">
              Why this is only a beginning
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-aubergine md:text-5xl">
              A chart is not three signs. It is a pattern.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink/62">
              The snapshot is intentionally useful but incomplete. It helps you
              recognize the main doorway, then shows why a hand-prepared reading
              can go much deeper.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {reasons.map((reason) => (
              <article
                key={reason.title}
                className="border border-gold/25 bg-white/28 p-6"
              >
                <h3 className="font-heading text-2xl font-semibold text-aubergine">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/64">
                  {reason.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
              Ready for the full reading?
            </p>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-ivory md:text-5xl">
              Choose the depth of your personal report.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ivory/58">
              Start with a clear $29 reading, or choose the complete $97
              synthesis when you want more detail across love, career, money,
              temperament, and direction.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl">
            <ReadingOfferCards />
          </div>
        </div>
      </section>

      <CTASection
        title="A free snapshot can name the doorway. A reading opens the room."
        body="Order a written chart interpretation prepared with traditional structure and practical clarity."
        buttonLabel="Order a Reading"
        buttonHref={getBasicCheckoutUrl()}
        variant="gradient"
        analyticsLocation="free_chart_final_cta"
      />
    </>
  );
}
