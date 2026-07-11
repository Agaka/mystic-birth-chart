import type { Metadata } from "next";
import { AnalyticsEvent } from "@/components/AnalyticsEvent";
import { Button } from "@/components/Button";
import { SampleReportPreview } from "@/components/SampleReportPreview";
import { createPageMetadata } from "@/lib/metadata";
import {
  getBasicCheckoutUrl,
  getCompleteCheckoutUrl,
  siteConfig,
} from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: "Sample Natal Chart Reading",
  description:
    "Preview the tone and structure of a fictional Complete Natal Reading before ordering an individually prepared chart report.",
  path: "/sample-report",
});

export default function SampleReportPage() {
  return (
    <>
      <AnalyticsEvent
        name="sample_report_viewed"
        params={{ funnel_step: "commercial-investigation" }}
      />
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
            Sample dossier
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            Preview the reading before you order.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ivory/58">
            This fictional example is not a client testimonial. It demonstrates
            the tone and structure of the individually prepared Complete Natal Reading.
          </p>
        </div>
      </section>

      <section className="bg-midnight py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <SampleReportPreview />
        </div>
      </section>

      <section className="parchment-surface py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-3xl font-semibold text-aubergine md:text-5xl">
            Ready for your own chart table?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink/62">
            Start with the {siteConfig.product.basic.price} automated Essential
            Reading for instant email delivery, or upgrade to the{" "}
            {siteConfig.product.complete.price} hand-prepared Complete Reading
            for deeper chart synthesis.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              href={getBasicCheckoutUrl()}
              size="lg"
              analytics={{
                event: "essential_reading_cta",
                params: {
                  product_id: "basic",
                  product_category: "natal-reading",
                  cta_location: "sample_report_page",
                },
              }}
            >
              Get Instant Essential Reading
            </Button>
            <Button
              href={getCompleteCheckoutUrl()}
              variant="secondary"
              size="lg"
              className="border-ink/25 text-ink hover:border-gold hover:bg-gold/10 hover:text-aubergine"
              analytics={{
                event: "complete_reading_cta",
                params: {
                  product_id: "complete",
                  product_category: "natal-reading",
                  cta_location: "sample_report_page",
                },
              }}
            >
              Get Complete Reading - $97
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
