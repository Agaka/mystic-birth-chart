import { siteConfig } from "@/lib/site";

export type ReadingTier = "basic" | "complete";

export const readingTiers: ReadingTier[] = ["basic", "complete"];

export function isReadingTier(value: string | undefined): value is ReadingTier {
  return value === "basic" || value === "complete";
}

export function getReadingOffer(tier: ReadingTier) {
  const isBasic = tier === "basic";
  const product = isBasic ? siteConfig.product.basic : siteConfig.product.complete;

  return {
    tier,
    product,
    checkoutPath: `/checkout/${tier}`,
    priceId:
      tier === "basic"
        ? process.env.STRIPE_BASIC_PRICE_ID
        : process.env.STRIPE_COMPLETE_PRICE_ID,
    features: isBasic
      ? [
          "Generated automatically from your birth date, exact time, and city",
          "Sun, Moon, Rising, chart ruler, and sect in context",
          "A first chart synthesis translated into practical English",
          "Instant delivery by email after payment",
          "An accessible first step, not a hand-prepared report",
        ]
      : [
          "Expanded hand-prepared traditional-first natal analysis",
          "House rulers, dignities, aspects, and chart emphasis",
          "Love, career, money, temperament, and vocation themes",
          "Prioritized integration notes and next-step guidance",
        ],
  };
}
