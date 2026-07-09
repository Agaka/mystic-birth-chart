import { Button } from "@/components/Button";
import {
  getBasicCheckoutUrl,
  getCompleteCheckoutUrl,
  siteConfig,
} from "@/lib/site";

const offers = [
  {
    id: "basic-reading",
    product: siteConfig.product.basic,
    badge: "Instant automated reading",
    cta: "Get Instant Essential Reading",
    href: getBasicCheckoutUrl(),
    features: [
      "Generated automatically from your birth date, exact time, and city",
      "Sun, Moon, Rising, chart ruler, and sect in context",
      "A first chart synthesis translated into practical English",
      "Delivered instantly by email, not hand-prepared",
    ],
  },
  {
    id: "complete-reading",
    product: siteConfig.product.complete,
    badge: "Best for depth",
    cta: "Order Complete Reading",
    href: getCompleteCheckoutUrl(),
    featured: true,
    features: [
      "Expanded hand-prepared traditional-first natal analysis",
      "House rulers, dignities, aspects, and chart emphasis",
      "Love, career, money, temperament, and vocation themes",
      "Prioritized integration notes and next-step guidance",
    ],
  },
];

export function ReadingOfferCards() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {offers.map((offer) => (
        <article
          id={offer.id}
          key={offer.id}
          className={`relative border p-6 md:p-8 ${
            offer.featured
              ? "parchment-surface border-gold/45 text-ink shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
              : "wood-grain border-gold/30 text-ivory shadow-[0_18px_55px_rgba(0,0,0,0.24)]"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p
                className={`font-ui text-xs font-semibold uppercase tracking-[0.18em] ${
                  offer.featured ? "text-aubergine/75" : "text-gold-light"
                }`}
              >
                {offer.badge}
              </p>
              <h3 className="mt-3 font-heading text-3xl font-semibold leading-tight">
                {offer.product.name}
              </h3>
            </div>
            <div className="sm:text-right">
              <div className="font-ui text-4xl font-bold tracking-tight">
                {offer.product.price}
              </div>
              <div
                className={`mt-1 font-ui text-xs uppercase tracking-[0.16em] ${
                  offer.featured ? "text-ink/58" : "text-ivory/72"
                }`}
              >
                {offer.product.priceNote}
              </div>
            </div>
          </div>

          <p
            className={`mt-5 text-base leading-relaxed ${
              offer.featured ? "text-ink/72" : "text-ivory/84"
            }`}
          >
            {offer.product.summary}
          </p>

          <ul className="mt-6 space-y-3">
            {offer.features.map((feature) => (
              <li key={feature} className="flex gap-3">
                <span
                  className={offer.featured ? "text-aubergine" : "text-gold-light"}
                  aria-hidden="true"
                >
                  +
                </span>
                <span
                  className={`text-sm leading-relaxed ${
                    offer.featured ? "text-ink/74" : "text-ivory/88"
                  }`}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <Button
              href={offer.href}
              size="lg"
              variant="primary"
              className="w-full"
              analytics={{
                event: "reading_offer_click",
                params: {
                  offer_id: offer.id,
                  offer_name: offer.product.name,
                  offer_price: offer.product.price,
                  cta_location: "reading_offer_cards",
                },
              }}
            >
              {offer.cta}
            </Button>
          </div>

          <p
            className={`mt-4 text-center font-ui text-xs ${
              offer.featured ? "text-ink/58" : "text-ivory/64"
            }`}
          >
            {offer.product.delivery}.{" "}
            {offer.featured ? siteConfig.capacity : offer.product.disclosure}
          </p>
        </article>
      ))}
    </div>
  );
}
