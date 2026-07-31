import type { Metadata } from "next";
import { AnalyticsEvent } from "@/components/AnalyticsEvent";
import { Button } from "@/components/Button";
import { SampleReportPreview, type SampleReadingKind } from "@/components/SampleReportPreview";
import { createPageMetadata } from "@/lib/metadata";
import { getBasicCheckoutUrl, getCompleteCheckoutUrl } from "@/lib/site";

const samples: Array<{
  id: SampleReadingKind;
  label: string;
  title: string;
  body: string;
  action: string;
  href: string;
  primary?: boolean;
}> = [
  {
    id: "essential",
    label: "Automated / Instant email",
    title: "Essential Birth Chart Reading",
    body:
      "See the focused first synthesis: the chart's central sentence, its three dominant testimonies, and a clear explanation of why the free preview is only the doorway.",
    action: "Get Essential Reading - $17",
    href: getBasicCheckoutUrl(),
    primary: true,
  },
  {
    id: "complete",
    label: "Individually prepared / PDF",
    title: "Complete Natal Reading",
    body:
      "See how a fuller natal study ranks the chart's evidence before applying it to relationships, work, money, and practical direction.",
    action: "Get Complete Reading - $97",
    href: getCompleteCheckoutUrl(),
  },
  {
    id: "kabbalah",
    label: "Specialized esoteric study",
    title: "Hermetic Kabbalah Reading",
    body:
      "See how a chart-led Hermetic practice is approached with reviewed correspondences, practical restraint, and no invented promises.",
    action: "Explore Hermetic Kabbalah Reading - $149",
    href: "/checkout/kabbalah",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "Sample Astrology Readings",
  description:
    "Explore editorial samples of Mystic Birth Chart's Essential Birth Chart Reading, Complete Natal Reading, and Hermetic Kabbalah Reading before ordering.",
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
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold/75">
            The reading room
          </p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
            See the reading before you order it.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ivory/68">
            Three editorial demonstrations, each showing a different depth of study.
            They are fictional by design, so you can judge the method and writing without
            mistaking a private client&apos;s story for proof.
          </p>
          <nav className="mt-9 flex flex-col justify-center gap-3 sm:flex-row" aria-label="Sample readings">
            {samples.map((sample) => (
              <Button key={sample.id} href={`#${sample.id}`} size="sm" variant="secondary">
                {sample.title}
              </Button>
            ))}
          </nav>
        </div>
      </section>

      {samples.map((sample, index) => (
        <section
          id={sample.id}
          key={sample.id}
          className={`${index % 2 === 0 ? "bg-midnight" : "reading-area"} scroll-mt-24 py-16 md:py-24`}
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className={index % 2 === 0 ? "text-ivory" : "text-ink"}>
              <p className={`font-ui text-xs font-semibold uppercase tracking-[0.22em] ${index % 2 === 0 ? "text-gold/75" : "text-gold-dark/80"}`}>
                {sample.label}
              </p>
              <h2 className={`mt-4 font-heading text-4xl font-semibold leading-tight md:text-5xl ${index % 2 === 0 ? "text-ivory" : "text-aubergine"}`}>
                {sample.title}
              </h2>
              <p className={`mt-6 text-lg leading-relaxed ${index % 2 === 0 ? "text-ivory/68" : "text-ink/65"}`}>
                {sample.body}
              </p>
              <Button
                href={sample.href}
                size="lg"
                variant={sample.primary || index % 2 !== 0 ? "primary" : "secondary"}
                className="mt-8"
                analytics={{
                  event: "sample_reading_cta",
                  params: {
                    product_id: sample.id === "essential" ? "basic" : sample.id,
                    product_category: "reading",
                    cta_location: `sample_${sample.id}`,
                  },
                }}
              >
                {sample.action}
              </Button>
              <p className={`mt-5 font-ui text-xs leading-relaxed ${index % 2 === 0 ? "text-ivory/46" : "text-ink/48"}`}>
                These samples show the report&apos;s voice and architecture. The final emphasis always depends on the submitted chart.
              </p>
            </div>
            <SampleReportPreview kind={sample.id} />
          </div>
        </section>
      ))}
    </>
  );
}
