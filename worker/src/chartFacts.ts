import { calculateNatalSnapshot } from "../../src/lib/natalSnapshot.ts";
import type { WorkerEssentialJob } from "./store.ts";

interface Place { label: string; latitude: number; longitude: number; timezone: string; }

export interface ChartFacts {
  sun: string; moon: string; rising: string; chartRuler: string;
  sect: "Day chart" | "Night chart"; moonPhase: string; focus: string; calculationLimit: string;
}

async function locate(city: string): Promise<Place> {
  const query = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${query}`);
  const value = await response.json() as { results?: Array<{ name?: string; admin1?: string; country?: string; latitude?: number; longitude?: number; timezone?: string }> };
  const place = value.results?.find((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude) && item.timezone);
  if (!place || typeof place.latitude !== "number" || typeof place.longitude !== "number" || !place.timezone) throw new Error("city-not-found");
  return { label: [place.name, place.admin1, place.country].filter(Boolean).join(", "), latitude: place.latitude, longitude: place.longitude, timezone: place.timezone };
}

export async function buildChartFacts(job: WorkerEssentialJob): Promise<ChartFacts> {
  const place = await locate(job.birth.city);
  const snapshot = calculateNatalSnapshot({ date: job.birth.date, time: job.birth.time, latitude: place.latitude, longitude: place.longitude, timezone: place.timezone });
  return { sun: `${snapshot.sunSign} Sun`, moon: `${snapshot.moonSign} Moon`, rising: `${snapshot.risingSign} Rising`, chartRuler: snapshot.chartRuler, sect: snapshot.sect, moonPhase: snapshot.moonPhase.name, focus: job.focus, calculationLimit: "This automated Essential reading interprets Sun, Moon, Rising, chart ruler, sect, Moon phase, and the selected focus. It does not claim a complete house, aspect, dignity, or predictive judgment." };
}
