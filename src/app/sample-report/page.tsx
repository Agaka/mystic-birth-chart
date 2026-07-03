import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SampleReportPreview } from "@/components/SampleReportPreview";
import { getBasicCheckoutUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sample Natal Chart Reading",
  description:
    "Preview the tone, structure, and format of a Mystic Birth Chart natal reading before ordering.",
};

export default function SampleReportPage() {
  return (
    <>
      <section className="wood-panel py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/70">
            Sample dossier
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            Preview the reading before you order.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ivory/58">
            This sample uses fictional birth data. Your reading will be written
            from your own chart and chosen focus area.
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
            Start with the {siteConfig.product.basic.price} Basic Reading or
            upgrade to the {siteConfig.product.complete.price} Complete Reading
            for deeper chart synthesis.
          </p>
          <div className="mt-10">
            <Button
              href={getBasicCheckoutUrl()}
              size="lg"
              analytics={{
                event: "cta_click",
                params: {
                  cta_label: "Order a Reading",
                  cta_location: "sample_report_page",
                  offer_tier: "basic",
                },
              }}
            >
              Order a Reading
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
