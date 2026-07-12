import type { NatalSnapshotResult, ZodiacSign } from "./natalSnapshot.ts";

export type FreeChartFocus = "general" | "love" | "career" | "emotions" | "purpose" | "spiritual";

export interface ReadingSection {
  eyebrow: string;
  title: string;
  body: string;
}

const elementBridges: Record<ZodiacSign, { element: string; bridge: string }> = {
  Aries: { element: "fire", bridge: "acts before certainty and learns through direct contact" },
  Taurus: { element: "earth", bridge: "trusts what can be repeated, touched, and sustained" },
  Gemini: { element: "air", bridge: "moves through language, comparison, and changing perspective" },
  Cancer: { element: "water", bridge: "protects meaning through memory, care, and belonging" },
  Leo: { element: "fire", bridge: "organizes experience around dignity, authorship, and visible heart" },
  Virgo: { element: "earth", bridge: "seeks usefulness through discernment, craft, and correction" },
  Libra: { element: "air", bridge: "understands itself through proportion, encounter, and choice" },
  Scorpio: { element: "water", bridge: "tests truth through depth, loyalty, and emotional consequence" },
  Sagittarius: { element: "fire", bridge: "needs a horizon of meaning large enough to move toward" },
  Capricorn: { element: "earth", bridge: "builds authority through time, pressure, and earned competence" },
  Aquarius: { element: "air", bridge: "creates distance in order to see the system and its principles" },
  Pisces: { element: "water", bridge: "receives atmosphere, image, and meanings that resist hard borders" },
};

const focusSections: Record<FreeChartFocus, (result: NatalSnapshotResult) => ReadingSection> = {
  general: (result) => ({ eyebrow: "Whole-chart question", title: "The pattern is asking for hierarchy.", body: `Your ${result.sunSign} Sun, ${result.moonSign} Moon, and ${result.risingSign} Ascendant do not have equal jobs. The Sun organizes direction, the Moon maintains emotional continuity, and the Ascendant describes the doorway through which life arrives. ${result.chartRuler} then carries the chart forward. The deeper paid reading is not valuable because it adds more disconnected paragraphs; it decides which witness has authority and where the same theme repeats.` }),
  love: (result) => ({ eyebrow: "Relationship lens", title: "Recognition is not yet relationship judgment.", body: `Your ${result.moonSign} Moon describes what must feel safe before intimacy can deepen, while the ${result.risingSign} Ascendant shows how you enter encounter and protect the first boundary. This preview cannot responsibly name partnership patterns without Venus, Mars, the seventh house, its ruler, and reception. It can already show that your needs and your visible style may not ask for closeness in the same language.` }),
  career: (result) => ({ eyebrow: "Vocation lens", title: "Your direction needs a structure capable of carrying it.", body: `The ${result.sunSign} Sun describes a way of organizing purpose, while ${result.chartRuler} describes how the whole chart moves. Career judgment also requires the tenth, sixth, and second houses: visibility, labor, and resources. The free layer can name your style of direction, but it cannot yet decide whether the loudest promise belongs to leadership, craft, service, counsel, art, trade, or work that happens away from public view.` }),
  emotions: (result) => ({ eyebrow: "Emotional lens", title: "The Moon is a rhythm, not a personality label.", body: `Your ${result.moonSign} Moon ${elementBridges[result.moonSign].bridge}. Born under a ${result.moonPhase.name}, you process experience through a particular stage of the solar-lunar cycle as well as a sign. The Moon's house, ruler, aspects, speed, and sect condition would show where protection becomes nourishment and where it becomes a habit that keeps life too small.` }),
  purpose: (result) => ({ eyebrow: "Direction and timing", title: "Purpose becomes visible where the chart repeats itself.", body: `A ${result.sunSign} Sun seeks coherence by the method of ${elementBridges[result.sunSign].bridge}. Yet the life path enters through ${result.risingSign} and answers to ${result.chartRuler}. Timing techniques are useful only after that natal structure is established. Your annual time lord can show which part of the map currently has the floor, but not every transit deserves equal attention.` }),
  spiritual: (result) => ({ eyebrow: "Hermetic lens", title: "Practice should arise from the chart, not decorate it.", body: `${result.chartRuler} is the traditional ruler of your ${result.risingSign} Ascendant, making its planetary function a serious point of study. A grounded Hermetic practice would first examine that planet's condition, house, sect, and relationships before choosing prayers, images, hours, or decan work. The aim is inner formation - clarity, courage, discipline, joy, patience, or devotion - not guaranteed material results.` }),
};

export function normalizeFreeChartFocus(value: string): FreeChartFocus {
  return ["love", "career", "emotions", "purpose", "spiritual"].includes(value)
    ? (value as FreeChartFocus)
    : "general";
}

export function buildExpandedFreeReading(
  result: NatalSnapshotResult,
  focusValue = "general",
): ReadingSection[] {
  const focus = normalizeFreeChartFocus(focusValue);
  const sun = elementBridges[result.sunSign];
  const moon = elementBridges[result.moonSign];
  const rising = elementBridges[result.risingSign];
  const sameElement = sun.element === moon.element;

  return [
    {
      eyebrow: "First synthesis",
      title: `${result.sunSign} purpose, ${result.moonSign} instinct, ${result.risingSign} approach.`,
      body: sameElement
        ? `Your Sun and Moon share ${sun.element}, so purpose and instinct recognize a common language even when they want different outcomes. The ${result.risingSign} Ascendant changes how that private agreement reaches the world: it ${rising.bridge}. Familiarity can become a strength, but it can also make one mode of response feel so natural that alternatives are noticed late.`
        : `Your Sun moves through ${sun.element}, while your Moon moves through ${moon.element}. Purpose ${sun.bridge}; instinct ${moon.bridge}. The ${result.risingSign} Ascendant becomes the visible method of negotiation. This contrast can create range, but it can also produce moments when what gives direction and what restores safety appear to ask for different lives.`,
    },
    {
      eyebrow: "Solar-lunar rhythm",
      title: `Born under a ${result.moonPhase.name}.`,
      body: `${result.moonPhase.keynote} Your natal Moon was approximately ${Math.round(result.moonPhase.illumination)}% illuminated and ${Math.round(result.moonPhase.angle)} degrees ahead of the Sun in the cycle. The developmental work is not to become another phase: ${result.moonPhase.developmentalTask.toLowerCase()}`,
    },
    {
      eyebrow: "Chart leadership",
      title: `${result.chartRuler} carries the life forward.`,
      body: `${result.rulerInterpretation.body} In this free layer we can identify the ruler but not its natal sign, house, dignity, speed, visibility, or aspects. Those missing conditions are precisely what decide whether ${result.chartRuler} operates as an available resource, a repeated pressure, or both.`,
    },
    {
      eyebrow: "Sect and temperament",
      title: `${result.sect}: the chart has a preferred light.`,
      body: `${result.sectInterpretation.body} Sect does not divide charts into good and bad. It changes which planetary functions tend to have environmental support and which may require more deliberate handling.`,
    },
    focusSections[focus](result),
    {
      eyebrow: "A practical observation",
      title: "Watch the moment direction and protection disagree.",
      body: `For seven days, notice one moment when your ${result.sunSign} solar direction wants movement and your ${result.moonSign} lunar pattern asks for protection, familiarity, or response. Write what the ${result.risingSign} part of you actually does. That small sequence reveals more than another list of traits because it shows the chart operating as a system.`,
    },
  ];
}
