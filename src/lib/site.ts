export const siteConfig = {
  name: "Mystic Birth Chart",
  tagline: "Traditional astrology readings for modern questions.",
  description:
    "Premium English-language birth chart readings grounded in traditional astrology, practical synthesis, and clear written guidance.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://mysticbirthchart.com",
  author: "Mystic Birth Chart",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@mysticbirthchart.com",
  capacity: "5 hand-prepared Complete readings available per day",
  product: {
    basic: {
      name: "Essential Birth Chart Reading",
      price: "$17",
      priceNote: "Automated reading",
      delivery: "Delivered instantly by email",
      format: "Automated email reading",
      summary:
        "An accessible automated first synthesis generated from your birth data, written to go beyond the free preview.",
      disclosure: "Generated automatically, not hand-prepared.",
    },
    complete: {
      name: "Complete Natal Reading",
      price: "$97",
      priceNote: "Hand-prepared",
      delivery: "Hand-prepared and delivered within 72 hours",
      format: "Expanded hand-prepared PDF report",
      summary:
        "A deeper synthesis of houses, rulers, aspects, timing themes, and practical life direction.",
      disclosure: "Prepared by hand in a limited daily queue.",
    },
  },
  cta: {
    primary: "Get Instant Essential Reading",
    secondary: "Read the Blog",
    midArticle: "Get Instant Essential Reading",
    finalArticle: "Get Instant Essential Reading",
    social: 'Comment CHART to get the reading details.',
  },
  disclaimer:
    "Mystic Birth Chart readings are for self-reflection and educational purposes only. They do not provide medical, legal, financial, psychological, or guaranteed predictive advice.",
  nav: {
    header: [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Free Chart", href: "/free-birth-chart" },
      { label: "Readings", href: "/birth-chart-report" },
      { label: "Sample Reading", href: "/sample-report" },
      { label: "About", href: "/about" },
    ],
    categories: [
      { label: "Chart Basics", href: "/blog/category/chart-basics" },
      { label: "Moon & Emotions", href: "/blog/category/moon-emotions" },
      { label: "Love & Venus", href: "/blog/category/love-venus" },
      { label: "Career & Purpose", href: "/blog/category/career-purpose" },
      { label: "Saturn & Growth", href: "/blog/category/saturn-growth" },
      { label: "Deep Chart Patterns", href: "/blog/category/deep-chart-patterns" },
      { label: "Hermetic Astrology", href: "/blog/category/hermetic-astrology" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
} as const;

export function getCheckoutUrl(): string {
  return getBasicCheckoutUrl();
}

export function getBasicCheckoutUrl(): string {
  return "/checkout/basic";
}

export function getCompleteCheckoutUrl(): string {
  return "/checkout/complete";
}

export function getFormUrl(): string {
  return process.env.NEXT_PUBLIC_BIRTH_DETAILS_FORM_URL || "";
}
