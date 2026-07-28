import type { ChartAspect, ChartBody, FullChart, Placement, Sign } from "./fullChart.ts";

export type TraditionalPlanet = "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";

const signs: Sign[] = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const rulers: Record<Sign, TraditionalPlanet> = { Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter" };
const exaltations: Partial<Record<TraditionalPlanet, Sign>> = { Sun: "Aries", Moon: "Taurus", Mercury: "Virgo", Venus: "Pisces", Mars: "Capricorn", Jupiter: "Cancer", Saturn: "Libra" };
const traditionalPlanets = new Set<ChartBody>(["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]);

export type HouseEvidence = {
  house: number;
  sign: Sign;
  ruler: TraditionalPlanet;
  rulerPlacement: Placement;
  occupants: Placement[];
  rulerAspects: ChartAspect[];
};

export type DispositorEvidence = {
  planet: TraditionalPlanet;
  dispositor: TraditionalPlanet;
  chain: TraditionalPlanet[];
  terminatesIn: "self" | "mutual-reception" | "cycle";
};

export type ReceptionEvidence = {
  kind: "domicile" | "exaltation" | "mutual-domicile";
  planets: TraditionalPlanet[];
  description: string;
};

export type NatalFocusPacket = {
  governingHouse: HouseEvidence;
  supportingHouses: HouseEvidence[];
  planets: Placement[];
  aspects: ChartAspect[];
};

export type NatalEvidence = {
  houses: HouseEvidence[];
  dispositors: DispositorEvidence[];
  receptions: ReceptionEvidence[];
  angularPlanets: Placement[];
  repeatedTestimony: Array<{ planet: TraditionalPlanet; roles: string[]; weight: number }>;
  relationship: NatalFocusPacket;
  vocation: NatalFocusPacket & { midheavenAspects: ChartAspect[]; lots: FullChart["lots"] };
};

function placement(chart: FullChart, body: TraditionalPlanet): Placement {
  const found = chart.placements.find((item) => item.body === body);
  if (!found) throw new Error(`missing-placement-${body.toLowerCase()}`);
  return found;
}

function touches(aspect: ChartAspect, body: ChartAspect["body1"]): boolean {
  return aspect.body1 === body || aspect.body2 === body;
}

function buildHouses(chart: FullChart): HouseEvidence[] {
  const ascendantIndex = signs.indexOf(chart.angles.ascendant.sign);
  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const sign = signs[(ascendantIndex + index) % 12]!;
    const ruler = rulers[sign];
    return {
      house,
      sign,
      ruler,
      rulerPlacement: placement(chart, ruler),
      occupants: chart.placements.filter((item) => item.house === house),
      rulerAspects: chart.aspects.filter((aspect) => touches(aspect, ruler) && !aspect.outOfSign),
    };
  });
}

function buildDispositors(chart: FullChart): DispositorEvidence[] {
  return chart.placements.filter((item) => traditionalPlanets.has(item.body)).map((item) => {
    const planet = item.body as TraditionalPlanet;
    const dispositor = rulers[item.sign];
    const chain: TraditionalPlanet[] = [planet];
    let current = planet;
    for (let steps = 0; steps < 7; steps += 1) {
      const next = rulers[placement(chart, current).sign];
      chain.push(next);
      if (next === current) return { planet, dispositor, chain, terminatesIn: "self" as const };
      const nextDispositor = rulers[placement(chart, next).sign];
      if (nextDispositor === current) return { planet, dispositor, chain, terminatesIn: "mutual-reception" as const };
      if (chain.slice(0, -1).includes(next)) return { planet, dispositor, chain, terminatesIn: "cycle" as const };
      current = next;
    }
    return { planet, dispositor, chain, terminatesIn: "cycle" as const };
  });
}

function buildReceptions(chart: FullChart): ReceptionEvidence[] {
  const planets = chart.placements.filter((item) => traditionalPlanets.has(item.body)) as Array<Placement & { body: TraditionalPlanet }>;
  const result: ReceptionEvidence[] = [];
  for (const item of planets) {
    const receiver = rulers[item.sign];
    if (receiver !== item.body) result.push({ kind: "domicile", planets: [receiver, item.body], description: `${receiver} receives ${item.body} by domicile.` });
    const exaltationReceiver = (Object.entries(exaltations) as Array<[TraditionalPlanet, Sign]>).find(([, sign]) => sign === item.sign)?.[0];
    if (exaltationReceiver && exaltationReceiver !== item.body) result.push({ kind: "exaltation", planets: [exaltationReceiver, item.body], description: `${exaltationReceiver} receives ${item.body} by exaltation.` });
  }
  for (let first = 0; first < planets.length; first += 1) for (let second = first + 1; second < planets.length; second += 1) {
    const a = planets[first]!; const b = planets[second]!;
    if (rulers[a.sign] === b.body && rulers[b.sign] === a.body) result.push({ kind: "mutual-domicile", planets: [a.body, b.body], description: `${a.body} and ${b.body} receive one another by domicile.` });
  }
  return result;
}

function focusPacket(chart: FullChart, houses: HouseEvidence[], governing: number, supporting: number[], planetNames: TraditionalPlanet[]): NatalFocusPacket {
  const planets = planetNames.map((body) => placement(chart, body));
  const relevantBodies = new Set<ChartAspect["body1"]>([...planetNames, houses[governing - 1]!.ruler]);
  return {
    governingHouse: houses[governing - 1]!,
    supportingHouses: supporting.map((house) => houses[house - 1]!),
    planets,
    aspects: chart.aspects.filter((aspect) => !aspect.outOfSign && (relevantBodies.has(aspect.body1) || relevantBodies.has(aspect.body2))),
  };
}

function repeatedTestimony(chart: FullChart, houses: HouseEvidence[]): NatalEvidence["repeatedTestimony"] {
  const sectLight: TraditionalPlanet = chart.sect === "Day chart" ? "Sun" : "Moon";
  return (["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as TraditionalPlanet[]).map((planet) => {
    const item = placement(chart, planet);
    const roles: string[] = [];
    if (planet === chart.chartRuler) roles.push("chart ruler");
    if (planet === sectLight) roles.push("sect light");
    const ruled = houses.filter((house) => house.ruler === planet).map((house) => house.house);
    if (ruled.length) roles.push(`ruler of houses ${ruled.join(", ")}`);
    if ([1, 4, 7, 10].includes(item.house)) roles.push("angular planet");
    if (item.dignities.length) roles.push(item.dignities.join(" and "));
    const closeAspects = chart.aspects.filter((aspect) => !aspect.outOfSign && aspect.orb <= 3 && touches(aspect, planet)).length;
    if (closeAspects) roles.push(`${closeAspects} close traditional aspect${closeAspects === 1 ? "" : "s"}`);
    return { planet, roles, weight: roles.length };
  }).sort((a, b) => b.weight - a.weight);
}

export function buildNatalEvidence(chart: FullChart): NatalEvidence {
  const houses = buildHouses(chart);
  const relationship = focusPacket(chart, houses, 7, [5, 8, 4], ["Venus", "Moon", "Mars", "Mercury", "Saturn", "Jupiter"]);
  const vocationBase = focusPacket(chart, houses, 10, [2, 6, 9, 11], ["Sun", "Mercury", "Mars", "Jupiter", "Saturn", chart.chartRuler]);
  return {
    houses,
    dispositors: buildDispositors(chart),
    receptions: buildReceptions(chart),
    angularPlanets: chart.placements.filter((item) => [1, 4, 7, 10].includes(item.house)),
    repeatedTestimony: repeatedTestimony(chart, houses),
    relationship,
    vocation: { ...vocationBase, midheavenAspects: chart.aspects.filter((aspect) => touches(aspect, "Midheaven")), lots: chart.lots },
  };
}
