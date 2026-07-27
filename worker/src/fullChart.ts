import { createRequire } from "node:module";
import type * as AstronomyTypes from "astronomy-engine";

const require = createRequire(import.meta.url);
const Astronomy = require("astronomy-engine") as typeof AstronomyTypes;
type AstronomyBody = import("astronomy-engine").Body;

export type Sign = "Aries" | "Taurus" | "Gemini" | "Cancer" | "Leo" | "Virgo" | "Libra" | "Scorpio" | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces";
export type ChartBody = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto";
export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface FullChartInput { date: string; time: string; latitude: number; longitude: number; timezone: string; }
export interface Placement { body: ChartBody; longitude: number; sign: Sign; degree: number; house: number; dignity: "domicile" | "exaltation" | "detriment" | "fall" | "neutral"; }
export interface ChartAspect { body1: ChartBody | "Ascendant" | "Midheaven"; body2: ChartBody | "Ascendant" | "Midheaven"; type: AspectType; orb: number; exactAngle: number; }
export interface DominantSignature { rank: number; title: string; evidence: string; score: number; }
export interface FullChart {
  utc: string;
  utcOffset: number;
  zodiac: "Tropical";
  houseSystem: "Whole Sign";
  coordinates: { latitude: number; longitude: number };
  angles: { ascendant: { longitude: number; sign: Sign; degree: number }; midheaven: { longitude: number; sign: Sign; degree: number } };
  placements: Placement[];
  aspects: ChartAspect[];
  dominantSignatures: DominantSignature[];
  chartRuler: "Mars" | "Venus" | "Mercury" | "Moon" | "Sun" | "Jupiter" | "Saturn";
  sect: "Day chart" | "Night chart";
  moonPhase: { name: string; angle: number; illumination: number };
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

function dignity(body: ChartBody, sign: Sign): Placement["dignity"] {
  const domicile: Partial<Record<ChartBody, Sign[]>> = { Sun: ["Leo"], Moon: ["Cancer"], Mercury: ["Gemini", "Virgo"], Venus: ["Taurus", "Libra"], Mars: ["Aries", "Scorpio"], Jupiter: ["Sagittarius", "Pisces"], Saturn: ["Capricorn", "Aquarius"] };
  const exaltation: Partial<Record<ChartBody, Sign>> = { Sun: "Aries", Moon: "Taurus", Mercury: "Virgo", Venus: "Pisces", Mars: "Capricorn", Jupiter: "Cancer", Saturn: "Libra" };
  const detriment: Partial<Record<ChartBody, Sign[]>> = { Sun: ["Aquarius"], Moon: ["Capricorn"], Mercury: ["Sagittarius", "Pisces"], Venus: ["Aries", "Scorpio"], Mars: ["Taurus", "Libra"], Jupiter: ["Gemini", "Virgo"], Saturn: ["Cancer", "Leo"] };
  const fall: Partial<Record<ChartBody, Sign>> = { Sun: "Libra", Moon: "Scorpio", Mercury: "Pisces", Venus: "Virgo", Mars: "Cancer", Jupiter: "Capricorn", Saturn: "Aries" };
  if (domicile[body]?.includes(sign)) return "domicile";
  if (exaltation[body] === sign) return "exaltation";
  if (detriment[body]?.includes(sign)) return "detriment";
  if (fall[body] === sign) return "fall";
  return "neutral";
}

function aspectOrb(a: number, b: number, exact: number): number {
  const distance = Math.abs(normalize(a - b));
  const shortest = Math.min(distance, 360 - distance);
  return Math.abs(shortest - exact);
}

function findAspects(points: Array<{ body: ChartAspect["body1"]; longitude: number }>): ChartAspect[] {
  const results: ChartAspect[] = [];
  for (let i = 0; i < points.length; i += 1) for (let j = i + 1; j < points.length; j += 1) {
    const a = points[i]; const b = points[j];
    for (const [type, exactAngle] of aspectAngles) {
      const orb = aspectOrb(a.longitude, b.longitude, exactAngle);
      const includesLuminary = [a.body, b.body].some((body) => body === "Sun" || body === "Moon");
      const includesAngle = [a.body, b.body].some((body) => body === "Ascendant" || body === "Midheaven");
      const maxOrb = includesLuminary ? 8 : includesAngle ? 5 : 6;
      if (orb <= maxOrb) results.push({ body1: a.body, body2: b.body, type, orb: round(orb, 2), exactAngle });
    }
  }
  return results.sort((a, b) => a.orb - b.orb);
}

function rankSignatures(aspects: ChartAspect[], chartRuler: string): DominantSignature[] {
  const candidates = aspects.map((aspect) => {
    const bodiesInvolved = [aspect.body1, aspect.body2];
    const angular = bodiesInvolved.some((body) => body === "Ascendant" || body === "Midheaven");
    const luminary = bodiesInvolved.some((body) => body === "Sun" || body === "Moon");
    const ruler = bodiesInvolved.includes(chartRuler as ChartAspect["body1"]);
    const outer = bodiesInvolved.some((body) => body === "Uranus" || body === "Neptune" || body === "Pluto");
    let score = 45 - aspect.orb * 10;
    if (angular) score += 30;
    if (luminary) score += 35;
    if (ruler) score += 15;
    if (aspect.type === "conjunction") score += 18;
    if (angular && aspect.type === "conjunction") score += 12;
    if (outer) score += luminary ? 10 : -12;
    return { title: `${aspect.body1} ${aspect.type} ${aspect.body2}`, evidence: `${aspect.body1} ${aspect.type} ${aspect.body2}, orb ${aspect.orb.toFixed(2)} degrees`, score: round(score, 2) };
  });
  const selected: typeof candidates = [];
  for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
    if (selected.some((item) => item.title === candidate.title)) continue;
    selected.push(candidate);
    if (selected.length === 3) break;
  }
  return selected.map((item, index) => ({ ...item, rank: index + 1 }));
}

function moonPhase(sun: number, moon: number): FullChart["moonPhase"] {
  const angle = normalize(moon - sun);
  const names = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  return { name: names[Math.floor(angle / 45)], angle: round(angle, 2), illumination: round((1 - Math.cos(radians(angle))) / 2, 3) };
}

export function calculateFullChart(input: FullChartInput): FullChart {
  const instant = instantFromLocal(input);
  const angleValues = angles(instant.date, input.latitude, input.longitude);
  const ascendantSign = signOf(angleValues.ascendant);
  const ascendantIndex = signs.indexOf(ascendantSign);
  const placements = bodies.map(([body, astronomyBody]) => {
    const longitude = planetaryLongitude(astronomyBody, instant.date);
    const sign = signOf(longitude);
    return { body, longitude: round(longitude), sign, degree: round(degreeInSign(longitude), 2), house: ((signs.indexOf(sign) - ascendantIndex + 12) % 12) + 1, dignity: dignity(body, sign) };
  });
  const points = [...placements.map((item) => ({ body: item.body as ChartAspect["body1"], longitude: item.longitude })), { body: "Ascendant" as const, longitude: angleValues.ascendant }, { body: "Midheaven" as const, longitude: angleValues.midheaven }];
  const aspects = findAspects(points);
  const chartRuler = traditionalRulers[ascendantSign];
  const sun = placements.find((item) => item.body === "Sun")!;
  const moon = placements.find((item) => item.body === "Moon")!;
  const observer = new Astronomy.Observer(input.latitude, input.longitude, 0);
  const equatorialSun = Astronomy.Equator(Astronomy.Body.Sun, instant.date, observer, true, true);
  const sunAboveHorizon = Astronomy.Horizon(instant.date, observer, equatorialSun.ra, equatorialSun.dec, "normal").altitude >= 0;
  return {
    utc: instant.date.toISOString(), utcOffset: instant.utcOffset, zodiac: "Tropical", houseSystem: "Whole Sign",
    coordinates: { latitude: input.latitude, longitude: input.longitude },
    angles: {
      ascendant: { longitude: round(angleValues.ascendant), sign: ascendantSign, degree: round(degreeInSign(angleValues.ascendant), 2) },
      midheaven: { longitude: round(angleValues.midheaven), sign: signOf(angleValues.midheaven), degree: round(degreeInSign(angleValues.midheaven), 2) },
    },
    placements, aspects, dominantSignatures: rankSignatures(aspects, chartRuler), chartRuler,
    sect: sunAboveHorizon ? "Day chart" : "Night chart", moonPhase: moonPhase(sun.longitude, moon.longitude),
  };
}
