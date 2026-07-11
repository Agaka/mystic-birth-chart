import { Button } from "@/components/Button";
import { getBasicCheckoutUrl, siteConfig } from "@/lib/site";

interface ProductCTAProps {
  compact?: boolean;
}

export function ProductCTA({ compact = false }: ProductCTAProps) {
  if (compact) {
    return (
      <div className="wood-grain border border-gold/24 p-6 text-center">
        <p className="font-heading text-lg text-ivory/80 italic">
          The article explains the symbol. Your chart decides how personal it is.
        </p>
        <p className="mt-3 text-sm text-ivory/72">
          Start with the {siteConfig.product.basic.price} automated Essential
          Reading for an instant first synthesis, then upgrade later if you want
          the whole chart prepared by hand.
        </p>
        <div className="mt-5">
          <Button
            href={getBasicCheckoutUrl()}
            size="sm"
            analytics={{
              event: "cta_click",
              params: {
                cta_location: "mid_article_cta",
                product_id: "basic",
                product_category: "reading",
              },
            }}
          >
            Get Instant Essential Reading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="wood-grain border border-gold/22 p-8 text-center md:p-10">
      <div className="mb-4 font-ui text-sm uppercase tracking-widest text-gold-light">
        Personalized natal reading
      </div>
      <h3 className="font-heading text-2xl md:text-3xl font-medium text-ivory">
        Want your own chart interpreted as a whole?
      </h3>
      <p className="mx-auto mt-4 max-w-lg leading-relaxed text-ivory/72">
        A single placement can reveal a clue. A full reading shows how the
        pattern connects across houses, rulers, aspects, purpose, relationships,
        and timing themes. Essential automated readings start at{" "}
        {siteConfig.product.basic.price}.
      </p>
      <div className="mt-8">
        <Button
          href="/birth-chart-report"
          size="lg"
          analytics={{
            event: "cta_click",
            params: {
              cta_location: "product_cta",
            },
          }}
        >
          Compare Reading Options
        </Button>
      </div>
    </div>
  );
}
