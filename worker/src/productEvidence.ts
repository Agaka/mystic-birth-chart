import type { ProductFacts } from "./reportFacts.ts";
import type { ReportBlueprint, ReportChapter } from "./reportCatalog.ts";

function natalHeader(facts: ProductFacts) {
  return {
    birth: facts.natal.birth,
    focus: facts.natal.focus,
    chartRuler: facts.natal.chart.chartRuler,
    sect: facts.natal.chart.sect,
    angles: facts.natalTimeKnown ? facts.natal.chart.angles : undefined,
    dominantSignatures: facts.natal.chart.dominantSignatures,
    reliability: facts.natalReliabilityNote,
  };
}

export function evidenceForChapter(blueprint: ReportBlueprint, chapter: ReportChapter, facts: ProductFacts): unknown {
  const base = { product: blueprint.title, chapter: chapter.title, natal: natalHeader(facts) };
  const evidence = facts.natalEvidence;
  switch (chapter.key) {
    case "chartArchitecture": return { ...base, placements: facts.natal.chart.placements, aspects: facts.natal.chart.aspects, lots: facts.natal.chart.lots, repeatedTestimony: evidence?.repeatedTestimony };
    case "authority": return { ...base, placements: facts.natal.chart.placements, angularPlanets: evidence?.angularPlanets, repeatedTestimony: evidence?.repeatedTestimony };
    case "planetaryJudgments": return { ...base, placements: facts.natal.chart.placements, aspects: facts.natal.chart.aspects, houses: evidence?.houses };
    case "dispositorsReceptions": return { ...base, dispositors: evidence?.dispositors, receptions: evidence?.receptions, repeatedTestimony: evidence?.repeatedTestimony };
    case "houses1to4": return { ...base, houses: evidence?.houses.slice(0, 4) };
    case "houses5to8": return { ...base, houses: evidence?.houses.slice(4, 8) };
    case "houses9to12": return { ...base, houses: evidence?.houses.slice(8, 12), vocation: evidence?.vocation };
    case "relationshipStructure":
    case "intimacyAndCommitment":
    case "relationshipPractice": return { ...base, relationship: evidence?.relationship, receptions: evidence?.receptions, repeatedTestimony: evidence?.repeatedTestimony };
    case "vocationStructure":
    case "workResources":
    case "vocationPractice": return { ...base, vocation: evidence?.vocation, receptions: evidence?.receptions, repeatedTestimony: evidence?.repeatedTestimony };
    case "annualStructure": return { ...base, annual: facts.annual?.profection, period: facts.annual?.period, natalLordEvidence: evidence?.repeatedTestimony };
    case "solarReturn": return { ...base, annual: facts.annual, solarReturnEvidence: facts.annual?.solarReturnEvidence, natalHouses: evidence?.houses };
    case "selectedTransits": return { ...base, timing: facts.forecast ? { period: facts.forecast.period, profections: facts.forecast.profections, events: facts.forecast.events, convergences: facts.forecast.convergences } : undefined };
    case "annualTimeline": return { ...base, timing: facts.forecast ? { period: facts.forecast.period, months: facts.forecast.months, events: facts.forecast.events, convergences: facts.forecast.convergences } : undefined };
    case "annualDirection": return { ...base, annual: facts.annual, timing: facts.forecast, focus: facts.natal.focus };
    case "forecastHierarchy":
    case "relevantTransits":
    case "yearTimeline": return { ...base, timing: facts.forecast, focus: facts.natal.focus };
    case "twoStructures":
    case "contactPoints":
    case "relationshipDynamic": return { ...base, partner: facts.partner, synastry: facts.synastry };
    case "monthSky":
    case "natalActivation":
    case "hermeticPractice": return { ...base, almanac: facts.almanac, previousEdition: facts.almanacHistory };
    case "natalFoundation":
    case "planetarySpheres":
    case "treeAndPaths":
    case "decansAndIntelligences":
    case "planetaryPractices":
    case "practicePlan":
    case "journalAndSynthesis": return { ...base, natalEvidence: evidence, placements: facts.natal.chart.placements, aspects: facts.natal.chart.aspects, hermetic: facts.hermetic };
    case "appliedSynthesis": return { ...base, evidence, focus: facts.natal.focus };
    default: return { ...base, facts };
  }
}
