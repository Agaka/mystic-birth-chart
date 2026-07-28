import { createRequire } from "node:module";
import type * as AstronomyTypes from "astronomy-engine";
import { buildChartFacts, type ChartFacts } from "./chartFacts.ts";
import { calculateFullChartAtUtc, type FullChart } from "./fullChart.ts";
import type { StoredEssentialOrder } from "./store.ts";
import { hermeticCorrespondences, quinanceFor } from "./hermeticCorrespondences.ts";

const require = createRequire(import.meta.url);
const Astronomy = require("astronomy-engine") as typeof AstronomyTypes;

const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const rulers: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };

export type AnnualFacts = {
  cycleYear: number;
  period: { startsAt: string; endsAt: string; returnLocation: string; timezone: string };
  profection: { age: number; house: number; sign: string; lordOfYear: string; natalHousesRuled: number[] };
  solarReturn: FullChart;
  monthlySky: Array<{ month: number; startsAt: string; chart: FullChart }>;
};

export type ForecastFacts = {
  period: { startsAt: string; endsAt: string; presentationTimezone: string };
  profections: Array<{ startsAt: string; endsAt: string; house: number; sign: string; lordOfYear: string }>;
  monthlySky: Array<{ month: number; startsAt: string; chart: FullChart }>;
  activations: Array<{ date: string; transit: string; target: string; aspect: string; orbLabel: string; category: "expansion" | "pressure" | "review" | "decision" }>;
};

export type AlmanacFacts = {
  month: { startsAt: string; endsAt: string; presentationTimezone: string; sunHouse: number; themeSign: string };
  profection: ForecastFacts["profections"][number];
  activations: ForecastFacts["activations"];
};

export type ProductFacts = {
  natal: ChartFacts;
  natalTimeKnown: boolean;
  natalReliabilityNote: string;
  partner?: { facts: ChartFacts; timeKnown: boolean; reliabilityNote: string };
  synastry?: Array<{ bodyA: string; bodyB: string; aspect: string; orbLabel: string; classification: "supportive" | "demanding" | "mixed" | "highly consequential" }>;
  hermetic?: { version: string; system: string; sources: readonly string[]; planetarySpheres: typeof hermeticCorrespondences.planetarySpheres; selectedQuinances: Array<{ subject: string; sign: string; degreeLabel: string; quinance: ReturnType<typeof quinanceFor> }>; zodiac: typeof hermeticCorrespondences.zodiac };
  annual?: AnnualFacts;
  forecast?: ForecastFacts;
  almanac?: AlmanacFacts;
  generatedAt: string;
};

type Place = { label: string; latitude: number; longitude: number; timezone: string };

async function locate(city: string): Promise<Place> {
  const query = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${query}`);
  const value = await response.json() as { results?: Array<{ name?: string; admin1?: string; country?: string; latitude?: number; longitude?: number; timezone?: string }> };
  const place = value.results?.find((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude) && item.timezone);
  if (!place || typeof place.latitude !== "number" || typeof place.longitude !== "number" || !place.timezone) throw new Error("city-not-found");
  return { label: [place.name, place.admin1, place.country].filter(Boolean).join(", "), latitude: place.latitude, longitude: place.longitude, timezone: place.timezone };
}

function parsePartnerBirth(value: string): { date: string; time: string; city: string; timeKnown: boolean } {
  const parts = value.split(/[\n|;,]+/).map((part) => part.trim()).filter(Boolean);
  const dateIndex = parts.findIndex((part) => /^\d{4}-\d{2}-\d{2}$/.test(part));
  const date = dateIndex >= 0 ? parts[dateIndex]! : "";
  const timeIndex = parts.findIndex((part) => /^([01]\d|2[0-3]):[0-5]\d$/.test(part) || /^unknown$/i.test(part));
  const timeRaw = timeIndex >= 0 ? parts[timeIndex]! : "";
  const timeKnown = /^([01]\d|2[0-3]):[0-5]\d$/.test(timeRaw);
  const cityStart = Math.max(dateIndex, timeIndex) + 1;
  const city = parts.slice(cityStart).join(", ") || "";
  if (!date || !timeRaw || city.length < 3) throw new Error("partner-birth-details-incomplete");
  return { date, time: timeKnown ? timeRaw : "12:00", city, timeKnown };
}

function synastryContacts(a: ChartFacts, b: ChartFacts, timesKnown: boolean): NonNullable<ProductFacts["synastry"]> {
  const aspects: Array<[string, number, "supportive" | "demanding" | "mixed" | "highly consequential"]> = [["conjunction", 0, "highly consequential"], ["sextile", 60, "supportive"], ["square", 90, "demanding"], ["trine", 120, "supportive"], ["opposition", 180, "mixed"]];
  const contacts: Array<NonNullable<ProductFacts["synastry"]>[number] & { score: number }> = [];
  for (const first of a.chart.placements.filter((placement) => ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(placement.body))) for (const second of b.chart.placements.filter((placement) => ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(placement.body))) {
    const distance = angularDistance(first.longitude, second.longitude);
    for (const [aspect, angle, classification] of aspects) {
      const orb = Math.abs(distance - angle); if (orb > 5) continue;
      contacts.push({ bodyA: first.body, bodyB: second.body, aspect, orbLabel: labelOrb(orb), classification: orb < 1 ? "highly consequential" : classification, score: orb });
    }
  }
  if (timesKnown) {
    const angles = [{ bodyA: "Ascendant", longitude: a.chart.angles.ascendant.longitude }, { bodyA: "Midheaven", longitude: a.chart.angles.midheaven.longitude }];
    for (const first of angles) for (const second of b.chart.placements.filter((placement) => ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(placement.body))) {
      const found = transitAspect(first.longitude, second.longitude); if (!found || found.orb > 3) continue;
      contacts.push({ bodyA: first.bodyA, bodyB: second.body, aspect: found.aspect, orbLabel: labelOrb(found.orb), classification: found.orb < 1 ? "highly consequential" : found.aspect === "square" ? "demanding" : "mixed", score: found.orb });
    }
  }
  return contacts.sort((x, y) => x.score - y.score).slice(0, 24).map(({ score: _score, ...contact }) => contact);
}

function wholeSignHouseSign(ascendant: string, house: number): string {
  return signs[(signs.indexOf(ascendant) + house - 1) % 12];
}

function housesRuled(chart: FullChart, body: string): number[] {
  return Array.from({ length: 12 }, (_, index) => index + 1).filter((house) => rulers[wholeSignHouseSign(chart.angles.ascendant.sign, house)] === body);
}

async function buildAnnualFacts(order: StoredEssentialOrder, natal: ChartFacts): Promise<AnnualFacts> {
  const cycleYear = order.annual?.cycleYear || new Date().getUTCFullYear();
  const returnPlace = await locate(order.annual?.returnCity || natal.birth.location);
  const natalSun = natal.chart.placements.find((placement) => placement.body === "Sun");
  if (!natalSun) throw new Error("natal-sun-not-found");
  const [birthYear, birthMonth, birthDay] = order.birth.date.split("-").map(Number);
  const start = new Date(Date.UTC(cycleYear, birthMonth - 1, Math.max(1, birthDay - 4), 0, 0, 0));
  const moment = Astronomy.SearchSunLongitude(natalSun.longitude, start, 12);
  if (!moment) throw new Error("solar-return-not-found");
  const solarReturn = calculateFullChartAtUtc(returnPlace, moment.date);
  const nextStart = new Date(moment.date); nextStart.setUTCFullYear(nextStart.getUTCFullYear() + 1);
  const age = cycleYear - birthYear;
  const profectionHouse = (age % 12) + 1;
  const profectionSign = wholeSignHouseSign(natal.chart.angles.ascendant.sign, profectionHouse);
  const lordOfYear = rulers[profectionSign];
  const monthlySky = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(moment.date);
    date.setUTCMonth(date.getUTCMonth() + index);
    return { month: index + 1, startsAt: date.toISOString(), chart: calculateFullChartAtUtc(returnPlace, date) };
  });
  return {
    cycleYear,
    period: { startsAt: moment.date.toISOString(), endsAt: nextStart.toISOString(), returnLocation: returnPlace.label, timezone: returnPlace.timezone },
    profection: { age, house: profectionHouse, sign: profectionSign, lordOfYear, natalHousesRuled: housesRuled(natal.chart, lordOfYear) },
    solarReturn,
    monthlySky,
  };
}

function astroDate(value: string, timezone: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  const presumed = Date.UTC(year, month - 1, day, 12, 0, 0);
  const offset = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "longOffset" }).formatToParts(new Date(presumed)).find((part) => part.type === "timeZoneName")?.value || "GMT";
  const match = offset.match(/GMT([+-])(\d{2}):(\d{2})/);
  const minutes = match ? (Number(match[2]) * 60 + Number(match[3])) * (match[1] === "+" ? 1 : -1) : 0;
  return new Date(presumed - minutes * 60_000);
}

function angularDistance(a: number, b: number): number { const raw = Math.abs(((a - b + 540) % 360) - 180); return Math.min(raw, 360 - raw); }
function transitAspect(a: number, b: number): { aspect: string; orb: number } | null {
  const distance = angularDistance(a, b);
  const candidates: Array<[string, number]> = [["conjunction", 0], ["sextile", 60], ["square", 90], ["trine", 120], ["opposition", 180]];
  const closest = candidates.map(([aspect, angle]) => ({ aspect, orb: Math.abs(distance - angle) })).sort((x, y) => x.orb - y.orb)[0]!;
  return closest.orb <= 0.35 ? closest : null;
}

function labelOrb(value: number): string { const degree = Math.floor(value); const minute = Math.round((value - degree) * 60); return `${degree}\u00b0${String(minute).padStart(2, "0")}\u2032`; }

function forecastProfections(natal: ChartFacts, start: Date, end: Date): ForecastFacts["profections"] {
  const birth = natal.birth.date.split("-").map(Number); const ascIndex = signs.indexOf(natal.chart.angles.ascendant.sign);
  const points: Date[] = [start];
  for (let year = start.getUTCFullYear() - 1; year <= end.getUTCFullYear() + 1; year += 1) {
    const birthday = new Date(Date.UTC(year, birth[1] - 1, birth[2], 12)); if (birthday > start && birthday < end) points.push(birthday);
  }
  points.push(end); points.sort((a, b) => a.getTime() - b.getTime());
  return points.slice(0, -1).map((from, index) => {
    const age = from.getUTCFullYear() - birth[0] - (from.getUTCMonth() + 1 < birth[1] || (from.getUTCMonth() + 1 === birth[1] && from.getUTCDate() < birth[2]) ? 1 : 0);
    const house = (age % 12) + 1; const sign = signs[(ascIndex + house - 1) % 12]!;
    return { startsAt: from.toISOString(), endsAt: points[index + 1]!.toISOString(), house, sign, lordOfYear: rulers[sign]! };
  });
}

function buildTransitActivations(natal: ChartFacts, start: Date, end: Date): ForecastFacts["activations"] {
  const targets = [
    ...natal.chart.placements.filter((placement) => ["Sun", "Moon", natal.chart.chartRuler].includes(placement.body)).map((placement) => ({ label: placement.body, longitude: placement.longitude })),
    { label: "Ascendant", longitude: natal.chart.angles.ascendant.longitude }, { label: "Midheaven", longitude: natal.chart.angles.midheaven.longitude },
  ];
  const entries: Array<ForecastFacts["activations"][number] & { score: number }> = [];
  for (let point = new Date(start); point <= end; point.setUTCDate(point.getUTCDate() + 1)) {
    const sky = calculateFullChartAtUtc({ latitude: natal.birth.latitude, longitude: natal.birth.longitude, timezone: natal.birth.timezone }, point);
    for (const transit of sky.placements.filter((placement) => ["Jupiter", "Saturn", "Mars", "Mercury", "Venus"].includes(placement.body))) for (const target of targets) {
      const found = transitAspect(transit.longitude, target.longitude); if (!found) continue;
      const category = transit.body === "Jupiter" ? "expansion" : transit.body === "Saturn" ? "pressure" : transit.body === "Mercury" ? "review" : transit.body === "Mars" ? "decision" : "expansion";
      entries.push({ date: point.toISOString(), transit: transit.body, target: target.label, aspect: found.aspect, orbLabel: labelOrb(found.orb), category, score: found.orb });
    }
  }
  const selected: typeof entries = [];
  for (const candidate of entries.sort((a, b) => a.score - b.score)) {
    const nearDuplicate = selected.some((existing) => existing.transit === candidate.transit && existing.target === candidate.target && existing.aspect === candidate.aspect && Math.abs(Date.parse(existing.date) - Date.parse(candidate.date)) < 9 * 86_400_000);
    if (!nearDuplicate) selected.push(candidate);
    if (selected.length === 15) break;
  }
  return selected.map(({ score: _score, ...item }) => item);
}

function buildForecastFacts(order: StoredEssentialOrder, natal: ChartFacts): ForecastFacts {
  const timezone = order.forecast?.presentationTimezone || natal.birth.timezone;
  const start = astroDate(order.forecast?.startDate || new Date().toISOString().slice(0, 10), timezone);
  const end = new Date(start); end.setUTCFullYear(end.getUTCFullYear() + 1);
  const monthlySky = Array.from({ length: 12 }, (_, index) => { const date = new Date(start); date.setUTCMonth(date.getUTCMonth() + index); return { month: index + 1, startsAt: date.toISOString(), chart: calculateFullChartAtUtc({ latitude: natal.birth.latitude, longitude: natal.birth.longitude, timezone }, date) }; });
  return { period: { startsAt: start.toISOString(), endsAt: end.toISOString(), presentationTimezone: timezone }, profections: forecastProfections(natal, start, end), monthlySky, activations: buildTransitActivations(natal, start, end) };
}

function buildAlmanacFacts(order: StoredEssentialOrder, natal: ChartFacts): AlmanacFacts {
  const timezone = natal.birth.timezone;
  const monthParts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit" }).formatToParts(new Date());
  const year = Number(monthParts.find((part) => part.type === "year")?.value);
  const month = Number(monthParts.find((part) => part.type === "month")?.value);
  const start = astroDate(`${year}-${String(month).padStart(2, "0")}-01`, timezone);
  const end = new Date(start); end.setUTCMonth(end.getUTCMonth() + 1);
  const sky = calculateFullChartAtUtc({ latitude: natal.birth.latitude, longitude: natal.birth.longitude, timezone }, start);
  const sun = sky.placements.find((placement) => placement.body === "Sun");
  if (!sun) throw new Error("monthly-sun-not-found");
  const sunHouse = ((signs.indexOf(sun.sign) - signs.indexOf(natal.chart.angles.ascendant.sign) + 12) % 12) + 1;
  const profection = forecastProfections(natal, start, end)[0];
  if (!profection) throw new Error("monthly-profection-not-found");
  return {
    month: { startsAt: start.toISOString(), endsAt: end.toISOString(), presentationTimezone: timezone, sunHouse, themeSign: sun.sign },
    profection,
    activations: buildTransitActivations(natal, start, end).slice(0, 6),
  };
}

export async function buildProductFacts(order: StoredEssentialOrder): Promise<ProductFacts> {
  const natalTimeKnown = order.birth.time !== "unknown";
  const natal = await buildChartFacts(natalTimeKnown ? order : { ...order, birth: { ...order.birth, time: "12:00" } });
  if (!natalTimeKnown) natal.birth.time = "Unknown (planetary positions calculated at noon; houses and angles omitted)";
  const facts: ProductFacts = {
    natal,
    natalTimeKnown,
    natalReliabilityNote: natalTimeKnown
      ? "Birth time supplied; angles and whole-sign houses may be used."
      : "Birth time unknown; do not use houses, Ascendant, Midheaven, sect, chart ruler, or house overlays for this person.",
    generatedAt: new Date().toISOString(),
  };
  if (order.tier === "synastry") {
    const partnerBirth = parsePartnerBirth(order.partnerData || "");
    const partner = await buildChartFacts({ ...order, birth: { date: partnerBirth.date, time: partnerBirth.time, city: partnerBirth.city }, focus: "synastry" });
    if (!partnerBirth.timeKnown) partner.birth.time = "Unknown (planetary positions calculated at noon; houses and angles omitted)";
    facts.partner = { facts: partner, timeKnown: partnerBirth.timeKnown, reliabilityNote: partnerBirth.timeKnown ? "Birth time supplied; angles and whole-sign houses may be used." : "Birth time unknown; do not use houses, Ascendant, Midheaven, sect, chart ruler, or house overlays for this person." };
    facts.synastry = synastryContacts(natal, partner, natalTimeKnown && partnerBirth.timeKnown);
  }
  if (order.tier === "year-ahead" || order.tier === "dossier") facts.annual = await buildAnnualFacts(order, natal);
  if (order.tier === "year-ahead") { delete facts.annual; facts.forecast = buildForecastFacts(order, natal); }
  if (order.tier === "almanac") facts.almanac = buildAlmanacFacts(order, natal);
  if (order.tier === "kabbalah") {
    const select = ["Sun", "Moon", natal.chart.chartRuler].map((body) => natal.chart.placements.find((placement) => placement.body === body)!).filter(Boolean);
    facts.hermetic = {
      version: hermeticCorrespondences.version,
      system: hermeticCorrespondences.system,
      sources: hermeticCorrespondences.sources,
      planetarySpheres: hermeticCorrespondences.planetarySpheres,
      zodiac: hermeticCorrespondences.zodiac,
      selectedQuinances: [
        ...select.map((placement) => ({ subject: placement.body, sign: placement.sign, degreeLabel: placement.degreeLabel, quinance: quinanceFor(placement.sign, placement.degree) })),
        { subject: "Ascendant", sign: natal.chart.angles.ascendant.sign, degreeLabel: natal.chart.angles.ascendant.degreeLabel, quinance: quinanceFor(natal.chart.angles.ascendant.sign, natal.chart.angles.ascendant.degree) },
        { subject: "Midheaven", sign: natal.chart.angles.midheaven.sign, degreeLabel: natal.chart.angles.midheaven.degreeLabel, quinance: quinanceFor(natal.chart.angles.midheaven.sign, natal.chart.angles.midheaven.degree) },
      ],
    };
  }
  return facts;
}
