import type { ProductReport } from "./productProviders.ts";
import type { ProductFacts } from "./reportFacts.ts";
import type { ReportBlueprint } from "./reportCatalog.ts";

const bodies = "Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Ascendant|Midheaven";
const aspectPattern = new RegExp(`\\b(${bodies})\\s+(?:applying\\s+to\\s+an?\\s+|separating\\s+from\\s+an?\\s+|out-of-sign\\s+)?(conjunction|sextile|square|trine|opposition)(?:\\s+with|\\s+to)?\\s+(${bodies})\\b`, "gi");
const degreePattern = new RegExp(`\\b(${bodies}|Fortune|Spirit)\\s+(?:is\\s+)?(?:at\\s+)?(\\d{1,2}°\\d{2}′)\\s+(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\\b`, "gi");
const dignityPattern = new RegExp(`\\b(${bodies})\\s+(?:has|holds|is\\s+in|is)\\s+(domicile|exaltation|triplicity|bound|face|detriment|fall)\\b`, "gi");
const conditionPattern = new RegExp(`\\b(${bodies})\\s+(retrograde|direct|stationing direct|stationing retrograde|combust|under the beams|cazimi)\\b`, "gi");
const housePattern = new RegExp(`\\b(${bodies})\\s+(?:is\\s+)?(?:in|occupies|falls\\s+in|is\\s+placed\\s+in)\\s+(?:the\\s+)?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\\s+house\\b`, "gi");
const rulerPattern = new RegExp(`\\b(${bodies})\\s+(?:rules|is\\s+the\\s+ruler\\s+of)\\s+(?:the\\s+)?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\\s+house\\b`, "gi");
const houseNumber: Record<string, number> = { first: 1, "1st": 1, second: 2, "2nd": 2, third: 3, "3rd": 3, fourth: 4, "4th": 4, fifth: 5, "5th": 5, sixth: 6, "6th": 6, seventh: 7, "7th": 7, eighth: 8, "8th": 8, ninth: 9, "9th": 9, tenth: 10, "10th": 10, eleventh: 11, "11th": 11, twelfth: 12, "12th": 12 };
const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const traditionalRulers: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };

function wordCount(value: string): number { return value.trim().split(/\s+/).filter(Boolean).length; }
function reportText(report: ProductReport): string { return [report.title, report.introduction, ...report.chapters.flatMap((item) => [item.title, item.body]), report.practicalSummary, report.closing, report.scopeNote].join("\n"); }
function key(a: string, aspect: string, b: string): string { return [a, b].sort().join("|") + `|${aspect}`; }

export function normalizeNatalDegreeClaims(blueprint: ReportBlueprint, facts: ProductFacts, report: ProductReport): ProductReport {
  if (!["complete", "love", "career", "kabbalah"].includes(blueprint.tier)) return report;
  const pattern = new RegExp(`\\b(${bodies}|Fortune|Spirit)\\s+(?:is\\s+)?(?:at\\s+)?(\\d{1,2}\\u00b0\\d{2}\\u2032)\\s+(${signs.join("|")})\\b`, "gi");
  const expectedPoint = (body: string) => {
    const placement = facts.natal.chart.placements.find((item) => item.body.toLowerCase() === body.toLowerCase());
    if (placement) return { sign: placement.sign, degreeLabel: placement.degreeLabel };
    if (body.toLowerCase() === "ascendant") return facts.natal.chart.angles.ascendant;
    if (body.toLowerCase() === "midheaven") return facts.natal.chart.angles.midheaven;
    if (body.toLowerCase() === "fortune") return facts.natal.chart.lots.fortune;
    if (body.toLowerCase() === "spirit") return facts.natal.chart.lots.spirit;
    return undefined;
  };
  const normalize = (value: string) => value.replace(pattern, (claim, body: string, degreeLabel: string, sign: string) => {
    const expected = expectedPoint(body);
    return expected?.sign.toLowerCase() === sign.toLowerCase() ? claim.replace(degreeLabel, expected.degreeLabel) : claim;
  });
  return {
    ...report,
    title: normalize(report.title),
    introduction: normalize(report.introduction),
    chapters: report.chapters.map((chapter) => ({ ...chapter, title: normalize(chapter.title), body: normalize(chapter.body) })),
    practicalSummary: normalize(report.practicalSummary),
    closing: normalize(report.closing),
    scopeNote: normalize(report.scopeNote),
  };
}

function supportedAspects(facts: ProductFacts): Set<string> {
  const result = new Set(facts.natal.chart.aspects.map((item) => key(item.body1, item.type, item.body2)));
  for (const item of facts.partner?.facts.chart.aspects || []) result.add(key(item.body1, item.type, item.body2));
  for (const item of facts.synastry?.contacts || []) result.add(key(item.bodyA, item.aspect, item.bodyB));
  for (const item of facts.synastry?.angleContacts || []) result.add(key(item.bodyA, item.aspect, item.bodyB));
  for (const item of facts.forecast?.events || []) result.add(key(item.transit, item.aspect, item.target));
  for (const item of facts.almanac?.timing.events || []) result.add(key(item.transit, item.aspect, item.target));
  for (const item of facts.annual?.solarReturn.aspects || []) result.add(key(item.body1, item.type, item.body2));
  for (const item of facts.annual?.solarReturnEvidence.returnToNatalAspects || []) result.add(key(item.returnBody, item.aspect, item.natalBody));
  return result;
}

function relevantCharts(facts: ProductFacts) {
  return [facts.natal.chart, facts.partner?.timeKnown ? facts.partner.facts.chart : undefined, facts.annual?.solarReturn].filter((item): item is ProductFacts["natal"]["chart"] => Boolean(item));
}

function technicalEvidence(facts: ProductFacts) {
  const degrees = new Set<string>();
  const dignities = new Set<string>();
  const houses = new Set<string>();
  const rulers = new Set<string>();
  const conditions = new Set<string>();
  for (const chart of relevantCharts(facts)) {
    for (const item of chart.placements) {
      degrees.add(`${item.body}|${item.degreeLabel}|${item.sign}`.toLowerCase());
      houses.add(`${item.body}|${item.house}`.toLowerCase());
      for (const dignity of item.dignities) dignities.add(`${item.body}|${dignity}`.toLowerCase());
      conditions.add(`${item.body}|${item.condition.motion}`.toLowerCase());
      if (item.condition.station) conditions.add(`${item.body}|${item.condition.station}`.toLowerCase());
      if (item.condition.solarCondition) conditions.add(`${item.body}|${item.condition.solarCondition}`.toLowerCase());
    }
    degrees.add(`ascendant|${chart.angles.ascendant.degreeLabel}|${chart.angles.ascendant.sign}`.toLowerCase());
    degrees.add(`midheaven|${chart.angles.midheaven.degreeLabel}|${chart.angles.midheaven.sign}`.toLowerCase());
    degrees.add(`fortune|${chart.lots.fortune.degreeLabel}|${chart.lots.fortune.sign}`.toLowerCase());
    degrees.add(`spirit|${chart.lots.spirit.degreeLabel}|${chart.lots.spirit.sign}`.toLowerCase());
    const ascendantIndex = signs.indexOf(chart.angles.ascendant.sign);
    for (const house of Array.from({ length: 12 }, (_, index) => index + 1)) {
      const sign = signs[(ascendantIndex + house - 1) % 12]!;
      rulers.add(`${traditionalRulers[sign]}|${house}`.toLowerCase());
    }
  }
  for (const item of facts.annual?.solarReturnEvidence.returnToNatalAspects || []) degrees.add(`${item.returnBody}|${item.orbLabel}|orb`.toLowerCase());
  return { degrees, dignities, houses, rulers, conditions };
}

export function validateProductReport(blueprint: ReportBlueprint, facts: ProductFacts, report: ProductReport): string[] {
  const errors: string[] = [];
  const expected = blueprint.chapters.map((item) => item.key);
  const actual = report.chapters.map((item) => item.key);
  for (const item of expected) if (!actual.includes(item)) errors.push(`missing-chapter:${item}`);
  for (const item of actual) if (!expected.includes(item)) errors.push(`unexpected-chapter:${item}`);
  const total = wordCount(reportText(report));
  if (total < blueprint.targetWords[0] || total > blueprint.targetWords[1] * 1.08) errors.push(`word-count:${total}:${blueprint.targetWords[0]}-${blueprint.targetWords[1]}`);
  const text = reportText(report);
  if (/\b(as an ai|system prompt|developer instruction|according to the supplied json|the prompt asks|i was instructed|trace dispositors from the supplied evidence|judge each through|keep health language symbolic)\b/i.test(text)) errors.push("instruction-artifact");
  if (/(^|\s)(\*\*|##|```|__|~~)(?=\s|\S)/m.test(text)) errors.push("markdown-artifact");
  const forbidden: Partial<Record<typeof blueprint.tier, RegExp>> = {
    love: /\b(soulmate|guaranteed marriage|attachment disorder)\b/i,
    synastry: /\b(soulmate|compatibility score|guaranteed to last|you should leave|you should stay)\b/i,
    career: /\b(guaranteed wealth|guaranteed success|exact salary)\b/i,
    kabbalah: /\b(guaranteed manifestation|absolute protection|proven guardian angel|spiritual superiority)\b/i,
  };
  if (forbidden[blueprint.tier]?.test(text)) errors.push("forbidden-product-claim");
  const supported = supportedAspects(facts);
  for (const match of text.matchAll(aspectPattern)) {
    if (!supported.has(key(match[1]!, match[2]!, match[3]!))) errors.push(`unsupported-aspect:${match[1]}-${match[2]}-${match[3]}`);
  }
  const technical = technicalEvidence(facts);
  for (const match of text.matchAll(degreePattern)) {
    if (!technical.degrees.has(`${match[1]}|${match[2]}|${match[3]}`.toLowerCase())) errors.push(`unsupported-degree:${match[1]}-${match[2]}-${match[3]}`);
  }
  for (const match of text.matchAll(dignityPattern)) {
    if (!technical.dignities.has(`${match[1]}|${match[2]}`.toLowerCase())) errors.push(`unsupported-dignity:${match[1]}-${match[2]}`);
  }
  for (const match of text.matchAll(conditionPattern)) {
    if (!technical.conditions.has(`${match[1]}|${match[2]}`.toLowerCase())) errors.push(`unsupported-condition:${match[1]}-${match[2]}`);
  }
  for (const match of text.matchAll(housePattern)) {
    const house = houseNumber[match[2]!.toLowerCase()];
    if (!technical.houses.has(`${match[1]}|${house}`.toLowerCase())) errors.push(`unsupported-house:${match[1]}-${house}`);
  }
  for (const match of text.matchAll(rulerPattern)) {
    const house = houseNumber[match[2]!.toLowerCase()];
    if (!technical.rulers.has(`${match[1]}|${house}`.toLowerCase())) errors.push(`unsupported-ruler:${match[1]}-${house}`);
  }
  return [...new Set(errors)];
}

export function validateRenderedPdf(blueprint: ReportBlueprint, pageCount: number): string[] {
  const maximumWithEditorialTolerance = Math.ceil(blueprint.targetPages[1] * 1.1);
  return pageCount < blueprint.targetPages[0] || pageCount > maximumWithEditorialTolerance
    ? [`page-count:${pageCount}:${blueprint.targetPages[0]}-${blueprint.targetPages[1]}`]
    : [];
}
