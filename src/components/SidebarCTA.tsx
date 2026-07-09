import { Button } from "@/components/Button";
import { getBasicCheckoutUrl, siteConfig } from "@/lib/site";

export function SidebarCTA() {
  return (
    <aside className="wood-grain sticky top-24 border border-gold/24 p-6 shadow-[0_16px_38px_rgba(0,0,0,0.22)]">
      <div className="mb-3 font-ui text-xs uppercase tracking-widest text-gold/55">
        Instant first reading
      </div>
      <h4 className="font-heading text-2xl font-semibold leading-tight text-ivory">
        Have your chart read as a whole.
      </h4>
      <p className="mt-3 text-sm leading-relaxed text-ivory/72">
        Start with an automated Essential Reading generated from your birth
        date, exact time, city, and chosen focus.
      </p>
      <div className="mt-5">
        <Button
          href={getBasicCheckoutUrl()}
          size="sm"
          className="w-full"
          analytics={{
            event: "cta_click",
            params: {
              cta_label: `Start at ${siteConfig.product.basic.price}`,
              cta_location: "blog_sidebar",
              offer_tier: "basic",
            },
          }}
        >
          Start at {siteConfig.product.basic.price}
        </Button>
      </div>
      <p className="mt-3 text-center font-ui text-xs text-ivory/35">
        Instant email delivery. Complete readings are hand-prepared.
      </p>
    </aside>
  );
}
