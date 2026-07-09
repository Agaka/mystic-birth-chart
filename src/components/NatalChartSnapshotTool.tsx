"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  IconBriefcase,
  IconChartDots,
  IconCompass,
  IconHeart,
  IconLock,
  IconMars,
  IconMoon,
  IconPlanet,
  IconRings,
  IconShadow,
  IconSparkles,
  IconStars,
  IconSun,
  IconTarget,
  IconVenus,
  IconWorld,
  IconZodiacAquarius,
  IconZodiacAries,
  IconZodiacCancer,
  IconZodiacCapricorn,
  IconZodiacGemini,
  IconZodiacLeo,
  IconZodiacLibra,
  IconZodiacPisces,
  IconZodiacSagittarius,
  IconZodiacScorpio,
  IconZodiacTaurus,
  IconZodiacVirgo,
} from "@tabler/icons-react";
import { Button } from "@/components/Button";
import { trackEvent } from "@/lib/analytics";
import { getBasicCheckoutUrl, getCompleteCheckoutUrl, siteConfig } from "@/lib/site";
import {
  calculateNatalSnapshot,
  cityPresets,
  zodiacSigns,
  type CityPreset,
  type NatalSnapshotResult,
  type ZodiacSign,
} from "@/lib/natalSnapshot";

interface NatalChartSnapshotToolProps {
  basicHref: string;
  completeHref: string;
}

interface BirthplaceOption {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface GeocodingApiResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  admin1?: string;
}

type FlowMark = "sun" | "spark" | "earth" | "aspect" | "star";

const flowSteps = [
  { id: "sign", label: "Sun", mark: "sun" },
  { id: "intent", label: "Intention", mark: "spark" },
  { id: "birth", label: "Birth data", mark: "earth" },
  { id: "calculating", label: "Calculation", mark: "aspect" },
  { id: "result", label: "Preview", mark: "star" },
] as const;

type FlowStep = (typeof flowSteps)[number]["id"];

const quickPlaces = cityPresets
  .filter((city) => ["porto-alegre", "new-york", "london", "sao-paulo"].includes(city.id))
  .map(presetToBirthplace);

const zodiacDetails: Record<
  ZodiacSign,
  {
    element: "Fire" | "Earth" | "Air" | "Water";
    quality: "Cardinal" | "Fixed" | "Mutable";
    hook: string;
  }
> = {
  Aries: {
    element: "Fire",
    quality: "Cardinal",
    hook: "The sign of first movement, heat, courage, and direct action.",
  },
  Taurus: {
    element: "Earth",
    quality: "Fixed",
    hook: "The sign of body, steadiness, value, pleasure, and endurance.",
  },
  Gemini: {
    element: "Air",
    quality: "Mutable",
    hook: "The sign of language, movement, curiosity, and quick exchange.",
  },
  Cancer: {
    element: "Water",
    quality: "Cardinal",
    hook: "The sign of memory, care, protection, belonging, and emotional tides.",
  },
  Leo: {
    element: "Fire",
    quality: "Fixed",
    hook: "The sign of radiance, dignity, creativity, loyalty, and heart.",
  },
  Virgo: {
    element: "Earth",
    quality: "Mutable",
    hook: "The sign of craft, refinement, service, discernment, and repair.",
  },
  Libra: {
    element: "Air",
    quality: "Cardinal",
    hook: "The sign of balance, beauty, choice, relationship, and proportion.",
  },
  Scorpio: {
    element: "Water",
    quality: "Fixed",
    hook: "The sign of depth, secrecy, loyalty, power, and emotional truth.",
  },
  Sagittarius: {
    element: "Fire",
    quality: "Mutable",
    hook: "The sign of meaning, faith, teaching, travel, and the far horizon.",
  },
  Capricorn: {
    element: "Earth",
    quality: "Cardinal",
    hook: "The sign of time, mastery, responsibility, pressure, and earned authority.",
  },
  Aquarius: {
    element: "Air",
    quality: "Fixed",
    hook: "The sign of distance, systems, friendship, principle, and difference.",
  },
  Pisces: {
    element: "Water",
    quality: "Mutable",
    hook: "The sign of imagination, devotion, permeability, mercy, and mystery.",
  },
};

const zodiacIconMap = {
  Aries: IconZodiacAries,
  Taurus: IconZodiacTaurus,
  Gemini: IconZodiacGemini,
  Cancer: IconZodiacCancer,
  Leo: IconZodiacLeo,
  Virgo: IconZodiacVirgo,
  Libra: IconZodiacLibra,
  Scorpio: IconZodiacScorpio,
  Sagittarius: IconZodiacSagittarius,
  Capricorn: IconZodiacCapricorn,
  Aquarius: IconZodiacAquarius,
  Pisces: IconZodiacPisces,
} satisfies Record<ZodiacSign, typeof IconZodiacAries>;

const flowIconMap = {
  sun: IconSun,
  spark: IconSparkles,
  earth: IconWorld,
  aspect: IconChartDots,
  star: IconStars,
} satisfies Record<FlowMark, typeof IconSun>;

const intentOptions = [
  {
    id: "whole-chart",
    label: "Understand my whole chart",
    shortLabel: "Whole chart",
    eyebrow: "Whole chart focus",
    title: "You are asking for the pattern, not a single trait.",
    body:
      "Read the preview as the front door of the chart. The deeper question is how the Sun, Moon, Rising sign, ruler, houses, and aspects repeat the same themes through different symbols.",
    recommendation: "Essential Birth Chart Reading",
  },
  {
    id: "love",
    label: "Love and relationships",
    shortLabel: "Love",
    eyebrow: "Relationship focus",
    title: "Love questions need more than Venus keywords.",
    body:
      "For love, the chart has to connect emotional safety, attraction, attachment, the 7th house, Venus, Mars, the Moon, and the ruler of the relationship house. This preview begins with the temperament behind those patterns.",
    recommendation: "Complete Natal Reading",
  },
  {
    id: "career",
    label: "Career and vocation",
    shortLabel: "Career",
    eyebrow: "Vocation focus",
    title: "Career is a chart pattern, not only the Midheaven.",
    body:
      "For vocation, the full chart studies visibility, responsibility, talents, work rhythm, the 10th house, the 2nd house, the 6th house, and the planets that carry authority in your chart.",
    recommendation: "Complete Natal Reading",
  },
  {
    id: "emotions",
    label: "Emotional patterns",
    shortLabel: "Emotions",
    eyebrow: "Emotional focus",
    title: "The Moon opens the emotional story, but it does not finish it.",
    body:
      "Your Moon sign describes a real need, but the house, aspects, sect, and chart ruler show where that need becomes habit, protection, sensitivity, and self-regulation.",
    recommendation: "Complete Natal Reading",
  },
  {
    id: "life-direction",
    label: "Life direction",
    shortLabel: "Direction",
    eyebrow: "Direction focus",
    title: "Direction appears where the chart repeats itself.",
    body:
      "A useful reading looks for repetition: the ruler, angular planets, houses, aspects, and life topics that keep pointing to the same kind of work, courage, responsibility, or desire.",
    recommendation: "Essential Birth Chart Reading",
  },
  {
    id: "current-phase",
    label: "Current life phase",
    shortLabel: "Timing",
    eyebrow: "Timing focus",
    title: "Timing makes more sense after the natal chart is understood.",
    body:
      "Transits and current phases need the natal structure underneath them. The preview names the first layer; the complete reading can show which parts of the chart are most sensitive to timing.",
    recommendation: "Complete Natal Reading",
  },
  {
    id: "shadow-growth",
    label: "Shadow and personal growth",
    shortLabel: "Growth",
    eyebrow: "Growth focus",
    title: "Growth work starts with the planets that ask for form.",
    body:
      "The chart can show where confidence, discipline, patience, courage, and emotional steadiness are developed over time. A full reading studies these themes without turning them into fear or fate.",
    recommendation: "Complete Natal Reading",
  },
] as const;

type ChartIntent = (typeof intentOptions)[number]["id"];

const intentIconMap = {
  "whole-chart": IconChartDots,
  love: IconHeart,
  career: IconBriefcase,
  emotions: IconMoon,
  "life-direction": IconCompass,
  "current-phase": IconPlanet,
  "shadow-growth": IconShadow,
} satisfies Record<ChartIntent, typeof IconSun>;

const calculationMessages = [
  {
    eyebrow: "First testimony",
    title: "Opening the visible layer...",
    body:
      "Your Sun sign begins the reading, but it is only the first witness. The chart still has to show where that light acts, what supports it, and what interrupts it.",
    essential:
      "The automated Essential Reading does not stop at your Sun. It connects the first layer to the Moon, Rising sign, chart ruler, and key aspects.",
  },
  {
    eyebrow: "Inner rhythm",
    title: "Locating the Moon beneath the surface...",
    body:
      "The Moon describes need, memory, protection, and emotional rhythm. Two people with the same Sun can feel completely different once the Moon enters the room.",
    essential:
      "This is where the instant paid reading starts to feel personal: it explains how your emotional pattern fits the first structure of the chart.",
  },
  {
    eyebrow: "The doorway",
    title: "Finding your Rising sign...",
    body:
      "The Ascendant sets the house structure. It changes which life topics belong to which parts of the chart, and it points toward the planet that leads the story.",
    essential:
      "The automated Essential Reading uses the Ascendant and chart ruler to show where your chart really begins, not just what placements you have.",
  },
  {
    eyebrow: "Chart movement",
    title: "Following the chart ruler...",
    body:
      "A chart ruler is not a decorative planet name. Its sign, condition, house, and aspects show how the chart moves through real life.",
    essential:
      "This is the difference between a free preview and the automated Essential report: the ruler becomes part of the first hierarchy.",
  },
  {
    eyebrow: "Day or night",
    title: "Checking the sect of the chart...",
    body:
      "Traditional astrology asks whether the chart belongs to day or night. That can change the tone of the planets and the way certain pressures are interpreted.",
    essential:
      "The Essential Reading brings these traditional details into clear English, so the interpretation feels grounded instead of random.",
  },
  {
    eyebrow: "Signal from noise",
    title: "Separating the loud themes from the quiet ones...",
    body:
      "A chart contains many symbols, but they are not all equally important. The first craft of reading is noticing which testimonies repeat.",
    essential:
      "The paid reading is valuable because it chooses what matters most. More text is not the point; hierarchy is the point.",
  },
  {
    eyebrow: "Free preview",
    title: "Preparing the first reading you can keep...",
    body:
      "This preview gives you real recognition, but it intentionally leaves the deeper architecture unfinished: houses, aspects, emphasis, and practical synthesis.",
    essential:
      "If the preview already feels close, the Essential Birth Chart Reading is the natural next step.",
  },
] as const;

const CALCULATION_STEP_MS = 1180;
const CALCULATION_REVEAL_MS = calculationMessages.length * CALCULATION_STEP_MS + 900;

const calculationTrustNotes = [
  {
    mark: "star",
    title: "Recognition first",
    body: "The preview should feel useful, but unfinished. It gives enough to recognize the pattern, not enough to replace a reading.",
  },
  {
    mark: "aspect",
    title: "The missing piece is synthesis",
    body: "Free calculators list fragments. The Essential Reading gives an instant first synthesis of how the pieces speak to each other.",
  },
  {
    mark: "earth",
    title: "$17 automated step",
    body: "The Essential Reading is the low-friction paid step: automated, clear, delivered by email, and not a subscription.",
  },
] satisfies Array<{ mark: FlowMark; title: string; body: string }>;

const intentEssentialBridge: Record<ChartIntent, string> = {
  "whole-chart":
    "You asked for the whole chart, so the next useful step is not more isolated placements. The automated Essential Reading gives a concise first hierarchy: Sun, Moon, Rising, chart ruler, and key aspects.",
  love:
    "Love questions become clearer only after the basic chart structure is understood. The automated Essential Reading gives you the first synthesis before you decide whether a deeper relationship reading is worth it.",
  career:
    "Career questions need the chart's basic direction first. The automated Essential Reading gives you the foundation before you spend more on a deeper vocation-focused report.",
  emotions:
    "Emotional patterns are rarely explained by the Moon alone. The automated Essential Reading connects the Moon to the Rising sign, chart ruler, sect, and the key tensions that shape emotional rhythm.",
  "life-direction":
    "Direction appears where the chart repeats itself. The automated Essential Reading is designed to name those first repeated signals without overwhelming you with a full advanced report.",
  "current-phase":
    "Timing makes more sense after the natal pattern is clear. The automated Essential Reading gives you the foundation before you decide whether deeper timing work is needed.",
  "shadow-growth":
    "Growth work needs clarity before intensity. The automated Essential Reading shows the first places where the chart asks for form, steadiness, courage, and attention.",
};

const freeVsEssentialRows = [
  {
    free: "Names your Big Three",
    essential: "Explains which of them leads the chart and why.",
  },
  {
    free: "Shows the chart ruler",
    essential: "Reads its sign, house, condition, and key aspects as one story.",
  },
  {
    free: "Gives a first recognition",
    essential: "Turns that recognition into a practical written synthesis.",
  },
  {
    free: "Stops before the deeper architecture",
    essential: "Adds hierarchy, emphasis, repeating themes, and next-step clarity.",
  },
];

const essentialValueCards = [
  {
    mark: "sun",
    title: "Automated",
    body: "Generated from your birth data and clearly marked as automatic, not hand-prepared.",
  },
  {
    mark: "aspect",
    title: "Clear first hierarchy",
    body: "The report gives a structured first synthesis instead of treating every symbol equally.",
  },
  {
    mark: "earth",
    title: "Instant email",
    body: "A concise written reading sent to your inbox, with no account or subscription.",
  },
] satisfies Array<{ mark: FlowMark; title: string; body: string }>;

function getPersonalizedHiddenCards(result: NatalSnapshotResult) {
  return [
    {
      title: `Where your ${result.sunSign} Sun actually operates`,
      body: `Your Sun sign is ${result.sunSign}, but the house it occupies changes whether its energy speaks through identity, family, work, relationships, or hidden inner development. The Essential reading maps this.`,
      personal: true,
    },
    {
      title: `Why your ${result.moonSign} Moon needs what it needs`,
      body: `Moon in ${result.moonSign} creates specific emotional patterns. The house and aspects reveal where you seek safety, what triggers protection, and how emotional rhythm shapes your daily life.`,
      personal: true,
    },
    {
      title: `The real story behind ${result.chartRuler} as your chart ruler`,
      body: `${result.chartRuler} rules your ${result.risingSign} Ascendant, making it the planet that leads the chart. Its sign, house, condition, and connections to other planets tell a story the free preview cannot finish.`,
      personal: true,
    },
    {
      title: "The aspects and tensions you are living",
      body: "Major aspects create repeating patterns: internal conflicts, gifts, pressures, and drives that the chart keeps pointing toward. The reading identifies which ones are loudest.",
      personal: false,
    },
    {
      title: "Love, career, and timing signatures",
      body: "Relationship patterns, career direction, and current life timing need the whole chart architecture, not a single placement. The reading maps how these themes connect.",
      personal: false,
    },
  ];
}

const hiddenChartCards = [
  {
    title: "The house where your Sun operates",
    body: "This changes whether the Sun speaks through identity, family, work, relationships, public life, or hidden inner development.",
  },
  {
    title: "Where your Moon seeks protection",
    body: "The Moon's house and aspects show the places where you look for safety, repetition, comfort, and emotional regulation.",
  },
  {
    title: "The position and condition of your chart ruler",
    body: "The ruler is not only a planet name. Its sign, house, condition, and aspects show how the chart begins to move.",
  },
  {
    title: "Major aspects and internal tensions",
    body: "The full reading looks for repeating testimonies instead of treating every placement as equally loud.",
  },
  {
    title: "Love, vocation, and timing signatures",
    body: "Relationship patterns, career direction, and current timing need the whole chart, not a single isolated placement.",
  },
];

const chartPlanetMarkers = [
  { id: "sun", icon: IconSun, left: 50, top: 13, delay: "0s" },
  { id: "moon", icon: IconMoon, left: 74, top: 23, delay: "0.16s" },
  { id: "venus", icon: IconVenus, left: 82, top: 51, delay: "0.32s" },
  { id: "mars", icon: IconMars, left: 66, top: 77, delay: "0.48s" },
  { id: "planet", icon: IconPlanet, left: 35, top: 77, delay: "0.64s" },
  { id: "rings", icon: IconRings, left: 18, top: 51, delay: "0.8s" },
  { id: "target", icon: IconTarget, left: 27, top: 23, delay: "0.96s" },
];

function formatOffset(offset: number): string {
  return offset > 0 ? `+${offset}` : `${offset}`;
}

function formatBirthplace(place: BirthplaceOption): string {
  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

function presetToBirthplace(city: CityPreset): BirthplaceOption {
  const [name, country = ""] = city.label.split(", ");

  return {
    id: city.id,
    name,
    country,
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone,
  };
}

function localBirthplaceMatches(query: string): BirthplaceOption[] {
  const normalized = query.toLowerCase();

  return cityPresets
    .filter((city) => city.label.toLowerCase().includes(normalized))
    .slice(0, 5)
    .map(presetToBirthplace);
}

function uniquePlaces(places: BirthplaceOption[]): BirthplaceOption[] {
  const seen = new Set<string>();

  return places.filter((place) => {
    const key = `${place.name}-${place.country}-${place.admin1 ?? ""}-${place.timezone}`.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function getIntentOption(intent: ChartIntent | null) {
  return intentOptions.find((option) => option.id === intent) ?? intentOptions[0];
}

function stepIndex(step: FlowStep): number {
  return flowSteps.findIndex((item) => item.id === step);
}

function roundCoord(value: number): number {
  return Number(value.toFixed(3));
}

function percentCoord(value: number): string {
  return `${roundCoord(value)}%`;
}

function ZodiacIcon({
  sign,
  className,
  stroke = 1.7,
}: {
  sign: ZodiacSign;
  className?: string;
  stroke?: number;
}) {
  const Icon = zodiacIconMap[sign];

  return <Icon aria-hidden="true" className={className} stroke={stroke} />;
}

function FlowIcon({
  mark,
  className,
  stroke = 1.7,
}: {
  mark: FlowMark;
  className?: string;
  stroke?: number;
}) {
  const Icon = flowIconMap[mark];

  return <Icon aria-hidden="true" className={className} stroke={stroke} />;
}

function IntentIcon({
  intent,
  className,
  stroke = 1.7,
}: {
  intent: ChartIntent;
  className?: string;
  stroke?: number;
}) {
  const Icon = intentIconMap[intent];

  return <Icon aria-hidden="true" className={className} stroke={stroke} />;
}

async function fetchBirthplaces(query: string): Promise<BirthplaceOption[]> {
  const params = new URLSearchParams({
    name: query,
    count: "6",
    language: "en",
    format: "json",
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error("City search failed.");
  }

  const data = (await response.json()) as { results?: GeocodingApiResult[] };

  return (data.results ?? [])
    .filter((place) => place.timezone && place.country)
    .map((place) => ({
      id: String(place.id),
      name: place.name,
      admin1: place.admin1,
      country: place.country ?? "",
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone ?? "UTC",
    }));
}

export function NatalChartSnapshotTool({
  basicHref,
  completeHref,
}: NatalChartSnapshotToolProps) {
  const [activeStep, setActiveStep] = useState<FlowStep>("sign");
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [intent, setIntent] = useState<ChartIntent | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [birthplaceQuery, setBirthplaceQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<BirthplaceOption | null>(null);
  const [placeResults, setPlaceResults] = useState<BirthplaceOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<NatalSnapshotResult | null>(null);
  const [pendingResult, setPendingResult] = useState<NatalSnapshotResult | null>(null);
  const [calculationIndex, setCalculationIndex] = useState(0);
  const [error, setError] = useState("");
  const [birthStepTracked, setBirthStepTracked] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  function scrollStageToTop(delay = 30) {
    window.setTimeout(() => {
      if (!stageRef.current) return;

      const headerOffset = window.innerWidth >= 768 ? 116 : 88;
      const target =
        stageRef.current.querySelector<HTMLElement>("[data-free-chart-active-panel]") ??
        stageRef.current;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    }, delay);
  }

  useEffect(() => {
    trackEvent("chart_entry_viewed", {
      entry_point: "free_birth_chart_quiz",
    });
  }, []);

  useEffect(() => {
    if (activeStep !== "calculating" || !pendingResult) return;

    const interval = window.setInterval(() => {
      setCalculationIndex((current) => Math.min(current + 1, calculationMessages.length - 1));
    }, CALCULATION_STEP_MS);

    const revealTimer = window.setTimeout(() => {
      setResult(pendingResult);
      setPendingResult(null);
      setActiveStep("result");
      trackEvent("free_chart_preview_generated", {
        sun_sign: pendingResult.sunSign,
        moon_sign: pendingResult.moonSign,
        rising_sign: pendingResult.risingSign,
        chart_ruler: pendingResult.chartRuler,
        sect: pendingResult.sect,
        selected_zodiac: selectedSign,
        selected_intent: intent,
      });
      trackEvent("chart_preview_viewed", {
        sun_sign: pendingResult.sunSign,
        moon_sign: pendingResult.moonSign,
        rising_sign: pendingResult.risingSign,
        selected_intent: intent,
      });
      trackEvent("locked_section_viewed", {
        selected_intent: intent,
        locked_items: hiddenChartCards.length,
      });
      scrollStageToTop(80);
    }, CALCULATION_REVEAL_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(revealTimer);
    };
  }, [activeStep, intent, pendingResult, selectedSign]);

  function moveToStep(nextStep: FlowStep, scrollDelay = nextStep === "calculating" ? 180 : 30) {
    setActiveStep(nextStep);
    setError("");
    scrollStageToTop(scrollDelay);

    if (nextStep === "birth" && !birthStepTracked) {
      setBirthStepTracked(true);
      trackEvent("birth_data_started", {
        selected_zodiac: selectedSign,
        selected_intent: intent,
      });
    }
  }

  function chooseSign(sign: ZodiacSign) {
    setSelectedSign(sign);
    trackEvent("zodiac_selected", {
      selected_zodiac: sign,
    });
    moveToStep("intent");
  }

  function chooseIntent(nextIntent: ChartIntent) {
    setIntent(nextIntent);
    trackEvent("intent_selected", {
      selected_zodiac: selectedSign,
      selected_intent: nextIntent,
    });
    moveToStep("birth");
  }

  function choosePlace(place: BirthplaceOption) {
    setSelectedPlace(place);
    setBirthplaceQuery(formatBirthplace(place));
    setShowDropdown(false);
    setPlaceResults([]);
  }

  async function searchCities(query: string) {
    if (query.trim().length < 2) {
      setPlaceResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);

    try {
      const localMatches = localBirthplaceMatches(query);
      let apiPlaces: BirthplaceOption[] = [];

      try {
        apiPlaces = await fetchBirthplaces(query);
      } catch {
        apiPlaces = [];
      }

      const places = uniquePlaces([...apiPlaces, ...localMatches]);
      setPlaceResults(places);
      setShowDropdown(places.length > 0);
    } finally {
      setIsSearching(false);
    }
  }

  function handleCityInputChange(value: string) {
    setBirthplaceQuery(value);
    setSelectedPlace(null);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchCities(value);
    }, 300);
  }

  async function resolvePlaceFromQuery(): Promise<BirthplaceOption | null> {
    let place = selectedPlace;

    if (!place) {
      const query = birthplaceQuery.trim();
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const localMatches = localBirthplaceMatches(query);
          let apiPlaces: BirthplaceOption[] = [];
          try {
            apiPlaces = await fetchBirthplaces(query);
          } catch {
            apiPlaces = [];
          }
          const places = uniquePlaces([...apiPlaces, ...localMatches]);
          if (places.length > 0) {
            place = places[0];
            choosePlace(place);
          }
        } finally {
          setIsSearching(false);
        }
      }
    }

    return place;
  }

  async function handleBirthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

    if (!date || !time) {
      setError("Enter your birth date and birth time to begin the free chart reading.");
      return;
    }

    if (!validTime) {
      setError("Enter birth time in 24-hour HH:MM format, like 14:35.");
      return;
    }

    const place = await resolvePlaceFromQuery();

    if (!place) {
      setError("Select your birth city from the dropdown so the chart can find the Rising sign.");
      return;
    }

    const snapshot = calculateNatalSnapshot({
      date,
      time,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    });

    setError("");
    setResult(null);
    setCalculationIndex(0);
    setPendingResult(snapshot);
    trackEvent("birth_data_completed", {
      selected_zodiac: selectedSign,
      selected_intent: intent,
      city_selected: true,
    });
    trackEvent("chart_calculation_started", {
      selected_zodiac: selectedSign,
      selected_intent: intent,
    });
    setActiveStep("calculating");
    scrollStageToTop(180);
  }

  function resetExperience() {
    setActiveStep("sign");
    setSelectedSign(null);
    setIntent(null);
    setResult(null);
    setPendingResult(null);
    setCalculationIndex(0);
    setError("");
  }

  const activeIndex = stepIndex(activeStep);
  const selectedIntent = getIntentOption(intent);
  const selectedPlaceLabel = selectedPlace ? formatBirthplace(selectedPlace) : birthplaceQuery;

  return (
    <div
      ref={stageRef}
      data-free-chart-stage
      className="relative isolate scroll-mt-28 overflow-hidden border border-gold/25 bg-ink shadow-[0_30px_90px_rgba(0,0,0,0.38)] md:scroll-mt-32"
    >
      <AstroBackdrop />

      <div className="relative grid min-h-[720px] grid-cols-1 lg:grid-cols-[minmax(320px,0.34fr)_minmax(0,0.66fr)]">
        <ExperienceLedger
          activeStep={activeStep}
          activeIndex={activeIndex}
          selectedSign={selectedSign}
          intent={intent}
          date={date}
          time={time}
          birthplaceLabel={selectedPlaceLabel}
          canRestart={Boolean(selectedSign || intent || result)}
          onRestart={resetExperience}
        />

        <div
          data-free-chart-active-panel
          className="relative flex min-h-[680px] min-w-0 items-stretch overflow-hidden border-t border-gold/16 bg-midnight/72 lg:border-l lg:border-t-0"
        >
          {activeStep === "sign" && <SignStep onSelect={chooseSign} />}

          {activeStep === "intent" && (
            <IntentStep
              selectedSign={selectedSign}
              onBack={() => moveToStep("sign")}
              onSelect={chooseIntent}
            />
          )}

          {activeStep === "birth" && (
            <BirthDataStep
              date={date}
              time={time}
              birthplaceQuery={birthplaceQuery}
              selectedPlace={selectedPlace}
              placeResults={placeResults}
              showDropdown={showDropdown}
              isSearching={isSearching}
              error={error}
              dropdownRef={dropdownRef}
              onBack={() => moveToStep("intent")}
              onSubmit={handleBirthSubmit}
              onDateChange={setDate}
              onTimeChange={setTime}
              onCityChange={handleCityInputChange}
              onCityFocus={() => {
                if (placeResults.length > 0 && !selectedPlace) {
                  setShowDropdown(true);
                }
              }}
              onCityBlur={() => {
                setTimeout(() => setShowDropdown(false), 200);
              }}
              onChoosePlace={choosePlace}
            />
          )}

          {activeStep === "calculating" && (
            <CalculationStep
              selectedSign={selectedSign}
              intent={selectedIntent}
              calculationIndex={calculationIndex}
            />
          )}

          {activeStep === "result" && result && (
            <SnapshotResult
              result={result}
              basicHref={basicHref}
              completeHref={completeHref}
              selectedSign={selectedSign}
              intent={selectedIntent}
              rawIntent={intent ?? "whole-chart"}
              birthplaceLabel={selectedPlaceLabel}
              onRestart={resetExperience}
              onBack={() => moveToStep("birth")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ExperienceLedger({
  activeStep,
  activeIndex,
  selectedSign,
  intent,
  date,
  time,
  birthplaceLabel,
  canRestart,
  onRestart,
}: {
  activeStep: FlowStep;
  activeIndex: number;
  selectedSign: ZodiacSign | null;
  intent: ChartIntent | null;
  date: string;
  time: string;
  birthplaceLabel: string;
  canRestart: boolean;
  onRestart: () => void;
}) {
  const intentCopy = getIntentOption(intent);
  const progress = ((activeIndex + 1) / flowSteps.length) * 100;

  return (
    <aside className="relative flex min-w-0 flex-col justify-between gap-6 overflow-hidden bg-ink/82 p-6 md:gap-10 md:p-8 lg:min-w-[320px]">
      <div className="pointer-events-none absolute -left-28 top-8 h-64 w-64 rounded-full border border-gold/10 opacity-70" />
      <div className="pointer-events-none absolute -bottom-24 right-8 h-56 w-56 rounded-full border border-ivory/5 opacity-70" />
      <div>
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.24em] text-gold/72">
          Free chart experience
        </p>
        <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight text-ivory md:text-4xl">
          Reveal the first architecture of your chart.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ivory/58">
          Your Sun sign opens the door. Your birth data reveals the Moon,
          Rising sign, chart ruler, and whether the chart belongs to day or
          night.
        </p>

        <MiniAstrolabe
          progress={progress}
          activeMark={flowSteps[activeIndex]?.mark ?? "sun"}
          activeLabel={flowSteps[activeIndex]?.label ?? "Sun"}
        />

        <div className="mt-8">
          <div className="flex items-center justify-between font-ui text-[0.68rem] uppercase tracking-[0.18em] text-ivory/42">
            <span>{flowSteps[activeIndex]?.label}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden bg-ivory/10">
            <div
              className="h-full bg-gold transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <ol className="mt-8 hidden gap-3 md:grid">
          {flowSteps.map((step, index) => {
            const isCurrent = step.id === activeStep;
            const isComplete = index < activeIndex;

            return (
              <li
                key={step.id}
                className={`flex items-center gap-3 border px-4 py-3 font-ui text-xs uppercase tracking-[0.16em] transition-colors ${
                  isCurrent
                    ? "border-gold/60 bg-gold/12 text-ivory"
                    : isComplete
                      ? "border-gold/22 bg-ivory/[0.04] text-gold/72"
                      : "border-ivory/10 text-ivory/36"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current">
                  <FlowIcon mark={step.mark} className="h-4 w-4" stroke={1.8} />
                </span>
                <span>
                  <span className="mr-2 text-ivory/32">{index + 1}</span>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="hidden border border-gold/18 bg-midnight/55 p-5 md:block">
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
          Your selections
        </p>
        <dl className="mt-4 grid gap-3 text-sm">
          <LedgerRow label="Sun sign" value={selectedSign ?? "Not chosen yet"} />
          <LedgerRow label="Intention" value={intent ? intentCopy.shortLabel : "Not chosen yet"} />
          <LedgerRow label="Birth time" value={date ? `${date} at ${time}` : "Not entered yet"} />
          <LedgerRow label="Birth city" value={birthplaceLabel || "Not selected yet"} />
        </dl>
        {canRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="mt-5 font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/50 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-ivory"
          >
            Start over
          </button>
        )}
      </div>
    </aside>
  );
}

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-ivory/10 pt-3 first:border-t-0 first:pt-0">
      <dt className="font-ui text-[0.68rem] uppercase tracking-[0.16em] text-ivory/35">
        {label}
      </dt>
      <dd className="text-ivory/76">{value}</dd>
    </div>
  );
}

function AstroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(184,138,58,0.24),transparent_30%),radial-gradient(circle_at_86%_78%,rgba(142,79,69,0.18),transparent_28%),linear-gradient(135deg,rgba(244,234,215,0.08),transparent_42%)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 900 720"
        className="absolute -right-48 -top-24 h-[620px] w-[620px] text-gold/28 animate-spin-slow"
      >
        <circle cx="450" cy="360" r="250" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="450" cy="360" r="184" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="450" cy="360" r="112" fill="none" stroke="currentColor" strokeWidth="0.6" />
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index * Math.PI) / 6;
          const x1 = roundCoord(450 + Math.cos(angle) * 112);
          const y1 = roundCoord(360 + Math.sin(angle) * 112);
          const x2 = roundCoord(450 + Math.cos(angle) * 250);
          const y2 = roundCoord(360 + Math.sin(angle) * 250);

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.6"
            />
          );
        })}
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 640 640"
        className="absolute -bottom-44 -left-40 h-[420px] w-[420px] text-ivory/10"
      >
        <path
          d="M320 68c84 74 168 158 222 252-54 94-138 178-222 252-84-74-168-158-222-252 54-94 138-178 222-252Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="320" cy="320" r="146" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M120 320h400M320 120v400M188 188l264 264M452 188 188 452" stroke="currentColor" strokeWidth="0.75" />
      </svg>
    </div>
  );
}

function MiniAstrolabe({
  progress,
  activeMark,
  activeLabel,
}: {
  progress: number;
  activeMark: FlowMark;
  activeLabel: string;
}) {
  const dashOffset = 283 - (progress / 100) * 283;

  return (
    <div className="mt-7 flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg aria-hidden="true" viewBox="0 0 120 120" className="h-full w-full text-gold">
          <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="2" />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeDasharray="283"
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="2.5"
            className="transition-all duration-700"
            transform="rotate(-90 60 60)"
          />
          <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
          <path d="M25 60h70M60 25v70M35 35l50 50M85 35 35 85" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <FlowIcon mark={activeMark} className="h-9 w-9 text-gold-light" stroke={1.65} />
          <span className="mt-1 font-ui text-[0.58rem] uppercase tracking-[0.14em] text-ivory/45">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <div>
        <p className="font-ui text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold/58">
          Current plate
        </p>
        <p className="mt-1 font-heading text-2xl text-ivory">{activeLabel}</p>
        <p className="mt-1 text-xs leading-relaxed text-ivory/44">
          The chart is opened one layer at a time.
        </p>
      </div>
    </div>
  );
}

function ZodiacWheelPicker({ onSelect }: { onSelect: (sign: ZodiacSign) => void }) {
  return (
    <div className="relative mx-auto flex min-h-[320px] w-full max-w-xl items-center justify-center md:min-h-[420px]">
      <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="absolute inset-y-8 left-1/2 w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      <div className="relative h-[292px] w-[292px] rounded-full border border-gold/25 bg-ink/70 shadow-[0_0_80px_rgba(184,138,58,0.12)] md:h-[380px] md:w-[380px]">
        <div className="absolute inset-4 rounded-full border border-gold/12" />
        <div className="absolute inset-12 rounded-full border border-ivory/8" />
        <div className="absolute inset-24 rounded-full bg-gold/10 blur-2xl" />
        <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-gold/18" />
        <div className="absolute inset-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-gold/28 bg-midnight/95 text-center shadow-[0_16px_60px_rgba(0,0,0,0.35)] md:h-36 md:w-36">
          <IconSun aria-hidden="true" className="h-12 w-12 text-gold-light md:h-14 md:w-14" stroke={1.45} />
          <span className="mt-1 font-ui text-[0.62rem] uppercase tracking-[0.16em] text-ivory/52">
            Begin
          </span>
        </div>
        {zodiacSigns.map((sign, index) => {
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const left = 50 + Math.cos(angle) * 39;
          const top = 50 + Math.sin(angle) * 39;

          return (
            <button
              key={sign}
              type="button"
              aria-label={`Select ${sign} from the zodiac wheel`}
              onClick={() => onSelect(sign)}
              className="group absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/28 bg-ink text-gold-light shadow-[0_10px_28px_rgba(0,0,0,0.28)] transition-all duration-300 hover:scale-125 hover:border-gold hover:bg-gold hover:text-ink focus-visible:scale-125 md:h-12 md:w-12"
              style={{
                left: percentCoord(left),
                top: percentCoord(top),
              }}
            >
              <ZodiacIcon sign={sign} className="h-7 w-7 md:h-8 md:w-8" stroke={1.65} />
              <span className="sr-only">{sign}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  body,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col justify-between p-6 animate-fade-in-up md:p-10">
      <div>
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.24em] text-gold/72">
          {eyebrow}
        </p>
        <h3 className="mt-4 max-w-3xl font-heading text-4xl font-semibold leading-tight text-ivory md:text-6xl">
          {title}
        </h3>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ivory/62 md:text-lg">
          {body}
        </p>
      </div>
      <div className="mt-10">{children}</div>
      {footer && <div className="mt-10">{footer}</div>}
    </div>
  );
}

function SignStep({ onSelect }: { onSelect: (sign: ZodiacSign) => void }) {
  return (
    <StepShell
      eyebrow="Step I - The visible layer"
      title="Start with your zodiac sign."
      body="Your Sun sign is only the first layer. Choose the sign you know, then the chart will calculate the structure behind it."
      footer={
        <p className="max-w-2xl text-sm leading-relaxed text-ivory/42">
          The selected sign is an entry point, not the final answer. If your
          calculated Sun sign differs from your selection, the result will use
          the calculated chart.
        </p>
      }
    >
      <ZodiacWheelPicker onSelect={onSelect} />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {zodiacSigns.map((sign) => {
          const details = zodiacDetails[sign];

          return (
            <button
              key={sign}
              type="button"
              aria-label={`Choose ${sign}`}
              onClick={() => onSelect(sign)}
              className="group min-h-36 rounded-[999px] border border-gold/18 bg-ink/72 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:bg-gold/10 hover:shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:rounded-[34px]"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold-light transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <ZodiacIcon sign={sign} className="h-8 w-8" stroke={1.65} />
                </span>
                <span>
                  <span className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold/64">
                    {details.element} / {details.quality}
                  </span>
                  <span className="mt-1 block font-heading text-3xl font-semibold text-ivory">
                    {sign}
                  </span>
                </span>
              </span>
              <span className="mt-4 block text-sm leading-relaxed text-ivory/48 group-hover:text-ivory/68">
                {details.hook}
              </span>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}

function IntentStep({
  selectedSign,
  onBack,
  onSelect,
}: {
  selectedSign: ZodiacSign | null;
  onBack: () => void;
  onSelect: (intent: ChartIntent) => void;
}) {
  const sign = selectedSign ?? "Your Sun sign";

  return (
    <StepShell
      eyebrow="Step II - The question"
      title={`${sign} is only the first layer.`}
      body="Now choose what you want the chart to clarify. This changes the way the preview speaks to you and which paid reading is recommended afterward."
      footer={
        <button
          type="button"
          onClick={onBack}
          className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/52 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-ivory"
        >
          Back to zodiac signs
        </button>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        {intentOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-label={`Choose ${option.label}`}
            onClick={() => onSelect(option.id)}
            className="group relative min-h-36 overflow-hidden rounded-[30px] border border-ivory/12 bg-midnight/72 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/55 hover:bg-gold/10"
          >
            <span className="pointer-events-none absolute -right-7 -top-7 flex h-24 w-24 items-center justify-center rounded-full border border-gold/10 text-gold/12 transition-all duration-300 group-hover:scale-110 group-hover:text-gold/22">
              <IntentIcon intent={option.id} className="h-14 w-14" stroke={1.2} />
            </span>
            <span className="relative flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/28 bg-gold/10 text-gold-light">
                <IntentIcon intent={option.id} className="h-7 w-7" stroke={1.65} />
              </span>
              <span>
                <span className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold/64">
                  {option.eyebrow}
                </span>
                <span className="mt-2 block font-heading text-2xl font-semibold text-ivory">
                  {option.label}
                </span>
              </span>
            </span>
            <span className="relative mt-4 block text-sm leading-relaxed text-ivory/50 group-hover:text-ivory/70">
              {option.body}
            </span>
          </button>
        ))}
      </div>
    </StepShell>
  );
}

function BirthDataStep({
  date,
  time,
  birthplaceQuery,
  selectedPlace,
  placeResults,
  showDropdown,
  isSearching,
  error,
  dropdownRef,
  onBack,
  onSubmit,
  onDateChange,
  onTimeChange,
  onCityChange,
  onCityFocus,
  onCityBlur,
  onChoosePlace,
}: {
  date: string;
  time: string;
  birthplaceQuery: string;
  selectedPlace: BirthplaceOption | null;
  placeResults: BirthplaceOption[];
  showDropdown: boolean;
  isSearching: boolean;
  error: string;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onCityFocus: () => void;
  onCityBlur: () => void;
  onChoosePlace: (place: BirthplaceOption) => void;
}) {
  function handleTimeInput(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value.replace(/\D/g, "");
    val = val.slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}:${val.slice(2)}`;
    }
    onTimeChange(val);
  }

  return (
    <StepShell
      eyebrow="Step III - The exact chart"
      title="Now give the chart its place and time."
      body="Your birth time determines your Rising sign, houses, chart ruler, and day or night chart. Your city gives the chart its horizon."
      footer={
        <button
          type="button"
          onClick={onBack}
          className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/52 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-ivory"
        >
          Back to intention
        </button>
      }
    >
      <form onSubmit={onSubmit} className="max-w-3xl border border-gold/22 bg-ink/72 p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/62">
              Birth date
            </span>
            <input
              required
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className="min-h-12 border border-ivory/14 bg-midnight px-4 font-ui text-sm text-ivory outline-none transition-colors placeholder:text-ivory/32 focus:border-gold"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/62">
              Birth time
            </span>
            <input
              required
              type="text"
              inputMode="numeric"
              pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
              placeholder="14:35"
              maxLength={5}
              value={time}
              onChange={handleTimeInput}
              className="min-h-12 border border-ivory/14 bg-midnight px-4 font-ui text-sm text-ivory outline-none transition-colors focus:border-gold"
            />
          </label>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ivory/42">
          If you do not know the exact time, use your best estimate. The Rising
          sign and houses may be less precise.
        </p>

        <div className="mt-6 grid gap-2">
          <label
            htmlFor="birthplace"
            className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/62"
          >
            Birth city
          </label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <input
                id="birthplace"
                required
                type="text"
                autoComplete="off"
                placeholder="Start typing a city..."
                value={birthplaceQuery}
                onChange={(event) => onCityChange(event.target.value)}
                onFocus={onCityFocus}
                onBlur={onCityBlur}
                className="min-h-12 w-full border border-ivory/14 bg-midnight px-4 pr-10 font-ui text-sm text-ivory outline-none transition-colors placeholder:text-ivory/32 focus:border-gold"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-ivory/20 border-t-gold" />
                </div>
              )}
              {selectedPlace && !isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gold">
                  <span className="font-ui text-sm">set</span>
                </div>
              )}
            </div>

            {showDropdown && placeResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto border border-gold/30 bg-ink shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                {placeResults.map((place, index) => (
                  <button
                    key={`${place.id}-${place.timezone}-${index}`}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onChoosePlace(place);
                      trackEvent("free_chart_city_search", { status: "found" });
                    }}
                    className="flex w-full items-center justify-between border-b border-ivory/8 px-4 py-3 text-left transition-colors last:border-0 hover:bg-gold/12"
                  >
                    <div>
                      <span className="block font-ui text-sm font-semibold text-ivory">
                        {formatBirthplace(place)}
                      </span>
                      <span className="mt-0.5 block font-ui text-xs text-ivory/42">
                        {place.timezone} / {place.latitude.toFixed(2)}, {place.longitude.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedPlace && (
            <p className="text-xs leading-relaxed text-gold/72">
              {formatBirthplace(selectedPlace)} / {selectedPlace.timezone} / {selectedPlace.latitude.toFixed(4)}, {selectedPlace.longitude.toFixed(4)}
            </p>
          )}

          <span className="text-xs leading-relaxed text-ivory/42">
            Start typing and select your city from the list. Latitude and
            longitude are set automatically.
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {quickPlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              aria-label={`Use ${formatBirthplace(place)}`}
              onClick={() => onChoosePlace(place)}
              className="border border-gold/20 px-3 py-2 font-ui text-xs text-ivory/68 transition-colors hover:border-gold/45 hover:text-ivory"
            >
              {formatBirthplace(place)}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-5 border border-rose/40 bg-rose/12 px-4 py-3 text-sm text-ivory">
            {error}
          </p>
        )}

        <div className="mt-7">
          <Button type="submit" size="lg" className="w-full" disabled={isSearching}>
            {isSearching ? "Searching the city..." : "Calculate My Chart"}
          </Button>
        </div>
      </form>
    </StepShell>
  );
}

function AnimatedChartFigure({
  progress,
  centerSign,
  centerLabel,
}: {
  progress: number;
  centerSign: ZodiacSign | null;
  centerLabel: string;
}) {
  const aspectLines = [
    { x1: 160, y1: 58, x2: 273, y2: 250, delay: "0s" },
    { x1: 273, y1: 250, x2: 78, y2: 250, delay: "0.18s" },
    { x1: 78, y1: 250, x2: 300, y2: 160, delay: "0.36s" },
    { x1: 300, y1: 160, x2: 52, y2: 160, delay: "0.54s" },
    { x1: 52, y1: 160, x2: 160, y2: 58, delay: "0.72s" },
  ];

  return (
    <div className="relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72 lg:h-80 lg:w-80 xl:h-[320px] xl:w-[320px]">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(184,138,58,0.18),transparent_58%)] blur-sm" />
      <svg
        aria-hidden="true"
        viewBox="0 0 320 320"
        className="relative h-full w-full overflow-visible text-gold drop-shadow-[0_22px_55px_rgba(0,0,0,0.4)]"
      >
        <circle cx="160" cy="160" r="145" fill="rgba(9,7,5,0.55)" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
        <circle cx="160" cy="160" r="118" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <circle cx="160" cy="160" r="74" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
        <circle cx="160" cy="160" r="34" fill="rgba(184,138,58,0.08)" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />

        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index * Math.PI) / 6 - Math.PI / 2;
          const x1 = roundCoord(160 + Math.cos(angle) * 34);
          const y1 = roundCoord(160 + Math.sin(angle) * 34);
          const x2 = roundCoord(160 + Math.cos(angle) * 145);
          const y2 = roundCoord(160 + Math.sin(angle) * 145);

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="0.8"
            />
          );
        })}

        <g className="astro-chart-draw">
          {aspectLines.map((line, index) => (
            <line
              key={index}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={index % 2 === 0 ? "#d2ad63" : "#8e4f45"}
              strokeOpacity="0.72"
              strokeWidth="1.3"
              strokeLinecap="round"
              style={{ animationDelay: line.delay }}
            />
          ))}
        </g>

      </svg>

      {chartPlanetMarkers.map(({ id, icon: Icon, left, top, delay }) => (
        <span
          key={id}
          aria-hidden="true"
          className="astro-float-soft absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-ink text-gold-light shadow-[0_10px_24px_rgba(0,0,0,0.28)] md:h-9 md:w-9"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: delay }}
        >
          <Icon className="h-5 w-5 md:h-6 md:w-6" stroke={1.55} />
        </span>
      ))}

      <div className="absolute flex h-32 w-32 flex-col items-center justify-center rounded-full border border-gold/38 bg-ink/95 p-4 shadow-[0_0_70px_rgba(184,138,58,0.22)] md:h-40 md:w-40">
        {centerSign ? (
          <ZodiacIcon sign={centerSign} className="h-14 w-14 text-gold-light md:h-16 md:w-16" stroke={1.55} />
        ) : (
          <IconSun aria-hidden="true" className="h-14 w-14 text-gold-light md:h-16 md:w-16" stroke={1.45} />
        )}
        <span className="mt-2 font-ui text-[0.62rem] uppercase tracking-[0.18em] text-gold/72">
          {centerLabel}
        </span>
        <span className="mt-1 font-ui text-[0.6rem] uppercase tracking-[0.14em] text-ivory/42">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

function CalculationStep({
  selectedSign,
  intent,
  calculationIndex,
}: {
  selectedSign: ZodiacSign | null;
  intent: (typeof intentOptions)[number];
  calculationIndex: number;
}) {
  const progress = ((calculationIndex + 1) / calculationMessages.length) * 100;
  const currentMessage =
    calculationMessages[calculationIndex] ?? calculationMessages[calculationMessages.length - 1];

  return (
    <div className="relative flex w-full min-w-0 flex-col overflow-hidden p-5 text-center animate-fade-in sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(184,138,58,0.14),transparent_34%),linear-gradient(180deg,transparent,rgba(9,7,5,0.32))]" />

      <div className="relative z-10 flex w-full flex-col items-center gap-8 xl:flex-row xl:items-center xl:text-left">
        <div className="flex w-full justify-center xl:w-5/12 xl:justify-end">
          <AnimatedChartFigure
            progress={progress}
            centerSign={selectedSign}
            centerLabel={selectedSign ?? "Sun"}
          />
        </div>

        <div className="mx-auto w-full max-w-xl xl:w-7/12">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.24em] text-gold/72">
            {currentMessage.eyebrow}
          </p>
          <h3 className="mt-3 font-heading text-3xl font-semibold leading-tight text-ivory md:text-4xl 2xl:text-5xl">
            {currentMessage.title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-ivory/66 md:text-base">
            {currentMessage.body}
          </p>

          <div className="mt-6 h-1.5 w-full overflow-hidden bg-ivory/10">
            <div
              className="h-full bg-gold transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 border border-gold/24 bg-ink/58 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] md:p-5">
            <p className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold/74">
              Why the Essential Reading matters
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ivory/68">
              {currentMessage.essential}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ivory/48">
              Your selected focus is {intent.shortLabel.toLowerCase()}. The paid
              reading keeps that question in view while reading the whole chart,
              not one placement in isolation.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 grid gap-3 md:grid-cols-3">
        {calculationTrustNotes.map((note) => (
          <article
            key={note.title}
            className="flex gap-3 border border-ivory/10 bg-ivory/[0.045] p-4 text-left"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/28 text-gold-light">
              <FlowIcon mark={note.mark} className="h-4 w-4" stroke={1.7} />
            </span>
            <span>
              <span className="block font-heading text-base font-semibold leading-tight text-ivory">
                {note.title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-ivory/58">
                {note.body}
              </span>
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

function ResultChartSeal({ result }: { result: NatalSnapshotResult }) {
  const signs = [result.sunSign, result.moonSign, result.risingSign];

  return (
    <div className="pointer-events-none absolute -right-28 -top-28 hidden h-80 w-80 text-gold-dark/10 animate-float md:block">
      <svg aria-hidden="true" viewBox="0 0 280 280" className="h-full w-full">
        <circle cx="140" cy="140" r="116" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="140" cy="140" r="82" fill="none" stroke="currentColor" strokeWidth="0.9" />
        <circle cx="140" cy="140" r="42" fill="rgba(184,138,58,0.10)" stroke="currentColor" strokeWidth="0.8" />
        <path d="M140 24v232M24 140h232M58 58l164 164M222 58 58 222" stroke="currentColor" strokeWidth="0.8" />
      </svg>
      {signs.map((sign, index) => {
        const angle = (index * 120 - 90) * (Math.PI / 180);
        const left = 50 + Math.cos(angle) * 28;
        const top = 50 + Math.sin(angle) * 28;

        return (
          <span
            key={`${sign}-${index}`}
            className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-current bg-ivory/30 text-gold-dark/45"
            style={{ left: percentCoord(left), top: percentCoord(top) }}
          >
            <ZodiacIcon sign={sign} className="h-8 w-8" stroke={1.45} />
          </span>
        );
      })}
    </div>
  );
}

function LockedChartWheel() {
  return (
    <div className="mb-6 flex justify-center">
      <div className="relative h-40 w-40">
        <svg aria-hidden="true" viewBox="0 0 180 180" className="h-full w-full text-gold/42">
          <circle cx="90" cy="90" r="74" fill="rgba(184,138,58,0.06)" stroke="currentColor" strokeWidth="1" />
          <circle cx="90" cy="90" r="52" fill="none" stroke="currentColor" strokeOpacity="0.65" strokeWidth="0.8" />
          <circle cx="90" cy="90" r="24" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="0.8" />
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (index * Math.PI) / 6 - Math.PI / 2;
            const x1 = roundCoord(90 + Math.cos(angle) * 24);
            const y1 = roundCoord(90 + Math.sin(angle) * 24);
            const x2 = roundCoord(90 + Math.cos(angle) * 74);
            const y2 = roundCoord(90 + Math.sin(angle) * 74);

            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeOpacity="0.36"
                strokeWidth="0.75"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/36 bg-ink text-gold">
            <IconLock aria-hidden="true" className="h-8 w-8" stroke={1.5} />
          </span>
        </div>
        <div className="absolute inset-0 rounded-full border border-gold/10 animate-pulse-soft" />
      </div>
    </div>
  );
}

function SnapshotResult({
  result,
  basicHref,
  completeHref,
  selectedSign,
  intent,
  rawIntent,
  birthplaceLabel,
  onRestart,
  onBack,
}: {
  result: NatalSnapshotResult;
  basicHref: string;
  completeHref: string;
  selectedSign: ZodiacSign | null;
  intent: (typeof intentOptions)[number];
  rawIntent: ChartIntent;
  birthplaceLabel: string;
  onRestart: () => void;
  onBack: () => void;
}) {
  let primaryTierKey: "basic" | "love" | "career" | "yearAhead" | "complete" = "complete";
  let alternativeTierKey: "basic" | "complete" = "basic";

  if (rawIntent === "love") {
    primaryTierKey = "love";
  } else if (rawIntent === "career" || rawIntent === "life-direction") {
    primaryTierKey = "career";
  } else if (rawIntent === "current-phase") {
    primaryTierKey = "yearAhead";
  }

  const primaryProduct = siteConfig.product[primaryTierKey];
  const alternativeProduct = siteConfig.product[alternativeTierKey];

  const primaryHref = `/checkout/${primaryTierKey === "yearAhead" ? "year-ahead" : primaryTierKey}`;
  const alternativeHref = `/checkout/${alternativeTierKey}`;

  const bigThree = [
    { label: "Sun", sign: result.sunSign },
    { label: "Moon", sign: result.moonSign },
    { label: "Rising", sign: result.risingSign },
  ];

  return (
    <div className="w-full bg-ivory text-ink animate-fade-in-up">
      <div className="relative overflow-hidden border-b border-gold/24 p-6 md:p-10">
        <ResultChartSeal result={result} />
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.22em] text-gold-dark/80">
              Your first chart reading
            </p>
            <h3 className="mt-4 font-heading text-4xl font-semibold leading-tight text-aubergine md:text-6xl">
              {result.sunSign} Sun. {result.moonSign} Moon. {result.risingSign} Rising.
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {bigThree.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-full border border-gold/28 bg-white/28 px-4 py-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/35 bg-gold/12 text-gold-dark">
                    <ZodiacIcon sign={item.sign} className="h-6 w-6" stroke={1.65} />
                  </span>
                  <span>
                    <span className="block font-ui text-[0.62rem] uppercase tracking-[0.16em] text-ink/42">
                      {item.label}
                    </span>
                    <span className="block font-heading text-xl font-semibold text-aubergine">
                      {item.sign}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-20 border border-gold/35 bg-ivory/80 px-4 py-3 font-ui text-xs uppercase tracking-[0.16em] text-ink/58 shadow-[0_14px_36px_rgba(244,234,215,0.3)] backdrop-blur-sm md:text-right">
            <span className="block normal-case tracking-normal">{birthplaceLabel}</span>
            <span className="mt-1 block">
              UTC {formatOffset(result.utcOffset)} / {result.timezone}
            </span>
          </div>
        </div>

        {selectedSign && selectedSign !== result.sunSign && (
          <p className="mt-6 border border-gold/30 bg-gold/10 px-5 py-4 text-sm leading-relaxed text-ink/68">
            You entered {selectedSign} as the starting point, but the calculated
            chart places the Sun in {result.sunSign}. The preview follows the
            calculated chart.
          </p>
        )}

        <p className="relative z-10 mt-6 text-lg leading-relaxed text-ink/72">{result.summary}</p>
        <p className="relative z-10 mt-4 text-base leading-relaxed text-ink/58">
          This preview identifies the front door of the chart. The complete
          reading reveals the architecture behind it: which symbols matter most,
          how they repeat, and where they ask for attention in real life.
        </p>

        <div className="relative z-10 mt-6 grid grid-cols-1 gap-0 overflow-hidden border border-gold/25 bg-white/30 sm:grid-cols-2 lg:grid-cols-3">
          {getPersonalizedHiddenCards(result).slice(0, 3).map((card) => (
            <div key={card.title} className="group relative border-b border-r border-gold/15 p-5 transition-all duration-300 hover:bg-gold/8 sm:last:border-r-0">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/15 text-gold-dark" aria-hidden="true">
                  <IconLock className="h-3.5 w-3.5" stroke={2} />
                </span>
                <div>
                  <h5 className="font-heading text-lg font-semibold leading-snug text-aubergine">
                    {card.title}
                  </h5>
                  <p className="mt-2 text-sm leading-relaxed text-ink/55">
                    {card.body.split('. ')[0]}.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/30" style={{
                    background: 'linear-gradient(180deg, rgba(48,27,23,0.35) 0%, rgba(48,27,23,0.05) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                    The full interpretation connects this to the house structure, aspects, and repeated themes across your chart...
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-7 border border-aubergine/15 bg-white/36 p-5 shadow-[0_16px_42px_rgba(48,27,23,0.08)] md:p-6">
          <p className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-dark/80">
            Your chart speaks
          </p>
          <h4 className="mt-2 font-heading text-2xl font-semibold leading-tight text-aubergine md:text-3xl">
            Your {result.sunSign} Sun with a {result.moonSign} Moon and {result.risingSign} Rising creates a pattern that connects to {result.placements.length + 2} other chart testimonies.
          </h4>
          <p className="mt-3 text-base leading-relaxed text-ink/68">
            The free preview answers your first question, but the full reading is where the separate symbols become one unified system.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href={primaryHref}
              size="md"
              analytics={{
                event: "reading_offer_click",
                params: {
                  offer_id: "basic-reading",
                  cta_location: "free_chart_result_decision_point",
                  selected_intent: rawIntent,
                },
              }}
            >
              See the Full Pattern — $17
            </Button>
            <p className="text-xs leading-relaxed text-ink/50">
              Automated reading. Delivered instantly by email. No subscription.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[0.58fr_0.42fr]">
        <div className="p-6 md:p-10">
          <article className="relative overflow-hidden rounded-[34px] border border-gold/28 bg-gold/10 p-5 md:p-6">
            <span className="pointer-events-none absolute -right-8 -top-10 flex h-28 w-28 items-center justify-center text-gold/10">
              <IntentIcon intent={rawIntent} className="h-24 w-24" stroke={1.05} />
            </span>
            <div className="relative">
              <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark/80">
                {intent.eyebrow}
              </p>
              <h4 className="mt-3 font-heading text-3xl font-semibold text-aubergine">
                {intent.title}
              </h4>
              <p className="mt-3 text-base leading-relaxed text-ink/68">
                {intent.body}
              </p>
            </div>
          </article>

          <div className="mt-6 grid gap-4">
            {result.placements.map((placement) => (
              <article key={placement.title} className="relative overflow-hidden rounded-[30px] border border-gold/20 bg-white/36 p-5 md:p-6">
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full border border-gold/14" />
                <h4 className="font-heading text-2xl font-semibold text-aubergine">
                  {placement.title}
                </h4>
                <p className="mt-3 text-base leading-relaxed text-ink/68">
                  {placement.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[result.rulerInterpretation, result.sectInterpretation].map((item) => (
              <article key={item.title} className="border border-aubergine/18 bg-aubergine/[0.04] p-5 md:p-6">
                <h4 className="font-heading text-2xl font-semibold text-aubergine">
                  {item.title}
                </h4>
                <p className="mt-3 text-base leading-relaxed text-ink/68">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 border-l-2 border-gold bg-gold/10 px-5 py-4">
            <p className="text-sm leading-relaxed text-ink/68">{result.calculationNote}</p>
          </div>

          <div className="mt-8 border border-aubergine/14 bg-white/34 p-5 md:p-6">
            <p className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gold-dark/78">
              Why the preview stops here
            </p>
            <h4 className="mt-2 font-heading text-2xl font-semibold text-aubergine">
              A free chart can open the door. The Essential Reading shows the room.
            </h4>
            <div className="mt-5 grid gap-3">
              {freeVsEssentialRows.map((row) => (
                <div
                  key={row.free}
                  className="grid gap-2 border-t border-aubergine/10 pt-3 text-sm leading-relaxed first:border-t-0 first:pt-0 md:grid-cols-[0.42fr_0.58fr]"
                >
                  <p className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink/42">
                    {row.free}
                  </p>
                  <p className="text-ink/68">{row.essential}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="bg-ink p-6 text-ivory md:p-8 lg:border-l lg:border-gold/18">
          <div className="sticky top-24">
            <LockedChartWheel />
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              Still hidden in your full chart
            </p>
            <h4 className="mt-3 font-heading text-3xl font-semibold">
              The paid reading is where the separate symbols become one system.
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-ivory/68">
              A full reading does not simply add more paragraphs. It decides
              which placements matter most, which houses carry the story, and
              where your chart repeats the same theme through different symbols.
            </p>

            <div className="mt-6 grid gap-0 border-y border-ivory/12">
              {getPersonalizedHiddenCards(result).map((card) => (
                <article
                  key={card.title}
                  className="border-b border-ivory/12 py-4 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    {card.personal && (
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/18 text-gold-light">
                        <IconLock className="h-3 w-3" stroke={2} />
                      </span>
                    )}
                    <div>
                      <h5 className="font-heading text-xl font-semibold text-ivory">
                        {card.title}
                      </h5>
                      <p className="mt-2 text-sm leading-relaxed text-ivory/64">
                        {card.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-7 border border-gold/28 bg-gold/10 p-5">
              <p className="font-ui text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-gold/80">
                Recommended next
              </p>
              <h5 className="mt-2 font-heading text-2xl font-semibold">
                {primaryProduct.name}
              </h5>
              <p className="mt-3 text-sm leading-relaxed text-ivory/66">
                {primaryProduct.summary}
              </p>
              <div className="mt-5 grid gap-3 border-y border-ivory/12 py-4">
                <div className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/28 text-gold-light">
                    <FlowIcon mark="spark" className="h-4 w-4" stroke={1.7} />
                  </span>
                  <span>
                    <span className="block font-heading text-lg font-semibold leading-tight text-ivory">
                      {primaryProduct.format}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-ivory/58">
                      {primaryProduct.priceNote}. {primaryProduct.delivery}.
                    </span>
                  </span>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                <Button
                  href={primaryHref}
                  size="md"
                  className="w-full"
                  analytics={{
                    event: "reading_offer_click",
                    params: {
                      offer_id: primaryTierKey,
                      cta_location: "free_chart_quiz_result",
                      selected_intent: rawIntent,
                    },
                  }}
                >
                  Order {primaryProduct.name} - {primaryProduct.price}
                </Button>
                <Button
                  href={alternativeHref}
                  variant="secondary"
                  size="md"
                  className="w-full"
                  analytics={{
                    event: "reading_offer_click",
                    params: {
                      offer_id: alternativeTierKey,
                      cta_location: "free_chart_quiz_result_alternative",
                      selected_intent: rawIntent,
                    },
                  }}
                >
                  Compare {alternativeProduct.name} - {alternativeProduct.price}
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={onBack}
                className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/48 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-ivory"
              >
                Edit birth data
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="font-ui text-xs font-semibold uppercase tracking-[0.16em] text-ivory/48 underline decoration-gold/50 underline-offset-4 transition-colors hover:text-ivory"
              >
                Start again
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
