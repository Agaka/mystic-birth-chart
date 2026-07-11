import { Button } from "@/components/Button";
import { getReadingOffer } from "@/lib/orders";

const offers = [
  {
    category: "Start with my whole chart",
    description: "Choose the depth of synthesis before narrowing the question.",
    items: [
      {
        id: "basic",
        offer: getReadingOffer("basic"),
        featured: false,
      },
      {
        id: "complete",
        offer: getReadingOffer("complete"),
        featured: true,
      },
      {
        id: "dossier",
        offer: getReadingOffer("dossier"),
        featured: true,
        premium: true,
      },
    ],
  },
  {
    category: "Love and relationships",
    description: "Focused natal relationship patterns in your own chart.",
    items: [
      {
        id: "love",
        offer: getReadingOffer("love"),
        featured: false,
      },
    ],
  },
  {
    category: "Career and vocation",
    description: "Work, visibility, authority, resources, and public direction.",
    items: [
      {
        id: "career",
        offer: getReadingOffer("career"),
        featured: false,
      },
    ],
  },
  {
    category: "Current timing",
    description: "The year ahead and an ongoing rhythm for current transits.",
    items: [
      {
        id: "year-ahead",
        offer: getReadingOffer("year-ahead"),
        featured: false,
      },
      {
        id: "almanac",
        offer: getReadingOffer("almanac"),
        featured: true,
      },
    ],
  },
  {
    category: "Compatibility",
    description: "A dual-chart study of relationship dynamics.",
    items: [
      {
        id: "synastry",
        offer: getReadingOffer("synastry"),
        featured: true,
      },
    ],
  },
  {
    category: "Esoteric practice",
    description: "Specialized chart-led Hermetic and Kabbalistic work.",
    items: [
      {
        id: "kabbalah",
        offer: getReadingOffer("kabbalah"),
        featured: true,
      },
    ],
  },
];

export function ReadingOfferCards() {
  return (
    <div id="focused-readings" className="flex scroll-mt-28 flex-col gap-12">
      {offers.map((group) => (
        <section key={group.category}>
          <div className="mb-6 border-b border-gold/15 pb-4">
            <h3 className="font-heading text-2xl font-semibold text-aubergine md:text-3xl">
              {group.category}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/68">
              {group.description}
            </p>
          </div>

          <div
            className={`grid grid-cols-1 gap-5 ${
              group.items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
            }`}
          >
            {group.items.map(({ id, offer, featured, premium }) => (
              <article
                id={`offer-${id}`}
                key={id}
                className={`relative border p-6 md:p-8 ${
                  premium
                    ? "border-gold/60 bg-ink text-ivory shadow-[0_22px_70px_rgba(184,138,58,0.18)]"
                    : featured
                    ? "parchment-surface border-gold/45 text-ink shadow-[0_18px_60px_rgba(0,0,0,0.15)]"
                    : "bg-white/45 border-ink/10 text-ink shadow-sm"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p
                      className={`font-ui text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${
                        premium
                          ? "text-gold"
                          : featured
                          ? "text-aubergine/75"
                          : "text-ink/50"
                      }`}
                    >
                      {offer.product.priceNote}
                    </p>
                    <h4 className={`mt-2 font-heading text-2xl font-semibold leading-tight ${premium ? "text-ivory" : "text-aubergine"}`}>
                      {offer.product.name}
                    </h4>
                  </div>
                  <div className="sm:text-right">
                    <div className={`font-ui text-3xl font-bold tracking-tight ${premium ? "text-gold-light" : "text-ink"}`}>
                      {offer.product.price}
                    </div>
                  </div>
                </div>

                <p
                  className={`mt-4 text-sm leading-relaxed ${
                    premium ? "text-ivory/84" : featured ? "text-ink/72" : "text-ink/68"
                  }`}
                >
                  {offer.product.summary}
                </p>

                <ul className="mt-5 space-y-2">
                  {offer.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span
                        className={premium ? "text-gold-light" : featured ? "text-aubergine" : "text-gold-dark"}
                        aria-hidden="true"
                      >
                        +
                      </span>
                      <span
                        className={`text-sm leading-relaxed ${
                          premium ? "text-ivory/88" : featured ? "text-ink/74" : "text-ink/68"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  <Button
                    href={offer.checkoutPath}
                    size="md"
                    variant={premium || featured ? "primary" : "secondary"}
                    className="w-full"
                    analytics={{
                      event: "select_item",
                      params: {
                        product_id: id,
                        product_category: "reading",
                        cta_location: "reading_offer_cards",
                      },
                    }}
                  >
                    {offer.isSubscription ? `Subscribe to ${offer.product.name}` : `Secure ${offer.product.name}`}
                  </Button>
                </div>

                <p
                  className={`mt-4 text-center font-ui text-[0.65rem] uppercase tracking-[0.08em] ${
                    premium ? "text-ivory/50" : "text-ink/48"
                  }`}
                >
                  {offer.product.delivery}. {offer.product.disclosure}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
