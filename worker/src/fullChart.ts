import { createRequire } from "node:module";
import type * as AstronomyTypes from "astronomy-engine";

const require = createRequire(import.meta.url);
const Astronomy = require("astronomy-engine") as typeof AstronomyTypes;
type AstronomyBody = import("astronomy-engine").Body;

export type Sign = "Aries" | "Taurus" | "Gemini" | "Cancer" | "Leo" | "Virgo" | "Libra" | "Scorpio" | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces";
export type ChartBody = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";
export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";
export type EssentialDignity = "domicile" | "exaltation" | "detriment" | "fall";

export interface FullChartInput { date: string; time: string; latitude: number; longitude: number; timezone: string; }
export interface Placement { body: ChartBody; longitude: number; sign: Sign; degree: number; degreeLabel: string; house: number; dignity: EssentialDignity | "neutral"; dignities: EssentialDignity[]; }
export interface ChartAspect { body1: ChartBody | "Ascendant" | "Midheaven"; body2: ChartBody | "Ascendant" | "Midheaven"; type: AspectType; orb: number; orbLabel: string; exactAngle: number; outOfSign: boolean; }
export interface DominantSignature { rank: number; title: string; evidence: string; supportingModernEvidence: string[]; score: number; }
export interface FullChart {
  utc: string;
  utcOffset: number;
  zodiac: "Tropical";
  houseSystem: "Whole Sign";
  coordinates: { latitude: number; longitude: number };
  angles: { ascendant: { longitude: number; sign: Sign; degree: number; degreeLabel: string }; midheaven: { longitude: number; sign: Sign; degree: number; degreeLabel: string } };
  lots: { fortune: { longitude: number; sign: Sign; degree: number; degreeLabel: string; house: number }; spirit: { longitude: number; sign: Sign; degree: number; degreeLabel: string; house: number } };
  placements: Placement[];
  aspects: ChartAspect[];
  dominantSignatures: DominantSignature[];
  chartRuler: "Mars" | "Venus" | "Mercury" | "Moon" | "Sun" | "Jupiter" | "Saturn";
  sect: "Day chart" | "Night chart";
  moonPhase: { name: string; angle: number; illumination: number; timingLabel: string };
}

const signs: Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const traditionalRulers = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" } as const;
const bodies = [["Sun", Astronomy.Body.Sun], ["Moon", Astronomy.Body.Moon], ["Mercury", Astronomy.Body.Mercury], ["Venus", Astronomy.Body.Venus], ["Mars", Astronomy.Body.Mars], ["Jupiter", Astronomy.Body.Jupiter], ["Saturn", Astronomy.Body.Saturn], ["Uranus", Astronomy.Body.Uranus], ["Neptune", Astronomy.Body.Neptune], ["Pluto", Astronomy.Body.Pluto]] as const;
const aspectAngles: Array<[AspectType, number]> = [["conjunction", 0], ["sextile", 60], ["square", 90], ["trine", 120], ["opposition", 180]];

function normalize(value: number): number { return ((value % 360) + 360) % 360; }
function radians(value: number): number { return value * Math.PI / 180; }
function degrees(value: number): number { return value * 180 / Math.PI; }
function signOf(longitude: number): Sign { return signs[Math.floor(normalize(longitude) / 30)]; }
function degreeInSign(longitude: number): number { return normalize(longitude) % 30; }
function round(value: number, places = 4): number { return Number(value.toFixed(places)); }

function offsetAt(utcMs: number, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date(utcMs));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return (Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second)) - utcMs) / 3_600_000;
}

function instantFromLocal(input: FullChartInput): { date: Date; utcOffset: number } {
  const [year, month, day] = input.date.split("-").map(Number);
  const [hour, minute] = input.time.split(":").map(Number);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const first = offsetAt(localAsUtc, input.timezone);
  const corrected = localAsUtc - first * 3_600_000;
  const utcOffset = offsetAt(corrected, input.timezone);
  return { date: new Date(localAsUtc - utcOffset * 3_600_000), utcOffset };
}

function planetaryLongitude(body: AstronomyBody, date: Date): number {
  return normalize(body === Astronomy.Body.Moon ? Astronomy.EclipticGeoMoon(date).lon : Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon);
}

function angles(date: Date, latitude: number, longitude: number): { ascendant: number; midheaven: number } {
  const obliquity = radians(23.4392911);
  const sidereal = radians(normalize(Astronomy.SiderealTime(date) * 15 + longitude));
  const lat = radians(latitude);
  const ascendant = normalize(degrees(Math.atan2(Math.cos(sidereal), -(Math.sin(sidereal) * Math.cos(obliquity) + Math.tan(lat) * Math.sin(obliquity)))));
  const midheaven = normalize(degrees(Math.atan2(Math.sin(sidereal), Math.cos(sidereal) * Math.cos(obliquity))));
  return { ascendant, midheaven };
}

function dignities(body: ChartBody, sign: Sign): EssentialDignity[] {
  const domicile: Partial<Record<ChartBody, Sign[]>> = { Sun: ["Leo"], Moon: ["Cancer"], Mercury: ["Gemini", "Virgo"], Venus: ["Taurus", "Libra"], Mars: ["Aries", "Scorpio"], Jupiter: ["Sagittarius", "Pisces"], Saturn: ["Capricorn", "Aquarius"] };
  const exaltation: Partial<Record<ChartBody, Sign>> = { Sun: "Aries", Moon: "Taurus", Mercury: "Virgo", Venus: "Pisces", Mars: "Capricorn", Jupiter: "Cancer", Saturn: "Libra" };
  const detriment: Partial<Record<ChartBody, Sign[]>> = { Sun: ["Aquarius"], Moon: ["Capricorn"], Mercury: ["Sagittarius", "Pisces"], Venus: ["Aries", "Scorpio"], Mars: ["Taurus", "Libra"], Jupiter: ["Gemini", "Virgo"], Saturn: ["Cancer", "Leo"] };
  const fall: Partial<Record<ChartBody, Sign>> = { Sun: "Libra", Moon: "Scorpio", Mercury: "Pisces", Venus: "Virgo", Mars: "Cancer", Jupiter: "Capricorn", Saturn: "Aries" };
  const result: EssentialDignity[] = [];
  if (domicile[body]?.includes(sign)) result.push("domicile");
  if (exaltation[body] === sign) result.push("exaltation");
  if (detriment[body]?.includes(sign)) result.push("detriment");
  if (fall[body] === sign) result.push("fall");
  return result;
}

function primaryDignity(values: EssentialDignity[]): Placement["dignity"] { return values[0] || "neutral"; }

function aspectOrb(a: number, b: number, exact: number): number {
  const distance = Math.abs(normalize(a - b));
  const shortest = Math.min(distance, 360 - distance);
  return Math.abs(shortest - exact);
}

function signDistance(a: Sign, b: Sign): number { const distance = Math.abs(signs.indexOf(a) - signs.indexOf(b)); return Math.min(distance, 12 - distance); }
function isSignBasedAspect(a: Sign, b: Sign, type: AspectType): boolean {
  const expected: Record<AspectType, number> = { conjunction: 0, sextile: 2, square: 3, trine: 4, opposition: 6 };
  return signDistance(a, b) === expected[type];
}

function findAspects(points: Array<{ body: ChartAspect["body1"]; longitude: number; sign: Sign }>): ChartAspect[] {
  const results: ChartAspect[] = [];
  for (let i = 0; i < points.length; i += 1) for (let j = i + 1; j < points.length; j += 1) {
    const a = points[i]; const b = points[j];
    for (const [type, exactAngle] of aspectAngles) {
      const orb = aspectOrb(a.longitude, b.longitude, exactAngle);
      const includesLuminary = [a.body, b.body].some((body) => body === "Sun" || body === "Moon");
      const includesAngle = [a.body, b.body].some((body) => body === "Ascendant" || body === "Midheaven");
      const maxOrb = includesLuminary ? 8 : includesAngle ? 5 : 6;
      if (orb <= maxOrb) {
        const roundedOrb = round(orb, 4);
        results.push({ body1: a.body, body2: b.body, type, orb: roundedOrb, orbLabel: formatAstroDegree(roundedOrb), exactAngle, outOfSign: !isSignBasedAspect(a.sign, b.sign, type) });
      }
    }
  }
  return results.sort((a, b) => a.orb - b.orb);
}

const traditionalBodies = new Set<ChartBody>(["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]);
const outerBodies = new Set<ChartBody>(["Uranus", "Neptune", "Pluto"]);

function isChartBody(value: ChartAspect["body1"]): value is ChartBody { return bodies.some(([body]) => body === value); }
function isAngular(placement: Placement): boolean { return [1, 4, 7, 10].includes(placement.house); }
function formatAstroDegree(value: number): string {
  let degree = Math.floor(value); let minute = Math.round((value - degree) * 60);
  if (minute === 60) { degree += 1; minute = 0; }
  return `${degree}\u00b0${String(minute).padStart(2, "0")}\u2032`;
}
function aspectWord(type: AspectType): string { return ({ conjunction: "conjunct", sextile: "sextile", square: "square", trine: "trine", opposition: "opposite" })[type]; }
function aspectEvidence(aspect: ChartAspect): string {
  const relation = aspect.outOfSign ? `out-of-sign ${aspect.type}` : aspectWord(aspect.type);
  return `${aspect.body1} ${relation} ${aspect.body2}, ${aspect.orbLabel} orb`;
}

function rankSignatures(placements: Placement[], aspects: ChartAspect[], ascendantSign: Sign, chartRuler: FullChart["chartRuler"], sect: FullChart["sect"]): DominantSignature[] {
  const byBody = new Map(placements.map((placement) => [placement.body, placement]));
  const sectLight: ChartBody = sect === "Day chart" ? "Sun" : "Moon";
  const relevantHouseRulers = new Set<ChartBody>();
  for (const house of [1, 7, 10]) relevantHouseRulers.add(traditionalRulers[signs[(signs.indexOf(ascendantSign) + house - 1) % 12]]);
  const modernSupport = (involved: ChartAspect["body1"][]): string[] => aspects
    .filter((aspect) => !aspect.outOfSign && aspect.orb <= 1.5 && ((outerBodies.has(aspect.body1 as ChartBody) && involved.includes(aspect.body2)) || (outerBodies.has(aspect.body2 as ChartBody) && involved.includes(aspect.body1))))
    .map(aspectEvidence);
  const candidates = aspects
    .filter((aspect) => !aspect.outOfSign && [aspect.body1, aspect.body2].some((body) => traditionalBodies.has(body as ChartBody)) && ![aspect.body1, aspect.body2].some((body) => outerBodies.has(body as ChartBody)))
    .map((aspect) => {
      const involved = [aspect.body1, aspect.body2];
      let score = 80 - aspect.orb * 4;
      for (const body of involved) {
        if (!isChartBody(body)) continue;
        const placement = byBody.get(body)!;
        if (body === chartRuler) score += 110;
        if (body === sectLight) score += 85;
        if (relevantHouseRulers.has(body)) score += 45;
        if (isAngular(placement)) score += 30;
        if (placement.dignities.some((value) => value === "domicile" || value === "exaltation")) score += 22;
        if (placement.dignities.some((value) => value === "detriment" || value === "fall")) score += 14;
        const other = involved.find((item) => item !== body);
        if (other && isChartBody(other) && traditionalRulers[placement.sign] === other) score += 16;
      }
      if (aspect.body1 === "Ascendant" || aspect.body2 === "Ascendant" || aspect.body1 === "Midheaven" || aspect.body2 === "Midheaven") score += 85;
      if (aspect.type === "conjunction") score += 14;
      if ((aspect.body1 === "Midheaven" || aspect.body2 === "Midheaven") && aspect.type === "conjunction") score += 100;
      return { title: `${aspect.body1} ${aspectWord(aspect.type)} ${aspect.body2}`, evidence: aspectEvidence(aspect), supportingModernEvidence: modernSupport(involved), score: round(score, 2) };
    });
  const fallbackCandidates = placements
    .filter((placement) => traditionalBodies.has(placement.body) && (placement.body === chartRuler || placement.body === sectLight || isAngular(placement) || placement.dignities.length > 0))
    .map((placement) => {
      let score = 30;
      if (placement.body === chartRuler) score += 110;
      if (placement.body === sectLight) score += 85;
      if (relevantHouseRulers.has(placement.body)) score += 45;
      if (isAngular(placement)) score += 30;
      score += placement.dignities.length * 22;
      const role = placement.body === chartRuler && placement.body === sectLight ? `${placement.body} as chart ruler and sect light` : placement.body === chartRuler ? `${placement.body} as chart ruler` : placement.body === sectLight ? `${placement.body} as sect light` : placement.body;
      return {
        title: `${role} in ${placement.sign}, whole-sign house ${placement.house}`,
        evidence: `${role} at ${placement.degreeLabel} ${placement.sign}, whole-sign house ${placement.house}${placement.dignities.length ? `, ${placement.dignities.join(" and ")}` : ", no major essential dignity"}`,
        supportingModernEvidence: modernSupport([placement.body]), score: round(score, 2),
      };
    });
  const selected: typeof candidates = [];
  for (const candidate of [...candidates, ...fallbackCandidates].sort((a, b) => b.score - a.score)) {
    if (selected.some((item) => item.title === candidate.title)) continue;
    selected.push(candidate);
    if (selected.length === 3) break;
  }
  return selected.map((item, index) => ({ ...item, rank: index + 1 }));
}

function moonPhase(sun: number, moon: number): FullChart["moonPhase"] {
  const angle = normalize(moon - sun);
  const names = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  const roundedAngle = round(angle, 4);
  const distanceToNew = Math.min(roundedAngle, 360 - roundedAngle);
  const timingLabel = roundedAngle === 0 ? "New Moon" : roundedAngle > 180 ? `${formatAstroDegree(distanceToNew)} before the New Moon` : `${formatAstroDegree(distanceToNew)} after the New Moon`;
  return { name: names[Math.floor(angle / 45)], angle: roundedAngle, illumination: round((1 - Math.cos(radians(angle))) / 2, 3), timingLabel };
}

function lot(longitude: number, ascendantIndex: number): FullChart["lots"]["fortune"] {
  const normalized = round(normalize(longitude));
  const sign = signOf(normalized);
  const degree = round(degreeInSign(normalized), 4);
  return { longitude: normalized, sign, degree, degreeLabel: formatAstroDegree(degree), house: ((signs.indexOf(sign) - ascendantIndex + 12) % 12) + 1 };
}

function calculateChartAtInstant(input: Pick<FullChartInput, "latitude" | "longitude">, instant: { date: Date; utcOffset: number }): FullChart {
  const angleValues = angles(instant.date, input.latitude, input.longitude);
  const ascendantSign = signOf(angleValues.ascendant);
  const ascendantIndex = signs.indexOf(ascendantSign);
  const placements = bodies.map(([body, astronomyBody]) => {
    const longitude = planetaryLongitude(astronomyBody, instant.date);
    const sign = signOf(longitude);
    const placementDignities = dignities(body, sign);
    const degree = round(degreeInSign(longitude), 4);
    return { body, longitude: round(longitude), sign, degree, degreeLabel: formatAstroDegree(degree), house: ((signs.indexOf(sign) - ascendantIndex + 12) % 12) + 1, dignity: primaryDignity(placementDignities), dignities: placementDignities };
  });
  const points = [...placements.map((item) => ({ body: item.body as ChartAspect["body1"], longitude: item.longitude, sign: item.sign })), { body: "Ascendant" as const, longitude: angleValues.ascendant, sign: ascendantSign }, { body: "Midheaven" as const, longitude: angleValues.midheaven, sign: signOf(angleValues.midheaven) }];
  const aspects = findAspects(points);
  const chartRuler = traditionalRulers[ascendantSign];
  const sun = placements.find((item) => item.body === "Sun")!;
  const moon = placements.find((item) => item.body === "Moon")!;
  const observer = new Astronomy.Observer(input.latitude, input.longitude, 0);
  const equatorialSun = Astronomy.Equator(Astronomy.Body.Sun, instant.date, observer, true, true);
  const sunAboveHorizon = Astronomy.Horizon(instant.date, observer, equatorialSun.ra, equatorialSun.dec, "normal").altitude >= 0;
  const sect = sunAboveHorizon ? "Day chart" : "Night chart";
  const fortuneLongitude = sect === "Day chart"
    ? normalize(angleValues.ascendant + moon.longitude - sun.longitude)
    : normalize(angleValues.ascendant + sun.longitude - moon.longitude);
  const spiritLongitude = sect === "Day chart"
    ? normalize(angleValues.ascendant + sun.longitude - moon.longitude)
    : normalize(angleValues.ascendant + moon.longitude - sun.longitude);
  return {
    utc: instant.date.toISOString(), utcOffset: instant.utcOffset, zodiac: "Tropical", houseSystem: "Whole Sign",
    coordinates: { latitude: input.latitude, longitude: input.longitude },
    angles: {
      ascendant: { longitude: round(angleValues.ascendant), sign: ascendantSign, degree: round(degreeInSign(angleValues.ascendant), 4), degreeLabel: formatAstroDegree(degreeInSign(angleValues.ascendant)) },
      midheaven: { longitude: round(angleValues.midheaven), sign: signOf(angleValues.midheaven), degree: round(degreeInSign(angleValues.midheaven), 4), degreeLabel: formatAstroDegree(degreeInSign(angleValues.midheaven)) },
    },
    lots: { fortune: lot(fortuneLongitude, ascendantIndex), spirit: lot(spiritLongitude, ascendantIndex) },
    placements, aspects, dominantSignatures: rankSignatures(placements, aspects, ascendantSign, chartRuler, sect), chartRuler,
    sect, moonPhase: moonPhase(sun.longitude, moon.longitude),
  };
}

export function calculateFullChart(input: FullChartInput): FullChart {
  return calculateChartAtInstant(input, instantFromLocal(input));
}

/** Used for return charts and current-sky reports, where the moment is already known in UTC. */
export function calculateFullChartAtUtc(input: Pick<FullChartInput, "latitude" | "longitude" | "timezone">, date: Date): FullChart {
  return calculateChartAtInstant(input, { date, utcOffset: offsetAt(date.getTime(), input.timezone) });
}
