import type { Metadata } from "next";
import { NatalChartSnapshotTool } from "@/components/NatalChartSnapshotTool";
import { ReadingOfferCards } from "@/components/ReadingOfferCards";
import { CTASection } from "@/components/CTASection";
import { getBasicCheckoutUrl, getCompleteCheckoutUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Birth Chart Preview",
  description:
    "Begin a free birth chart preview with Sun, Moon, Rising, chart ruler, sect, and a traditional-first interpretation that points toward the full chart.",
};

const reasons = [
  {
    title: "It gives you a real opening",
    body: "Sun, Moon, Rising, chart ruler, and day or night chart can already feel personal when they are written as a reading, not as a list of keywords.",
  },
  {
    title: "It stays private",
    body: "The preview runs in your browser. It does not require an account, email signup, or a stored profile before you know whether the tone feels right.",
  },
  {
    title: "It leaves the deeper questions open",
    body: "A complete reading studies houses, rulers, aspects, condition, emphasis, and how the placements speak to each other instead of stopping at three signs.",
  },
];

export default function FreeBirthChartPage() {
  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
              Free birth chart preview
            </p>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
              Start with a first reading of your chart.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-ivory/68">
            Enter your birth details and receive a denser traditional-first
            preview: Sun, Moon, Rising, chart ruler, day or night chart, and an
            interpretation written to feel personal without pretending to be the
            complete map.
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
              The free preview is intentionally useful but incomplete. It should
              help you recognize the main doorway, then make the deeper question
              obvious: how do these placements connect inside the whole chart?
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
              Start with a clear $17 automated Essential reading delivered
              instantly by email, or choose the hand-prepared $97 Complete
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
        title="A free preview can name the doorway. A reading opens the room."
        body="Order the instant automated Essential reading, or compare it with the hand-prepared Complete option."
        buttonLabel="Get Instant Essential Reading"
        buttonHref={getBasicCheckoutUrl()}
        variant="gradient"
        analyticsLocation="free_chart_final_cta"
      />
    </>
  );
}
