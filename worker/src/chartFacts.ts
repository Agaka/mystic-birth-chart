import { calculateFullChart, type FullChart } from "./fullChart.ts";
import type { WorkerEssentialJob } from "./store.ts";

interface Place { label: string; latitude: number; longitude: number; timezone: string; }

export interface ChartFacts {
  birth: {
    date: string; time: string; location: string; timezone: string; utcOffset: number;
    latitude: number; longitude: number;
  };
  chart: FullChart;
  focus: string;
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
  const chart = calculateFullChart({ date: job.birth.date, time: job.birth.time, latitude: place.latitude, longitude: place.longitude, timezone: place.timezone });
  return {
    birth: { date: job.birth.date, time: job.birth.time, location: place.label, timezone: place.timezone, utcOffset: chart.utcOffset, latitude: place.latitude, longitude: place.longitude },
    chart,
    focus: job.focus,
  };
}
