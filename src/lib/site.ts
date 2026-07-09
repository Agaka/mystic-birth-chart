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
    love: {
      name: "Love & Relationship Pattern",
      price: "$49",
      priceNote: "Hand-prepared study",
      delivery: "Hand-prepared and delivered within 72 hours",
      format: "Written PDF study",
      summary:
        "A focused study of your affective signatures: Venus, the 7th house, and the aspects that describe what you attract, what you need, and where you face friction in partnerships.",
      disclosure: "Prepared by hand in a limited daily queue.",
    },
    career: {
      name: "Career & Vocation",
      price: "$49",
      priceNote: "Hand-prepared study",
      delivery: "Hand-prepared and delivered within 72 hours",
      format: "Written PDF study",
      summary:
        "A focused reading of your vocational architecture: Midheaven, the 6th and 10th houses, and the rulers that describe your public direction, resources, and sense of purpose.",
      disclosure: "Prepared by hand in a limited daily queue.",
    },
    yearAhead: {
      name: "12-Month Transit Forecast",
      price: "$59",
      priceNote: "Hand-prepared forecast",
      delivery: "Hand-prepared and delivered within 72 hours",
      format: "Written PDF forecast",
      summary:
        "A practical map of your upcoming year. We look at profections, solar returns, and major transits to identify periods of growth, pressure, and opportunity.",
      disclosure: "Prepared by hand in a limited daily queue.",
    },
    synastry: {
      name: "Synastry & Compatibility",
      price: "$79",
      priceNote: "Dual-chart reading",
      delivery: "Hand-prepared and delivered within 7 days",
      format: "Expanded written PDF",
      summary:
        "An in-depth study of the interaction between two charts. We examine how your temperaments blend, where your lives intersect, and the inherent strengths and tensions of the dynamic.",
      disclosure: "Requires birth data for two individuals. Prepared by hand.",
    },
    almanac: {
      name: "The Hermetic Almanac",
      price: "$14 / month",
      priceNote: "Monthly recurring subscription",
      delivery: "Delivered monthly to your inbox",
      format: "Monthly personalized workbook",
      summary:
        "An ongoing subscription focused on your specific transits. Includes a monthly forecast tailored to your Ascendant, magical election windows for important tasks, and focused Hermetic practice based on the current sky.",
      disclosure: "Cancel anytime. Prepared in rhythm with the celestial month.",
    },
    complete: {
      name: "Complete Natal Reading",
      price: "$97",
      priceNote: "Hand-prepared analysis",
      delivery: "Hand-prepared and delivered within 72 hours",
      format: "Comprehensive PDF report",
      summary:
        "A profound structural analysis of your entire chart. Love, vocation, and money are viewed not as isolated parts, but as connected themes stemming from your core planetary rulers and aspects.",
      disclosure: "Prepared by hand in a limited daily queue.",
    },
    kabbalah: {
      name: "Hermetic Kabbalah Reading",
      price: "$149",
      priceNote: "Esoteric synthesis",
      delivery: "Hand-prepared and delivered within 7 days",
      format: "Specialized PDF reading",
      summary:
        "A deep esoteric mapping of your personal Shem HaMephorash angels, Sephirot pathworking, and specific invocatory practices (Psalms, hours, and letters) tailored precisely to your chart.",
      disclosure: "Highly specialized esoteric work. Prepared by hand.",
    },
    dossier: {
      name: "Full Chart Dossier",
      price: "$197",
      priceNote: "Premium integration",
      delivery: "Hand-prepared and delivered within 10 days",
      format: "Premium multi-part PDF dossier",
      summary:
        "Our most comprehensive offering. The Dossier integrates the Complete Natal Reading, the deepest thematic studies of Love and Vocation, and a 12-month Transit Forecast into a single, beautifully bound digital volume.",
      disclosure: "Our highest level of synthesis. Very limited availability.",
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
      { label: "Planetary Hours", href: "/planetary-hours" },
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
