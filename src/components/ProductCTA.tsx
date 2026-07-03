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
          This is one placement. Your full chart shows the pattern behind it.
        </p>
        <p className="mt-3 text-sm text-ivory/72">
          Order a written natal reading that connects your planets, houses,
          rulers, aspects, and life themes into one clear story.
        </p>
        <div className="mt-5">
          <Button
            href={getBasicCheckoutUrl()}
            size="sm"
            analytics={{
              event: "cta_click",
              params: {
                cta_label: "Get My Chart Reading",
                cta_location: "mid_article_cta",
                offer_tier: "basic",
              },
            }}
          >
            Get My Chart Reading
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
        and timing themes. Basic readings start at {siteConfig.product.basic.price}.
      </p>
      <div className="mt-8">
        <Button
          href="/birth-chart-report"
          size="lg"
          analytics={{
            event: "cta_click",
            params: {
              cta_label: "Compare Reading Options",
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
