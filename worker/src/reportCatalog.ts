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
      { key: "relationshipStructure", title: "The Relationship Structure", purpose: "Begin with the seventh whole-sign house: sign, ruler, condition of that ruler, occupants, main aspects, and chart ruler. Then judge Venus for attraction, values and reciprocity; the Moon for security and continuity; Mars for desire, initiative, conflict and limits; and Mercury for language and negotiation." },
      { key: "intimacyAndCommitment", title: "Romance, Trust, and Commitment", purpose: "Read the fifth house for romance and expression, eighth for trust, vulnerability and shared resources, fourth for domestic intimacy and emotional base, Saturn for commitment and delay, and Jupiter for confidence and generosity. Distinguish attraction from commitment and identify repeated testimony across houses and rulers." },
      { key: "relationshipPractice", title: "Patterns in Practice", purpose: "Explain how the person approaches, protects themselves, reacts under tension, and balances autonomy with closeness. Name conditions for sustainable relationship, three relational resources, three patterns to observe, and three communication or boundary practices. Never diagnose attachment, predict marriage, name an ideal partner, or promise meeting someone." },
    ],
  },
  career: {
    tier: "career", fileName: "career-vocation-reading.pdf", title: "Career & Vocation", eyebrow: "Focused Natal Study",
    targetPages: [24, 32], targetWords: [6500, 9000], requiresPartner: false, requiresAnnualCycle: false, recurring: false,
    chapters: [
      { key: "vocationStructure", title: "The Vocation Structure", purpose: "Begin with the tenth house, Midheaven, ruler of the tenth, planets in the tenth, aspects to the Midheaven, and the relationship to the chart ruler. Integrate the Sun for authorship and recognition, Mercury for skill and communication, Mars for execution, Jupiter for growth, and Saturn for structure and maturation." },
      { key: "workResources", title: "Work, Resources, and Authority", purpose: "Judge second house resources, sixth house routine and workload, ninth house education and specialization, eleventh house networks and collective projects, the Lot of Fortune, the Lot of Spirit, and the dignities or debilities of vocational planets. Explain working style, leadership and authority, autonomy versus structure, and supportive environments." },
      { key: "vocationPractice", title: "Direction in Practice", purpose: "Name coherent families of function such as analysis, communication, research, teaching, leadership, coordination, craft, or service, never one mandatory profession. Give three professional strengths, three tensions, risks of depletion or dispersion, and a practical development strategy without promising wealth, salary, promotion, or success." },
    ],
  },
  "year-ahead": {
    tier: "year-ahead", fileName: "twelve-month-transit-forecast.pdf", title: "12-Month Transit Forecast", eyebrow: "Annual Timing Study",
    targetPages: [28, 40], targetWords: [8000, 12000], requiresPartner: false, requiresAnnualCycle: false, recurring: false,
    chapters: [
      { key: "forecastHierarchy", title: "The Forecast Hierarchy", purpose: "State the covered period, the necessary natal background, current annual profection, active house and lord of the year. When the period crosses a birthday, explicitly change the profection on that date. Select five to eight central themes and do not include a complete natal judgment or solar return." },
      { key: "relevantTransits", title: "The Relevant Activations", purpose: "Select only ten to fifteen meaningful activations involving chart ruler, Sun, Moon, Ascendant, Midheaven, lord of the year and activated-house rulers. Prioritize Jupiter and Saturn; use Mars as a trigger, relevant retrogrades, lunations/eclipses only when they activate the chart, and outer planets as secondary context. Give application, exactness, separation and uncertainty." },
      { key: "yearTimeline", title: "Twelve Months of Timing", purpose: "Give compact chapters for twelve months plus work, resources, relationships and family. Mark expansion, pressure, review, decision windows and dates where testimony converges. Use language of preparation, attention and possibility, never certainty." },
    ],
  },
  synastry: {
    tier: "synastry", fileName: "synastry-compatibility-reading.pdf", title: "Synastry & Compatibility", eyebrow: "Dual Chart Study",
    targetPages: [35, 50], targetWords: [10000, 15000], requiresPartner: true, requiresAnnualCycle: false, recurring: false,
    chapters: [
      { key: "twoStructures", title: "Two Natal Structures", purpose: "Present each person's chart ruler, sect, luminaries and dominant testimony before comparing them. State the reliability of each birth time. If a time is unknown, omit houses, Ascendant, Midheaven and house overlays for that person and treat a potentially sign-changing Moon cautiously." },
      { key: "contactPoints", title: "The Inter-Chart Contacts", purpose: "Evaluate Sun-Sun, Sun-Moon, Moon-Moon, Mercury, Venus, Mars, Jupiter and Saturn contacts first; then contacts to angles and house overlays only when reliable. Include fifth, seventh, eighth and fourth house themes where houses are available; receptions; and the most important traditional inter-chart aspects. Classify testimony as supportive, demanding, mixed, or highly consequential, never as a compatibility percentage." },
      { key: "relationshipDynamic", title: "The Relationship Dynamic", purpose: "Translate the evidence into attraction, emotional safety, communication, intimacy, practical life, autonomy, conflict and repair, and commitment. End with three supports, three friction points and three recommended agreements. Never claim soulmate status, duration, marriage or separation, judge either person morally, or tell someone to leave or stay." },
    ],
  },
  kabbalah: {
    tier: "kabbalah", fileName: "hermetic-kabbalah-reading.pdf", title: "Hermetic Kabbalah Reading", eyebrow: "Esoteric Natal Study",
    targetPages: [45, 65], targetWords: [12000, 18000], requiresPartner: false, requiresAnnualCycle: false, recurring: false,
    chapters: [
      { key: "natalFoundation", title: "The Natal Spiritual Hierarchy", purpose: "Start from the chart ruler, sect light, dominant and pressured traditional planets, then map their hierarchy through the selected Hermetic correspondence system. Do not make esoteric symbolism outrank natal evidence." },
      { key: "planetaryTree", title: "Spheres, Paths, and Balance", purpose: "Use only the supplied closed correspondence database for planetary spheres, Sephiroth, paths, Tarot, letters, colors, metals, perfumes, angels, Psalms and decans. Explain dominant and balancing spheres, virtues and imbalances, and explicitly distinguish Hermetic Qabalah from Jewish Kabbalah." },
      { key: "decansAndPractice", title: "Decans and Contemplative Practice", purpose: "Cover the decans of Sun, Moon, Ascendant, chart ruler and Midheaven, plus database-backed angelic/intelligence correspondences only. Provide solar, lunar, mercurial, venusian, martial, jovian and saturnian contemplative practices; a principal practice, secondary practices, seven-day plan, four-week plan, observation journal and correspondence table. Practices must be devotional, voluntary, safe and non-coercive; never claim initiation, supernatural proof, healing, protection or material manifestation." },
    ],
  },
  dossier: {
    tier: "dossier", fileName: "premium-natal-year-ahead-reading.pdf", title: "Premium Natal & Year-Ahead Reading", eyebrow: "Premium Integrated Study",
    targetPages: [75, 100], targetWords: [22000, 32000], requiresPartner: false, requiresAnnualCycle: true, recurring: false,
    chapters: [...natalFoundation, { key: "annualStructure", title: "The Annual Cycle", purpose: "Profection, solar return, selected transits, timeline, annual priorities, dates, and calendar material integrated with the natal chart." }],
  },
  almanac: {
    tier: "almanac", fileName: "hermetic-almanac.pdf", title: "The Hermetic Almanac", eyebrow: "Personal Monthly Almanac",
    targetPages: [8, 12], targetWords: [2000, 4000], requiresPartner: false, requiresAnnualCycle: false, recurring: true,
    chapters: [
      { key: "monthSky", title: "The Month in Your Houses", purpose: "Start with the natal house occupied by the Sun, the central monthly theme, New Moon and Full Moon houses, Mercury, Venus and Mars. Include Jupiter or Saturn only when relevant and retrogrades only when they touch an important natal point." },
      { key: "natalActivation", title: "Your Current Activations", purpose: "Filter the current sky through the Ascendant, chart ruler, luminaries, angles and relevant natal rulers. Update annual profection when the subscriber has crossed a birthday. Avoid repeating the whole natal reading; focus only on what changed this month." },
      { key: "hermeticPractice", title: "Practical Rhythm", purpose: "Give three principal dates, one action window, one review window, one area requiring limits, three questions and a practical summary. Use safe optional Hermetic or planetary-hour practice without coercive or material promises." },
    ],
  },
};

export function blueprintFor(tier: ReportTier): ReportBlueprint {
  return reportCatalog[tier];
}
