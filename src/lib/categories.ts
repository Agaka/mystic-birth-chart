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
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryName(slug: string): string {
  return getCategoryBySlug(slug)?.name || slug;
}
