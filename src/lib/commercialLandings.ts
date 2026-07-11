import type { ReadingTier } from "@/lib/orders";

export interface CommercialLandingConfig {
  tier: ReadingTier;
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  question: string;
  excerpt: string;
  relatedSlugs: string[];
}

export const commercialLandings = {
  complete: {
    tier: "complete",
    path: "/complete-natal-chart-reading",
    title: "Complete Natal Chart Reading",
    description:
      "Order an individually analyzed and prepared Complete Natal Reading with traditional-first houses, rulers, aspects, condition, and practical synthesis.",
    eyebrow: "Complete birth chart interpretation",
    headline: "A complete natal chart reading built around what matters most.",
    intro:
      "For readers who already know their placements but still cannot see how the chart fits together. The Complete reading is individually analyzed, written, reviewed, and refined before delivery.",
    question: "What if the placement descriptions are accurate, but the whole chart still feels fragmented?",
    excerpt:
      "The reading begins with the Ascendant, chart ruler, sect, angularity, and the testimonies that repeat. Love, work, money, temperament, and direction are then interpreted as connected parts of that same structure.",
    relatedSlugs: [
      "what-is-a-birth-chart-reading",
      "the-old-study-method-birth-chart-reading",
      "personalized-birth-chart-reading-vs-automated-report",
    ],
  },
  love: {
    tier: "love",
    path: "/love-astrology-reading",
    title: "Love Astrology Reading",
    description:
      "A hand-prepared love astrology reading of Venus, the 7th house, relationship rulers, emotional needs, attraction, and recurring partnership patterns.",
    eyebrow: "Love and relationship patterns",
    headline: "A love astrology reading that goes beyond your Venus sign.",
    intro:
      "For people who keep meeting the same emotional or relational pattern and want to understand what the natal chart is repeating through attraction, trust, conflict, and reciprocity.",
    question: "Why do different relationships keep returning you to the same question?",
    excerpt:
      "Venus describes desire and value, but the relationship story also involves the Moon, Mars, the 7th house, its ruler, and the aspects connecting them. The reading weighs those testimonies together.",
    relatedSlugs: [
      "love-astrology-beyond-compatibility",
      "venus-sign-vs-venus-house",
      "seventh-house-relationships",
    ],
  },
  career: {
    tier: "career",
    path: "/career-astrology-reading",
    title: "Career Astrology Reading",
    description:
      "A hand-prepared career astrology reading of the Midheaven, 10th, 6th, and 2nd houses, their rulers, visibility, resources, and vocation.",
    eyebrow: "Career and vocation",
    headline: "A career astrology reading for direction, work, and earned authority.",
    intro:
      "For people deciding what kind of work can hold their abilities, values, public role, resources, and long-term sense of direction.",
    question: "What kind of work lets your chart become more coherent instead of merely busy?",
    excerpt:
      "Career is not reduced to one Midheaven sign. The reading connects the 10th house, its ruler, the 6th and 2nd houses, Saturn, Mars, and the chart ruler to distinguish visibility from vocation.",
    relatedSlugs: [
      "career-astrology-birth-chart",
      "the-10th-house-and-midheaven",
      "second-house-money-astrology",
    ],
  },
  yearAhead: {
    tier: "year-ahead",
    path: "/year-ahead-astrology-reading",
    title: "Year Ahead Astrology Reading",
    description:
      "A hand-prepared 12-month astrology reading using profections, solar return themes, and major transits to clarify the current year.",
    eyebrow: "Current timing",
    headline: "A year-ahead astrology reading grounded in your natal chart.",
    intro:
      "For people who want the current phase placed in context before treating every transit as equally important.",
    question: "Which periods of the next twelve months deserve preparation, patience, or deliberate action?",
    excerpt:
      "The forecast begins with the natal chart and annual time lord, then compares solar return themes and major transits. The goal is a usable sequence of emphasis, not a list of daily predictions.",
    relatedSlugs: [
      "day-chart-vs-night-chart",
      "saturn-return-meaning",
      "astrology-reading-questions-to-ask",
    ],
  },
  synastry: {
    tier: "synastry",
    path: "/synastry-compatibility-reading",
    title: "Synastry Compatibility Reading",
    description:
      "A hand-prepared synastry reading of two natal charts, including emotional needs, attraction, communication, strengths, tensions, and relationship dynamics.",
    eyebrow: "Two-chart relationship study",
    headline: "A synastry compatibility reading that respects both complete charts.",
    intro:
      "For couples or close relationships that need more than sign matching. The reading studies how two chart structures meet, support, activate, and challenge one another.",
    question: "What belongs to each person, and what only appears when the two charts meet?",
    excerpt:
      "Synastry compares both natal foundations before interpreting contacts between them. Attraction, communication, emotional rhythm, pressure, and durability are described without guaranteeing a relationship outcome.",
    relatedSlugs: [
      "love-astrology-beyond-compatibility",
      "seventh-house-relationships",
      "venus-is-not-just-love",
    ],
  },
} satisfies Record<string, CommercialLandingConfig>;
