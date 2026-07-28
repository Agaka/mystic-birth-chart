import type { ReportTier } from "./store.ts";

export type ReportChapter = {
  key: string;
  title: string;
  purpose: string;
};

export type ReportBlueprint = {
  tier: ReportTier;
  fileName: string;
  title: string;
  eyebrow: string;
  targetPages: readonly [number, number];
  targetWords: readonly [number, number];
  requiresPartner: boolean;
  requiresAnnualCycle: boolean;
  recurring: boolean;
  chapters: readonly ReportChapter[];
};

const natalFoundation: ReportChapter[] = [
  { key: "chartArchitecture", title: "Chart Architecture", purpose: "The ranked structure, sect, angles, house rulers, dignities, receptions, and repeated testimony that organize the natal figure." },
  { key: "temperament", title: "Temperament and Authority", purpose: "Sect, distribution of authority, the luminaries, chart ruler, angular planets, and major strengths or pressures." },
  { key: "planetaryChapters", title: "The Traditional Planets", purpose: "An integrated judgment of Sun, Moon, Mercury, Venus, Mars, Jupiter, and Saturn, with modern planets only as supporting layers." },
  { key: "lifeAreas", title: "The Twelve Houses", purpose: "Each house through its sign, ruler, condition, occupants, relevant aspects, receptions, and repeated testimony." },
  { key: "appliedSynthesis", title: "Applied Synthesis", purpose: "Practical priorities, contradictions, questions, and the relationships among work, private life, money, intimacy, and autonomy." },
];

export const reportCatalog: Record<ReportTier, ReportBlueprint> = {
  basic: {
    tier: "basic", fileName: "essential-birth-chart-reading.pdf", title: "Essential Birth Chart Reading", eyebrow: "Automated First Synthesis",
    targetPages: [16, 20], targetWords: [3500, 5000], requiresPartner: false, requiresAnnualCycle: false, recurring: false,
    chapters: [],
  },
  complete: {
    tier: "complete", fileName: "complete-natal-reading.pdf", title: "Complete Natal Reading", eyebrow: "Complete Natal Study",
    targetPages: [45, 60], targetWords: [12000, 18000], requiresPartner: false, requiresAnnualCycle: false, recurring: false,
    chapters: natalFoundation,
  },
  love: {
    tier: "love", fileName: "love-relationship-pattern.pdf", title: "Love & Relationship Pattern", eyebrow: "Focused Natal Study",
    targetPages: [24, 32], targetWords: [6500, 9000], requiresPartner: false, requiresAnnualCycle: false, recurring: false,
    chapters: [
      { key: "relationshipStructure", title: "The Relationship House", purpose: "The seventh whole-sign house, its ruler, condition, aspects, and the chart ruler's relationship to partnership." },
      { key: "venusAndDesire", title: "Venus, Desire, and Value", purpose: "Venus, the Moon, Mars, and repeated testimony in intimacy, attraction, reciprocity, and self-worth." },
      { key: "relationshipPractice", title: "Patterns in Practice", purpose: "Strengths, tensions, boundaries, communication, and practical reflection without deterministic compatibility claims." },
    ],
  },
  career: {
    tier: "career", fileName: "career-vocation-reading.pdf", title: "Career & Vocation", eyebrow: "Focused Natal Study",
    targetPages: [24, 32], targetWords: [6500, 9000], requiresPartner: false, requiresAnnualCycle: false, recurring: false,
    chapters: [
      { key: "vocationStructure", title: "The Vocation Structure", purpose: "Tenth house, Midheaven, ruler of the tenth, planets in the tenth, and their relationship to the chart ruler." },
      { key: "workResources", title: "Work, Resources, and Authority", purpose: "Second and sixth houses, rulers, Saturn, Mars, Mercury, and the conditions supporting sustainable work." },
      { key: "vocationPractice", title: "Direction in Practice", purpose: "Practical priorities, types of contribution, pressure points, and questions for decision-making." },
    ],
  },
  "year-ahead": {
    tier: "year-ahead", fileName: "twelve-month-transit-forecast.pdf", title: "12-Month Transit Forecast", eyebrow: "Annual Timing Study",
    targetPages: [30, 42], targetWords: [8500, 12000], requiresPartner: false, requiresAnnualCycle: true, recurring: false,
    chapters: [
      { key: "yearStructure", title: "The Structure of the Year", purpose: "Annual profection, activated house, lord of the year, natal condition, and solar return context." },
      { key: "solarReturn", title: "Solar Return", purpose: "Return Ascendant, ruler, Midheaven, luminaries, angular planets, repeated testimony, and natal-to-return overlays." },
      { key: "relevantTransits", title: "Relevant Transits", purpose: "Only transits to structurally important natal points, organized by application, exactness, separation, and uncertainty." },
      { key: "yearTimeline", title: "The Year in Rhythm", purpose: "Four quarters and compact monthly chapters with windows of expansion, pressure, revision, and preparation." },
    ],
  },
  synastry: {
    tier: "synastry", fileName: "synastry-compatibility-reading.pdf", title: "Synastry & Compatibility", eyebrow: "Dual Chart Study",
    targetPages: [34, 46], targetWords: [9500, 13500], requiresPartner: true, requiresAnnualCycle: false, recurring: false,
    chapters: [
      { key: "twoStructures", title: "Two Natal Structures", purpose: "Each person's chart ruler, sect, luminaries, and dominant testimony before comparing the figures." },
      { key: "contactPoints", title: "Contact Points", purpose: "Traditional inter-chart aspects, angles, house overlays, and only then close modern supporting layers." },
      { key: "relationshipDynamic", title: "The Relationship Dynamic", purpose: "Emotional rhythm, attraction, language, collaboration, tension, consent, boundaries, and practical care." },
    ],
  },
  kabbalah: {
    tier: "kabbalah", fileName: "hermetic-kabbalah-reading.pdf", title: "Hermetic Kabbalah Reading", eyebrow: "Esoteric Natal Study",
    targetPages: [32, 44], targetWords: [9000, 12500], requiresPartner: false, requiresAnnualCycle: false, recurring: false,
    chapters: [
      { key: "natalFoundation", title: "The Natal Foundation", purpose: "Traditional natal hierarchy before applying any Hermetic correspondence." },
      { key: "planetaryTree", title: "Planetary Spheres and the Tree", purpose: "Careful Hermetic Qabalah correspondences for dominant natal planets, explicitly distinguished from Jewish Kabbalah." },
      { key: "decansAndPractice", title: "Decans and Practice", purpose: "Natal decans, relevant angelic correspondences, planetary days and hours, and ethical devotional or contemplative practice." },
    ],
  },
  dossier: {
    tier: "dossier", fileName: "premium-natal-year-ahead-reading.pdf", title: "Premium Natal & Year-Ahead Reading", eyebrow: "Premium Integrated Study",
    targetPages: [75, 100], targetWords: [22000, 32000], requiresPartner: false, requiresAnnualCycle: true, recurring: false,
    chapters: [...natalFoundation, { key: "annualStructure", title: "The Annual Cycle", purpose: "Profection, solar return, selected transits, timeline, annual priorities, dates, and calendar material integrated with the natal chart." }],
  },
  almanac: {
    tier: "almanac", fileName: "hermetic-almanac.pdf", title: "The Hermetic Almanac", eyebrow: "Personal Monthly Almanac",
    targetPages: [12, 18], targetWords: [3000, 4500], requiresPartner: false, requiresAnnualCycle: false, recurring: true,
    chapters: [
      { key: "monthSky", title: "The Sky This Month", purpose: "Current lunation, major planetary ingresses and stations, described without fatalism." },
      { key: "natalActivation", title: "Your Natal Activation", purpose: "The current sky filtered through the subscriber's Ascendant, chart ruler, luminaries, angles, and relevant natal rulers." },
      { key: "hermeticPractice", title: "Hermetic Practice and Election", purpose: "Ethical planetary-hour practice and carefully scoped electional windows for study, planning, rest, and reflection." },
    ],
  },
};

export function blueprintFor(tier: ReportTier): ReportBlueprint {
  return reportCatalog[tier];
}
