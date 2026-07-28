import { createRequire } from "node:module";
import type * as AstronomyTypes from "astronomy-engine";
import { buildChartFacts, type ChartFacts } from "./chartFacts.ts";
import { calculateFullChartAtUtc, type FullChart } from "./fullChart.ts";
import type { StoredEssentialOrder } from "./store.ts";

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

export type ProductFacts = {
  natal: ChartFacts;
  partner?: ChartFacts;
  annual?: AnnualFacts;
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

function parsePartnerBirth(value: string): { date: string; time: string; city: string } {
  const date = value.match(/\b(19|20)\d{2}-\d{2}-\d{2}\b/)?.[0] || "";
  const time = value.match(/\b([01]\d|2[0-3]):[0-5]\d\b/)?.[0] || "";
  const remainder = value.replace(date, "").replace(time, "").replace(/^[\s,|;:-]+|[\s,|;:-]+$/g, "");
  const city = remainder.replace(/^(?:name|partner|birth(?:\s+city)?|city)\s*[:=-]?\s*/i, "").trim();
  if (!date || !time || city.length < 3) throw new Error("partner-birth-details-incomplete");
  return { date, time, city };
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

export async function buildProductFacts(order: StoredEssentialOrder): Promise<ProductFacts> {
  const natal = await buildChartFacts(order);
  const facts: ProductFacts = { natal, generatedAt: new Date().toISOString() };
  if (order.tier === "synastry") {
    const partnerBirth = parsePartnerBirth(order.partnerData || "");
    facts.partner = await buildChartFacts({ ...order, birth: partnerBirth, focus: "synastry" });
  }
  if (order.tier === "year-ahead" || order.tier === "dossier") facts.annual = await buildAnnualFacts(order, natal);
  return facts;
}
