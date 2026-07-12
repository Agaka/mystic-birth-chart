import Link from "next/link";
import { Button } from "@/components/Button";
import {
  getBasicCheckoutUrl,
  getCompleteCheckoutUrl,
  siteConfig,
} from "@/lib/site";

const comparisonRows = [
  ["Process", "Generated automatically", "Individually analyzed and prepared"],
  ["Delivery", "Instant email", "Written PDF within 72 hours"],
  ["Depth", "Foundational first synthesis", "Complete traditional-first synthesis"],
  ["Core scope", "Sun, Moon, Rising, chart ruler, sect", "Rulers, houses, condition, aspects, life areas, integration"],
  ["Price", siteConfig.product.basic.price, siteConfig.product.complete.price],
] as const;

export function PrimaryReadingComparison({
  showFocusedLink = true,
}: {
  showFocusedLink?: boolean;
}) {
  return (
    <div className="overflow-hidden border border-gold/35 bg-[#ead9bb] shadow-[0_22px_65px_rgba(0,0,0,0.22)]">
      <div className="grid md:grid-cols-2">
        <article className="border-b border-gold/30 bg-[linear-gradient(145deg,#f4ead7_0%,#e8d4b2_100%)] p-6 md:border-b-0 md:border-r md:p-8">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-[#815c20]">
            Automated first synthesis
          </p>
          <h3 className="mt-3 font-heading text-3xl font-semibold text-aubergine">
            {siteConfig.product.basic.name}
          </h3>
          <p className="mt-3 font-ui text-4xl font-bold text-ink">
            {siteConfig.product.basic.price}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink/78">
            {siteConfig.product.basic.summary}
          </p>
          <div className="mt-7">
            <Button
              href={getBasicCheckoutUrl()}
              size="md"
              className="w-full"
              analytics={{
                event: "essential_reading_cta",
                params: {
                  product_id: "basic",
                  product_category: "natal-reading",
                  cta_location: "primary_reading_comparison",
                },
              }}
            >
              Get Essential Reading - $17
            </Button>
          </div>
          <p className="mt-4 text-center font-ui text-xs uppercase tracking-[0.1em] text-ink/62">
            Automated. Instant email. No subscription.
          </p>
        </article>

        <article className="bg-aubergine p-6 text-ivory md:p-8">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold-light/80">
            Individually reviewed depth
          </p>
          <h3 className="mt-3 font-heading text-3xl font-semibold text-ivory">
            {siteConfig.product.complete.name}
          </h3>
          <p className="mt-3 font-ui text-4xl font-bold text-gold-light">
            {siteConfig.product.complete.price}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ivory/75">
            {siteConfig.product.complete.summary}
          </p>
          <div className="mt-7">
            <Button
              href={getCompleteCheckoutUrl()}
              size="md"
              className="w-full"
              analytics={{
                event: "complete_reading_cta",
                params: {
                  product_id: "complete",
                  product_category: "natal-reading",
                  cta_location: "primary_reading_comparison",
                },
              }}
            >
              Get Complete Reading - $97
            </Button>
          </div>
          <p className="mt-4 text-center font-ui text-xs uppercase tracking-[0.1em] text-ivory/52">
            Hand-prepared PDF. Individually reviewed.
          </p>
        </article>
      </div>

      <dl className="divide-y divide-[#8b672d]/20 border-t border-[#8b672d]/25 bg-[#efe1c8]">
        {comparisonRows.map(([label, essential, complete]) => (
          <div
            key={label}
            className="grid gap-2 px-5 py-4 text-sm odd:bg-[#f5ead6]/55 sm:grid-cols-[0.7fr_1fr_1fr] sm:items-start sm:gap-5 md:px-8"
          >
            <dt className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#755827]">
              {label}
            </dt>
            <dd className="text-ink/78">{essential}</dd>
            <dd className="font-semibold text-aubergine">{complete}</dd>
          </div>
        ))}
      </dl>

      {showFocusedLink && (
        <div className="border-t border-[#8b672d]/25 bg-[#e6d0aa] px-6 py-5 text-center">
          <Link
            href="/birth-chart-report#focused-readings"
            className="inline-flex min-h-11 items-center font-ui text-sm font-semibold text-aubergine underline decoration-gold/55 underline-offset-4 transition-colors hover:text-gold-dark"
          >
            Explore focused readings
          </Link>
        </div>
      )}
    </div>
  );
}
