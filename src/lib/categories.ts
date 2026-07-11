export interface Category {
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export const categories: Category[] = [
  {
    name: "Chart Basics",
    slug: "chart-basics",
    description:
      "Signs, planets, houses, rulers, and the grammar that makes a chart readable.",
    icon: "I",
  },
  {
    name: "Moon & Emotions",
    slug: "moon-emotions",
    description:
      "The Moon, temperament, instinct, memory, and the patterns we return to under pressure.",
    icon: "II",
  },
  {
    name: "Love & Venus",
    slug: "love-venus",
    description:
      "Venus, relationship style, desire for harmony, pleasure, money, and self-worth.",
    icon: "III",
  },
  {
    name: "Career & Purpose",
    slug: "career-purpose",
    description:
      "The Midheaven, 10th house, vocation, visibility, and the work that gives shape to a life.",
    icon: "IV",
  },
  {
    name: "Saturn & Growth",
    slug: "saturn-growth",
    description:
      "Saturn, discipline, fear, mastery, time, and the slow formation of real authority.",
    icon: "V",
  },
  {
    name: "Deep Chart Patterns",
    slug: "deep-chart-patterns",
    description:
      "Aspects, sect, chart emphasis, rulers, nodes, and the structure behind the whole chart.",
    icon: "VI",
  },
  {
    name: "Hermetic Astrology",
    slug: "hermetic-astrology",
    description:
      "Decans, planetary spirits, Hermetic Qabalah, and magical practice only where they are rooted in astrology.",
    icon: "VII",
  },
  {
    name: "The 12 Houses",
    slug: "the-12-houses",
    description:
      "The terrestrial sectors of life, resources, relationships, and hidden places according to Hellenistic tradition.",
    icon: "VIII",
  },
  {
    name: "Predictive Astrology",
    slug: "predictive-astrology",
    description:
      "Time lords, profections, transits, and techniques for mapping the timing of fate.",
    icon: "IX",
  },
  {
    name: "Planetary Magic & Timing",
    slug: "planetary-magic-timing",
    description:
      "Planetary hours, electional astrology, talismans, and practical working with celestial mechanics.",
    icon: "X",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string): string {
  return getCategoryBySlug(slug)?.name || slug;
}
