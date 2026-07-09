import { siteConfig } from "@/lib/site";

export type ReadingTier = "basic" | "love" | "career" | "year-ahead" | "synastry" | "complete" | "kabbalah" | "dossier";

export const readingTiers: ReadingTier[] = [
  "basic",
  "love",
  "career",
  "year-ahead",
  "synastry",
  "complete",
  "kabbalah",
  "dossier",
];

export function isReadingTier(value: string | undefined): value is ReadingTier {
  return readingTiers.includes(value as ReadingTier);
}

export function getReadingOffer(tier: ReadingTier) {
  let product;
  let features: string[] = [];
  let priceId = "";

  switch (tier) {
    case "basic":
      product = siteConfig.product.basic;
      priceId = process.env.STRIPE_BASIC_PRICE_ID || "";
      features = [
        "Generated automatically from your birth date, exact time, and city",
        "Sun, Moon, Rising, chart ruler, and sect in context",
        "A first chart synthesis translated into practical English",
        "Instant delivery by email after payment",
        "An accessible first step, not a hand-prepared report",
      ];
      break;
    case "love":
      product = siteConfig.product.love;
      priceId = process.env.STRIPE_LOVE_PRICE_ID || "";
      features = [
        "Hand-prepared study of your Venus and 7th house",
        "Analysis of affective patterns and relationship needs",
        "Key aspects describing what you attract and how you love",
        "Practical synthesis for real-world relationship dynamics",
      ];
      break;
    case "career":
      product = siteConfig.product.career;
      priceId = process.env.STRIPE_CAREER_PRICE_ID || "";
      features = [
        "Hand-prepared study of your Midheaven, 6th, and 10th houses",
        "Analysis of vocational architecture and public direction",
        "Key aspects describing your relationship with resources and work",
        "Practical synthesis for career alignment and purpose",
      ];
      break;
    case "year-ahead":
      product = siteConfig.product.yearAhead;
      priceId = process.env.STRIPE_YEAR_AHEAD_PRICE_ID || "";
      features = [
        "Hand-prepared forecast mapping your upcoming 12 months",
        "Profection year and solar return analysis",
        "Major transits and periods of growth, pressure, and opportunity",
        "Practical timing guidance for important life decisions",
      ];
      break;
    case "synastry":
      product = siteConfig.product.synastry;
      priceId = process.env.STRIPE_SYNASTRY_PRICE_ID || "";
      features = [
        "Hand-prepared analysis of two interacting birth charts",
        "Study of how your temperaments and emotional needs blend",
        "Identification of inherent strengths and tensions in the dynamic",
        "A respectful, grounded look at the relationship's architecture",
      ];
      break;
    case "complete":
      product = siteConfig.product.complete;
      priceId = process.env.STRIPE_COMPLETE_PRICE_ID || "";
      features = [
        "Expanded hand-prepared traditional-first natal analysis",
        "House rulers, dignities, aspects, and chart emphasis",
        "Love, career, money, temperament, and vocation themes",
        "Prioritized integration notes and next-step guidance",
      ];
      break;
    case "kabbalah":
      product = siteConfig.product.kabbalah;
      priceId = process.env.STRIPE_KABBALAH_PRICE_ID || "";
      features = [
        "Mapping of your personal Shem HaMephorash angels",
        "Tree of Life (Sephirot) pathworking based on your chart",
        "Specific psalms and invocation practices for your natal decans",
        "Hand-prepared esoteric synthesis of your spiritual architecture",
      ];
      break;
    case "dossier":
      product = siteConfig.product.dossier;
      priceId = process.env.STRIPE_DOSSIER_PRICE_ID || "";
      features = [
        "Our highest level of synthesis and premium integration",
        "Complete Natal Reading with structural chart analysis",
        "Deep thematic studies of Love and Vocation patterns",
        "12-month Transit Forecast for current timing",
        "Beautifully bound digital volume delivered in 10 days",
      ];
      break;
  }

  return {
    tier,
    product,
    checkoutPath: `/checkout/${tier}`,
    priceId,
    features,
  };
}
