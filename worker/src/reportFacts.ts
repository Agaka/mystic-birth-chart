import { createRequire } from "node:module";
import type * as AstronomyTypes from "astronomy-engine";
import { buildChartFacts, type ChartFacts } from "./chartFacts.ts";
import { calculateFullChart, calculateFullChartAtUtc, type FullChart, type Sign } from "./fullChart.ts";
import type { StoredEssentialOrder } from "./store.ts";
import { hermeticCorrespondences, quinanceFor } from "./hermeticCorrespondences.ts";
import { buildNatalEvidence, type NatalEvidence } from "./natalEvidence.ts";
import { buildTimingCycle, selectPrincipalEvents, type TimingCycle } from "./timingEngine.ts";
import { buildSynastryEvidence, type SynastryEvidence } from "./synastryEngine.ts";

const require = createRequire(import.meta.url);
const Astronomy = require("astronomy-engine") as typeof AstronomyTypes;

const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const rulers: Record<string, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };

export type AnnualFacts = {
  cycleYear: number;
  period: { startsAt: string; endsAt: string; returnLocation: string; timezone: string };
  profection: { age: number; house: number; sign: string; lordOfYear: string; natalHousesRuled: number[] };
  solarReturn: FullChart;
  solarReturnEvidence: {
    ascendantRuler: string;
    midheavenRuler: string;
    angularPlanets: string[];
    occupiedHouses: Array<{ house: number; planets: string[] }>;
    natalOverlays: Array<{ planet: string; natalHouse: number }>;
    returnToNatalAspects: Array<{ returnBody: string; natalBody: string; aspect: string; orbLabel: string; outOfSign: boolean }>;
  };
  monthlySky: Array<{ month: number; startsAt: string; chart: FullChart }>;
};

export type ForecastFacts = TimingCycle;

export type AlmanacFacts = {
  month: { startsAt: string; endsAt: string; presentationTimezone: string; sunHouse: number; themeSign: string };
  profection: TimingCycle["profections"][number];
  lunations: Array<{ kind: "New Moon" | "Full Moon"; exactAt: string; sign: string; degreeLabel: string; natalHouse: number; closeNatalContacts: string[] }>;
  timing: TimingCycle;
};

export type ProductFacts = {
  natal: ChartFacts;
  natalEvidence?: NatalEvidence;
  natalTimeKnown: boolean;
  natalReliabilityNote: string;
  partner?: { facts: ChartFacts; timeKnown: boolean; reliabilityNote: string };
  synastry?: SynastryEvidence;
  hermetic?: { version: string; system: string; sources: readonly string[]; planetarySpheres: typeof hermeticCorrespondences.planetarySpheres; selectedQuinances: Array<{ subject: string; sign: string; degreeLabel: string; quinance: ReturnType<typeof quinanceFor> }>; zodiac: typeof hermeticCorrespondences.zodiac };
  annual?: AnnualFacts;
  forecast?: ForecastFacts;
  almanac?: AlmanacFacts;
  almanacHistory?: { title: string; chapterDigests: Array<{ key: string; digest: string }> };
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

function wholeSignHouseSign(ascendant: string, house: number): string {
  return signs[(signs.indexOf(ascendant) + house - 1) % 12];
}

function housesRuled(chart: FullChart, body: string): number[] {
  return Array.from({ length: 12 }, (_, index) => index + 1).filter((house) => rulers[wholeSignHouseSign(chart.angles.ascendant.sign, house)] === body);
}

function aspectBetween(first: number, second: number): { aspect: string; orb: number } | null {
  const distance = Math.abs(((first - second + 540) % 360) - 180);
  const found = [["conjunction", 0], ["sextile", 60], ["square", 90], ["trine", 120], ["opposition", 180]].map(([aspect, angle]) => ({ aspect: String(aspect), orb: Math.abs(distance - Number(angle)) })).sort((a, b) => a.orb - b.orb)[0]!;
  return found.orb <= 3 ? found : null;
}

export function buildSolarReturnEvidence(natal: FullChart, solarReturn: FullChart): AnnualFacts["solarReturnEvidence"] {
  const traditional = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  const natalAscendantIndex = signs.indexOf(natal.angles.ascendant.sign);
  const angularPlanets = solarReturn.placements.filter((item) => [1, 4, 7, 10].includes(item.house)).map((item) => item.body);
  const occupiedHouses = Array.from({ length: 12 }, (_, index) => ({ house: index + 1, planets: solarReturn.placements.filter((item) => item.house === index + 1).map((item) => item.body) })).filter((item) => item.planets.length);
  const natalOverlays = solarReturn.placements.map((item) => ({ planet: item.body, natalHouse: ((signs.indexOf(item.sign) - natalAscendantIndex + 12) % 12) + 1 }));
  const returnToNatalAspects: AnnualFacts["solarReturnEvidence"]["returnToNatalAspects"] = [];
  for (const returning of solarReturn.placements.filter((item) => traditional.includes(item.body))) for (const natalPlacement of natal.placements.filter((item) => traditional.includes(item.body))) {
    const found = aspectBetween(returning.longitude, natalPlacement.longitude); if (!found) continue;
    const rawDistance = Math.abs(signs.indexOf(returning.sign) - signs.indexOf(natalPlacement.sign));
    const signDistance = Math.min(rawDistance, 12 - rawDistance);
    const expected = ({ conjunction: 0, sextile: 2, square: 3, trine: 4, opposition: 6 } as Record<string, number>)[found.aspect];
    returnToNatalAspects.push({ returnBody: returning.body, natalBody: natalPlacement.body, aspect: found.aspect, orbLabel: `${Math.floor(found.orb)}\u00b0${String(Math.round((found.orb % 1) * 60)).padStart(2, "0")}\u2032`, outOfSign: signDistance !== expected });
  }
  return { ascendantRuler: rulers[solarReturn.angles.ascendant.sign], midheavenRuler: rulers[solarReturn.angles.midheaven.sign], angularPlanets, occupiedHouses, natalOverlays, returnToNatalAspects: returnToNatalAspects.sort((a, b) => Number(a.outOfSign) - Number(b.outOfSign) || a.orbLabel.localeCompare(b.orbLabel)).slice(0, 24) };
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
    solarReturnEvidence: buildSolarReturnEvidence(natal.chart, solarReturn),
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

function buildForecastFacts(order: StoredEssentialOrder, natal: ChartFacts): ForecastFacts {
  const timezone = order.forecast?.presentationTimezone || natal.birth.timezone;
  const start = astroDate(order.forecast?.startDate || new Date().toISOString().slice(0, 10), timezone);
  const end = new Date(start); end.setUTCFullYear(end.getUTCFullYear() + 1);
  const localizedNatal = { ...natal, birth: { ...natal.birth, timezone } };
  return selectPrincipalEvents(buildTimingCycle(localizedNatal, start, end), localizedNatal);
}

function moonSignsForUnknown(facts: ChartFacts): Sign[] {
  const input = { date: facts.birth.date, latitude: facts.birth.latitude, longitude: facts.birth.longitude, timezone: facts.birth.timezone };
  const atStart = calculateFullChart({ ...input, time: "00:01" }).placements.find((item) => item.body === "Moon")!.sign;
  const atEnd = calculateFullChart({ ...input, time: "23:59" }).placements.find((item) => item.body === "Moon")!.sign;
  return atStart === atEnd ? [atStart] : [atStart, atEnd];
}

export function buildMonthlyLunations(natal: ChartFacts, start: Date, end: Date): AlmanacFacts["lunations"] {
  const values: AlmanacFacts["lunations"] = [];
  for (const [kind, phase] of [["New Moon", 0], ["Full Moon", 180]] as const) {
    let cursor = new Date(start.getTime() - 2 * 86_400_000);
    for (let guard = 0; guard < 3; guard += 1) {
      const moment = Astronomy.SearchMoonPhase(phase, cursor, 40);
      if (!moment || moment.date >= end) break;
      if (moment.date >= start) {
        const chart = calculateFullChartAtUtc({ latitude: natal.birth.latitude, longitude: natal.birth.longitude, timezone: natal.birth.timezone }, moment.date);
        const moon = chart.placements.find((item) => item.body === "Moon")!;
        const natalHouse = ((signs.indexOf(moon.sign) - signs.indexOf(natal.chart.angles.ascendant.sign) + 12) % 12) + 1;
        const closeNatalContacts = natal.chart.placements.filter((item) => Math.abs(((moon.longitude - item.longitude + 540) % 360) - 180) <= 3).map((item) => `conjunction natal ${item.body}`);
        values.push({ kind, exactAt: moment.date.toISOString(), sign: moon.sign, degreeLabel: moon.degreeLabel, natalHouse, closeNatalContacts });
      }
      cursor = new Date(moment.date.getTime() + 2 * 86_400_000);
    }
  }
  return values.sort((a, b) => Date.parse(a.exactAt) - Date.parse(b.exactAt));
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
  const timing = buildTimingCycle(natal, start, end);
  const profection = timing.profections[0];
  if (!profection) throw new Error("monthly-profection-not-found");
  return {
    month: { startsAt: start.toISOString(), endsAt: end.toISOString(), presentationTimezone: timezone, sunHouse, themeSign: sun.sign },
    profection,
    lunations: buildMonthlyLunations(natal, start, end),
    timing,
  };
}

export async function buildProductFacts(order: StoredEssentialOrder): Promise<ProductFacts> {
  const natalTimeKnown = order.birth.time !== "unknown";
  const natal = await buildChartFacts(natalTimeKnown ? order : { ...order, birth: { ...order.birth, time: "12:00" } });
  if (!natalTimeKnown) natal.birth.time = "Unknown (planetary positions calculated at noon; houses and angles omitted)";
  const facts: ProductFacts = {
    natal,
    natalEvidence: natalTimeKnown ? buildNatalEvidence(natal.chart) : undefined,
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
    facts.synastry = buildSynastryEvidence(natal.chart, partner.chart, {
      firstTimeKnown: natalTimeKnown,
      secondTimeKnown: partnerBirth.timeKnown,
      firstMoonSigns: natalTimeKnown ? undefined : moonSignsForUnknown(natal),
      secondMoonSigns: partnerBirth.timeKnown ? undefined : moonSignsForUnknown(partner),
    });
  }
  if (order.tier === "dossier") {
    facts.annual = await buildAnnualFacts(order, natal);
    facts.forecast = selectPrincipalEvents(buildTimingCycle(natal, new Date(facts.annual.period.startsAt), new Date(facts.annual.period.endsAt)), natal);
  }
  if (order.tier === "year-ahead") facts.forecast = buildForecastFacts(order, natal);
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
