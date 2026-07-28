import type { AspectType, ChartBody, FullChart, Sign } from "./fullChart.ts";

const signs: Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const rulers: Record<Sign, ChartBody> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };
const traditional: ChartBody[] = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const aspects: Array<{ type: AspectType; angle: number }> = [
  { type: "conjunction", angle: 0 }, { type: "sextile", angle: 60 }, { type: "square", angle: 90 }, { type: "trine", angle: 120 }, { type: "opposition", angle: 180 },
];

export type SynastryClassification = "supportive" | "demanding" | "mixed" | "highly consequential";
export interface SynastryContact { bodyA: string; bodyB: string; aspect: AspectType; orb: number; orbLabel: string; classification: SynastryClassification; outOfSign: boolean; }
export interface HouseOverlay { planetOwner: "First" | "Second"; owner: "First" | "Second"; body: ChartBody; house: number; sign: Sign; }
export interface AngleContact extends SynastryContact { angleOwner: "First" | "Second"; }
export interface InterchartReception { planetA: ChartBody; planetB: ChartBody; kind: "mutual domicile" | "one-way domicile"; explanation: string; }
export interface SynastryEvidence {
  contacts: SynastryContact[];
  angleContacts: AngleContact[];
  houseOverlays: HouseOverlay[];
  receptions: InterchartReception[];
  moonCautions: string[];
  omitted: string[];
}

function distance(a: number, b: number): number { return Math.abs(((a - b + 540) % 360) - 180); }
function orbLabel(value: number): string { const degrees = Math.floor(value); const minutes = Math.round((value - degrees) * 60); return `${degrees}°${String(minutes).padStart(2, "0")}′`; }
function signDistance(a: Sign, b: Sign): number { const raw = Math.abs(signs.indexOf(a) - signs.indexOf(b)); return Math.min(raw, 12 - raw); }
function signBased(a: Sign, b: Sign, type: AspectType): boolean { return signDistance(a, b) === ({ conjunction: 0, sextile: 2, square: 3, trine: 4, opposition: 6 })[type]; }
function houseOf(sign: Sign, ascendant: Sign): number { return ((signs.indexOf(sign) - signs.indexOf(ascendant) + 12) % 12) + 1; }
function maxOrb(a: ChartBody | string, b: ChartBody | string): number { return a === "Sun" || a === "Moon" || b === "Sun" || b === "Moon" ? 8 : 5; }
function classify(type: AspectType, orb: number, bodies: string[]): SynastryClassification {
  if (orb <= 1 || bodies.includes("Saturn") && (type === "conjunction" || type === "opposition")) return "highly consequential";
  if (type === "trine" || type === "sextile") return "supportive";
  if (type === "square") return "demanding";
  return "mixed";
}

function closestAspect(a: number, b: number, max: number): { type: AspectType; orb: number } | null {
  const separation = distance(a, b);
  const found = aspects.map((aspect) => ({ type: aspect.type, orb: Math.abs(separation - aspect.angle) })).sort((x, y) => x.orb - y.orb)[0]!;
  return found.orb <= max ? found : null;
}

function contacts(first: FullChart, second: FullChart): SynastryContact[] {
  const result: SynastryContact[] = [];
  for (const a of first.placements.filter((item) => traditional.includes(item.body))) {
    for (const b of second.placements.filter((item) => traditional.includes(item.body))) {
      const found = closestAspect(a.longitude, b.longitude, maxOrb(a.body, b.body));
      if (!found) continue;
      result.push({ bodyA: a.body, bodyB: b.body, aspect: found.type, orb: found.orb, orbLabel: orbLabel(found.orb), classification: classify(found.type, found.orb, [a.body, b.body]), outOfSign: !signBased(a.sign, b.sign, found.type) });
    }
  }
  return result.sort((a, b) => Number(a.outOfSign) - Number(b.outOfSign) || a.orb - b.orb).slice(0, 36);
}

function angleContacts(chart: FullChart, other: FullChart, owner: "First" | "Second"): AngleContact[] {
  const angles = [{ name: "Ascendant", ...chart.angles.ascendant }, { name: "Midheaven", ...chart.angles.midheaven }];
  return angles.flatMap((angle) => other.placements.filter((item) => traditional.includes(item.body)).flatMap((planet) => {
    const found = closestAspect(angle.longitude, planet.longitude, 3);
    return found ? [{ bodyA: angle.name, bodyB: planet.body, aspect: found.type, orb: found.orb, orbLabel: orbLabel(found.orb), classification: classify(found.type, found.orb, [planet.body, angle.name]), outOfSign: !signBased(angle.sign, planet.sign, found.type), angleOwner: owner }] : [];
  })).sort((a, b) => a.orb - b.orb);
}

function receptions(first: FullChart, second: FullChart): InterchartReception[] {
  const result: InterchartReception[] = [];
  for (const a of first.placements.filter((item) => traditional.includes(item.body))) {
    for (const b of second.placements.filter((item) => traditional.includes(item.body))) {
      const aReceivedByB = rulers[a.sign] === b.body;
      const bReceivedByA = rulers[b.sign] === a.body;
      if (!aReceivedByB && !bReceivedByA) continue;
      result.push({ planetA: a.body, planetB: b.body, kind: aReceivedByB && bReceivedByA ? "mutual domicile" : "one-way domicile", explanation: aReceivedByB && bReceivedByA ? `${a.body} in ${a.sign} and ${b.body} in ${b.sign} form mutual domicile reception.` : `${aReceivedByB ? a.body : b.body} is received by ${aReceivedByB ? b.body : a.body} by domicile.` });
    }
  }
  return result.filter((item, index) => result.findIndex((other) => other.planetA === item.planetA && other.planetB === item.planetB && other.kind === item.kind) === index);
}

export function buildSynastryEvidence(first: FullChart, second: FullChart, options: { firstTimeKnown: boolean; secondTimeKnown: boolean; firstMoonSigns?: Sign[]; secondMoonSigns?: Sign[] }): SynastryEvidence {
  const omitted: string[] = [];
  const moonCautions: string[] = [];
  if (!options.firstTimeKnown) omitted.push("First person's houses, angles, sect, and house overlays into the first chart are omitted because the birth time is unknown.");
  if (!options.secondTimeKnown) omitted.push("Second person's houses, angles, sect, and house overlays into the second chart are omitted because the birth time is unknown.");
  if ((options.firstMoonSigns?.length || 0) > 1) moonCautions.push(`The first person's Moon may change sign that day (${options.firstMoonSigns!.join(" or ")}); Moon claims are conditional.`);
  if ((options.secondMoonSigns?.length || 0) > 1) moonCautions.push(`The second person's Moon may change sign that day (${options.secondMoonSigns!.join(" or ")}); Moon claims are conditional.`);
  const houseOverlays: HouseOverlay[] = [];
  if (options.secondTimeKnown) for (const planet of first.placements.filter((item) => traditional.includes(item.body))) houseOverlays.push({ planetOwner: "First", owner: "Second", body: planet.body, house: houseOf(planet.sign, second.angles.ascendant.sign), sign: planet.sign });
  if (options.firstTimeKnown) for (const planet of second.placements.filter((item) => traditional.includes(item.body))) houseOverlays.push({ planetOwner: "Second", owner: "First", body: planet.body, house: houseOf(planet.sign, first.angles.ascendant.sign), sign: planet.sign });
  return {
    contacts: contacts(first, second),
    angleContacts: [...(options.firstTimeKnown ? angleContacts(first, second, "First") : []), ...(options.secondTimeKnown ? angleContacts(second, first, "Second") : [])],
    houseOverlays,
    receptions: receptions(first, second),
    moonCautions,
    omitted,
  };
}
