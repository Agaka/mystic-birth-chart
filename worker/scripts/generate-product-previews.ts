import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { calculateFullChart, calculateFullChartAtUtc } from "../src/fullChart.ts";
import { hermeticCorrespondences, quinanceFor } from "../src/hermeticCorrespondences.ts";
import { buildNatalEvidence } from "../src/natalEvidence.ts";
import { createDossierSummaryPdf, createProductPdf } from "../src/productPdf.ts";
import { reportCatalog } from "../src/reportCatalog.ts";
import { buildSolarReturnEvidence, type ProductFacts } from "../src/reportFacts.ts";
import { buildSynastryEvidence } from "../src/synastryEngine.ts";
import { buildTimingCycle, selectPrincipalEvents } from "../src/timingEngine.ts";

const outputDirectory = resolve(import.meta.dirname, "../../tmp/pdfs");
const birth = { date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" };
const partnerBirth = { date: "2000-09-27", time: "01:28", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" };
const chart = calculateFullChart(birth);
const partnerChart = calculateFullChart(partnerBirth);
const natal = { birth: { ...birth, location: "Porto Alegre, Rio Grande do Sul, Brazil", utcOffset: -3 }, chart, focus: "general" };
const baseFacts: ProductFacts = {
  generatedAt: "2026-07-29T00:00:00.000Z",
  natalTimeKnown: true,
  natalReliabilityNote: "Birth time supplied; angles and whole-sign houses may be used.",
  natal,
  natalEvidence: buildNatalEvidence(chart),
};

const paragraph = "The chart becomes useful when technical testimony is translated into choices, habits, and conditions the reader can recognize. This editorial preview uses neutral sample prose so spacing, hierarchy, tables, and page rhythm can be inspected without calling an AI provider. ";

function sampleReport(tier: keyof typeof reportCatalog) {
  const blueprint = reportCatalog[tier];
  const framingWords = 1400;
  const chapterWords = Math.ceil((blueprint.targetWords[0] + 500 - framingWords) / Math.max(1, blueprint.chapters.length));
  const fill = (words: number) => paragraph.repeat(Math.max(1, Math.ceil(words / paragraph.split(/\s+/).length)));
  return {
    title: blueprint.title,
    introduction: fill(350),
    chapters: blueprint.chapters.map((chapter) => ({ key: chapter.key, title: chapter.title, body: fill(chapterWords) })),
    practicalSummary: fill(500),
    closing: fill(400),
    scopeNote: fill(150),
  };
}

const forecastStart = new Date("2026-08-18T15:00:00.000Z");
const forecastEnd = new Date("2027-08-18T15:00:00.000Z");
const forecast = selectPrincipalEvents(buildTimingCycle(natal, forecastStart, forecastEnd), natal);
const solarReturn = calculateFullChartAtUtc({ latitude: birth.latitude, longitude: birth.longitude, timezone: birth.timezone }, forecastStart);
const annual = {
  cycleYear: 2026,
  period: { startsAt: forecastStart.toISOString(), endsAt: forecastEnd.toISOString(), returnLocation: natal.birth.location, timezone: birth.timezone },
  profection: { age: 24, house: 1, sign: chart.angles.ascendant.sign, lordOfYear: chart.chartRuler, natalHousesRuled: [1, 6] },
  solarReturn,
  solarReturnEvidence: buildSolarReturnEvidence(chart, solarReturn),
  monthlySky: Array.from({ length: 12 }, (_, index) => {
    const startsAt = new Date(forecastStart); startsAt.setUTCMonth(startsAt.getUTCMonth() + index);
    return { month: index + 1, startsAt: startsAt.toISOString(), chart: calculateFullChartAtUtc({ latitude: birth.latitude, longitude: birth.longitude, timezone: birth.timezone }, startsAt) };
  }),
};

const synastryFacts: ProductFacts = {
  ...baseFacts,
  partner: { facts: { birth: { ...partnerBirth, location: natal.birth.location, utcOffset: -3 }, chart: partnerChart, focus: "synastry" }, timeKnown: true, reliabilityNote: "Birth time supplied." },
  synastry: buildSynastryEvidence(chart, partnerChart, { firstTimeKnown: true, secondTimeKnown: true }),
};
const dossierFacts: ProductFacts = { ...baseFacts, annual, forecast };
const almanacEnd = new Date("2026-09-01T03:00:00.000Z");
const almanacTiming = buildTimingCycle(natal, new Date("2026-08-01T03:00:00.000Z"), almanacEnd);
const almanacFacts: ProductFacts = {
  ...baseFacts,
  almanac: {
    month: { startsAt: "2026-08-01T03:00:00.000Z", endsAt: almanacEnd.toISOString(), presentationTimezone: birth.timezone, sunHouse: 10, themeSign: "Leo" },
    profection: almanacTiming.profections[0]!,
    lunations: [],
    timing: almanacTiming,
  },
};
const kabbalahFacts: ProductFacts = {
  ...baseFacts,
  hermetic: {
    version: hermeticCorrespondences.version,
    system: hermeticCorrespondences.system,
    sources: hermeticCorrespondences.sources,
    planetarySpheres: hermeticCorrespondences.planetarySpheres,
    zodiac: hermeticCorrespondences.zodiac,
    selectedQuinances: ["Sun", "Moon", chart.chartRuler].map((body) => {
      const placement = chart.placements.find((item) => item.body === body)!;
      return { subject: body, sign: placement.sign, degreeLabel: placement.degreeLabel, quinance: quinanceFor(placement.sign, placement.degree) };
    }),
  },
};

await mkdir(outputDirectory, { recursive: true });
for (const [tier, facts] of [["complete", baseFacts], ["synastry", synastryFacts], ["dossier", dossierFacts], ["almanac", almanacFacts], ["kabbalah", kabbalahFacts]] as const) {
  const report = sampleReport(tier);
  await writeFile(resolve(outputDirectory, `${tier}-preview.pdf`), await createProductPdf(reportCatalog[tier], facts, report));
  if (tier === "dossier") await writeFile(resolve(outputDirectory, "dossier-summary-preview.pdf"), await createDossierSummaryPdf(facts, report));
}
console.log(outputDirectory);
