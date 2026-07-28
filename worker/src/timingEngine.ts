import type { ChartBody, AspectType, Sign } from "./fullChart.ts";
import { calculateFullChartAtUtc } from "./fullChart.ts";
import type { ChartFacts } from "./chartFacts.ts";

type TransitBody = "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";
type TargetBody = ChartBody | "Ascendant" | "Midheaven";
type EventCategory = "expansion" | "pressure" | "review" | "decision" | "relationship";

export type TimingEvent = {
  applyingAt: string;
  exactAt: string;
  separatingAt: string;
  transit: TransitBody;
  target: TargetBody;
  aspect: AspectType;
  exactOrb: number;
  orbRule: number;
  direction: "direct" | "retrograde";
  category: EventCategory;
  technique: "natal transit";
};

export type TimingCycle = {
  period: { startsAt: string; endsAt: string; timezone: string };
  profections: Array<{ startsAt: string; endsAt: string; age: number; house: number; sign: Sign; lordOfYear: string }>;
  months: Array<{ month: number; startsAt: string; endsAt: string; eventIndexes: number[] }>;
  events: TimingEvent[];
  convergences: Array<{ startsAt: string; endsAt: string; events: number[] }>;
};

const signs: Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const rulers: Record<Sign, string> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };
const aspects: Array<[AspectType, number]> = [["conjunction", 0], ["sextile", 60], ["square", 90], ["trine", 120], ["opposition", 180]];
const transits: TransitBody[] = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const day = 86_400_000;

function angularDistance(a: number, b: number): number { return Math.abs(((a - b + 540) % 360) - 180); }
function aspectError(transit: number, target: number, angle: number): number { return Math.abs(angularDistance(transit, target) - angle); }
function dateAt(value: number): Date { return new Date(value); }

function skyAt(natal: ChartFacts, date: Date) {
  return calculateFullChartAtUtc({ latitude: natal.birth.latitude, longitude: natal.birth.longitude, timezone: natal.birth.timezone }, date);
}

function transitLongitude(natal: ChartFacts, body: TransitBody, time: number): number {
  return skyAt(natal, dateAt(time)).placements.find((item) => item.body === body)!.longitude;
}

function refineMinimum(natal: ChartFacts, body: TransitBody, target: number, angle: number, from: number, to: number): { time: number; error: number } {
  let left = from; let right = to;
  for (let index = 0; index < 34; index += 1) {
    const first = left + (right - left) / 3;
    const second = right - (right - left) / 3;
    const firstError = aspectError(transitLongitude(natal, body, first), target, angle);
    const secondError = aspectError(transitLongitude(natal, body, second), target, angle);
    if (firstError <= secondError) right = second; else left = first;
  }
  const time = (left + right) / 2;
  return { time, error: aspectError(transitLongitude(natal, body, time), target, angle) };
}

function findWindowBoundary(natal: ChartFacts, body: TransitBody, target: number, angle: number, exact: number, orb: number, direction: -1 | 1): number {
  let inside = exact;
  let outside = exact;
  for (let index = 1; index <= 30; index += 1) {
    const candidate = exact + direction * index * day;
    if (aspectError(transitLongitude(natal, body, candidate), target, angle) > orb) { outside = candidate; break; }
    inside = candidate;
  }
  if (outside === exact) return exact;
  let low = Math.min(inside, outside); let high = Math.max(inside, outside);
  for (let index = 0; index < 28; index += 1) {
    const middle = (low + high) / 2;
    const error = aspectError(transitLongitude(natal, body, middle), target, angle);
    if (direction < 0 ? error > orb : error <= orb) low = middle; else high = middle;
  }
  return (low + high) / 2;
}

function eventCategory(body: TransitBody): EventCategory {
  if (body === "Jupiter") return "expansion";
  if (body === "Saturn") return "pressure";
  if (body === "Mercury") return "review";
  if (body === "Venus") return "relationship";
  return "decision";
}

function orbRule(body: TransitBody): number { return body === "Jupiter" || body === "Saturn" ? 2 : body === "Mars" ? 1.5 : 1.2; }

function buildEvents(natal: ChartFacts, start: Date, end: Date): TimingEvent[] {
  const allTargets: Array<{ body: TargetBody; longitude: number }> = [
    ...natal.chart.placements.filter((item) => ["Sun", "Moon", natal.chart.chartRuler].includes(item.body)).map((item) => ({ body: item.body as TargetBody, longitude: item.longitude })),
    { body: "Ascendant", longitude: natal.chart.angles.ascendant.longitude },
    { body: "Midheaven", longitude: natal.chart.angles.midheaven.longitude },
  ];
  const targetRows = allTargets.filter((item, index, all) => all.findIndex((candidate) => candidate.body === item.body) === index);
  const sampleTimes: number[] = [];
  for (let time = start.getTime() - day; time <= end.getTime() + day; time += day) sampleTimes.push(time);
  const samples = sampleTimes.map((time) => ({ time, chart: skyAt(natal, dateAt(time)) }));
  const found: TimingEvent[] = [];
  for (const body of transits) for (const target of targetRows) for (const [aspect, angle] of aspects) {
    const errors = samples.map((sample) => aspectError(sample.chart.placements.find((item) => item.body === body)!.longitude, target.longitude, angle));
    for (let index = 1; index < errors.length - 1; index += 1) {
      if (errors[index]! > errors[index - 1]! || errors[index]! > errors[index + 1]! || errors[index]! > 2.5) continue;
      const exact = refineMinimum(natal, body, target.longitude, angle, sampleTimes[index - 1]!, sampleTimes[index + 1]!);
      if (exact.error > 0.03 || exact.time < start.getTime() || exact.time >= end.getTime()) continue;
      if (found.some((item) => item.transit === body && item.target === target.body && item.aspect === aspect && Math.abs(Date.parse(item.exactAt) - exact.time) < 36 * 3_600_000)) continue;
      const orb = orbRule(body);
      const before = transitLongitude(natal, body, exact.time - 6 * 3_600_000);
      const after = transitLongitude(natal, body, exact.time + 6 * 3_600_000);
      const motion = ((after - before + 540) % 360) - 180;
      found.push({
        applyingAt: dateAt(findWindowBoundary(natal, body, target.longitude, angle, exact.time, orb, -1)).toISOString(),
        exactAt: dateAt(exact.time).toISOString(),
        separatingAt: dateAt(findWindowBoundary(natal, body, target.longitude, angle, exact.time, orb, 1)).toISOString(),
        transit: body,
        target: target.body,
        aspect,
        exactOrb: Number(exact.error.toFixed(4)),
        orbRule: orb,
        direction: motion < 0 ? "retrograde" : "direct",
        category: eventCategory(body),
        technique: "natal transit",
      });
    }
  }
  return found.sort((a, b) => Date.parse(a.exactAt) - Date.parse(b.exactAt));
}

function ageAt(birth: number[], date: Date): number {
  const [year, month, dayOfMonth] = birth;
  const beforeBirthday = date.getUTCMonth() + 1 < month! || (date.getUTCMonth() + 1 === month && date.getUTCDate() < dayOfMonth!);
  return date.getUTCFullYear() - year! - (beforeBirthday ? 1 : 0);
}

function profections(natal: ChartFacts, start: Date, end: Date): TimingCycle["profections"] {
  const birth = natal.birth.date.split("-").map(Number);
  const boundaries = [new Date(start)];
  for (let year = start.getUTCFullYear(); year <= end.getUTCFullYear(); year += 1) {
    const birthday = new Date(Date.UTC(year, birth[1]! - 1, birth[2]!, 0, 0, 0));
    if (birthday > start && birthday < end) boundaries.push(birthday);
  }
  boundaries.push(new Date(end)); boundaries.sort((a, b) => a.getTime() - b.getTime());
  const ascendant = signs.indexOf(natal.chart.angles.ascendant.sign);
  return boundaries.slice(0, -1).map((from, index) => {
    const age = ageAt(birth, from); const house = (age % 12) + 1; const sign = signs[(ascendant + house - 1) % 12]!;
    return { startsAt: from.toISOString(), endsAt: boundaries[index + 1]!.toISOString(), age, house, sign, lordOfYear: rulers[sign] };
  });
}

function months(start: Date, end: Date, events: TimingEvent[]): TimingCycle["months"] {
  const result: TimingCycle["months"] = [];
  for (let current = new Date(start), index = 1; current < end; index += 1) {
    const next = new Date(current); next.setUTCMonth(next.getUTCMonth() + 1); if (next > end) next.setTime(end.getTime());
    const fromTime = current.getTime(); const toTime = next.getTime();
    result.push({ month: index, startsAt: current.toISOString(), endsAt: next.toISOString(), eventIndexes: events.map((event, eventIndex) => ({ event, eventIndex })).filter(({ event }) => Date.parse(event.exactAt) >= fromTime && Date.parse(event.exactAt) < toTime).map(({ eventIndex }) => eventIndex) });
    current = next;
  }
  return result;
}

function convergences(events: TimingEvent[]): TimingCycle["convergences"] {
  const groups: TimingCycle["convergences"] = [];
  for (let index = 0; index < events.length; index += 1) {
    const end = events.findIndex((event, candidate) => candidate > index && Date.parse(event.exactAt) - Date.parse(events[index]!.exactAt) > 7 * day);
    const last = end === -1 ? events.length : end;
    const indexes = Array.from({ length: last - index }, (_, offset) => index + offset);
    if (indexes.length < 2 || new Set(indexes.map((item) => `${events[item]!.transit}:${events[item]!.target}`)).size < 2) continue;
    const group = { startsAt: events[index]!.exactAt, endsAt: events[indexes.at(-1)!]!.exactAt, events: indexes };
    if (!groups.some((existing) => existing.events.some((item) => group.events.includes(item)))) groups.push(group);
  }
  return groups;
}

export function buildTimingCycle(natal: ChartFacts, start: Date, end: Date): TimingCycle {
  if (!(start < end)) throw new Error("invalid-timing-period");
  const events = buildEvents(natal, start, end);
  return {
    period: { startsAt: start.toISOString(), endsAt: end.toISOString(), timezone: natal.birth.timezone },
    profections: profections(natal, start, end),
    months: months(start, end, events),
    events,
    convergences: convergences(events),
  };
}

export function selectPrincipalEvents(cycle: TimingCycle, natal: ChartFacts, maximum = 15): TimingCycle {
  const lords = new Set(cycle.profections.map((item) => item.lordOfYear));
  const score = (event: TimingEvent): number => {
    let value = Math.max(0, 4 - event.exactOrb);
    if (event.target === natal.chart.chartRuler) value += 10;
    if (event.target === "Sun" || event.target === "Moon") value += 8;
    if (event.target === "Ascendant" || event.target === "Midheaven") value += 7;
    if (lords.has(event.target)) value += 9;
    if (event.transit === "Saturn" || event.transit === "Jupiter") value += 6;
    if (event.transit === "Mars") value += 3;
    return value;
  };
  const selected = cycle.events.map((event, index) => ({ event, index, score: score(event) })).sort((a, b) => b.score - a.score || Date.parse(a.event.exactAt) - Date.parse(b.event.exactAt)).slice(0, maximum).sort((a, b) => Date.parse(a.event.exactAt) - Date.parse(b.event.exactAt));
  const originalToNew = new Map(selected.map((item, index) => [item.index, index]));
  const events = selected.map((item) => item.event);
  return {
    ...cycle,
    events,
    months: cycle.months.map((month) => ({ ...month, eventIndexes: month.eventIndexes.filter((index) => originalToNew.has(index)).map((index) => originalToNew.get(index)!) })),
    convergences: cycle.convergences.map((group) => ({ ...group, events: group.events.filter((index) => originalToNew.has(index)).map((index) => originalToNew.get(index)!) })).filter((group) => group.events.length >= 2),
  };
}
