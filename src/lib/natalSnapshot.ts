export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type Planet =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn";

export interface CityPreset {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface NatalSnapshotInput {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PlacementInterpretation {
  title: string;
  body: string;
}

export interface NatalSnapshotResult {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign;
  chartRuler: Planet;
  sect: "Day chart" | "Night chart";
  summary: string;
  placements: PlacementInterpretation[];
  rulerInterpretation: PlacementInterpretation;
  sectInterpretation: PlacementInterpretation;
  timezone: string;
  utcOffset: number;
  calculationNote: string;
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export const zodiacSigns: ZodiacSign[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

export const cityPresets: CityPreset[] = [
  { id: "new-york", label: "New York, USA", latitude: 40.7128, longitude: -74.006, timezone: "America/New_York" },
  { id: "los-angeles", label: "Los Angeles, USA", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { id: "chicago", label: "Chicago, USA", latitude: 41.8781, longitude: -87.6298, timezone: "America/Chicago" },
  { id: "toronto", label: "Toronto, Canada", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto" },
  { id: "london", label: "London, UK", latitude: 51.5072, longitude: -0.1276, timezone: "Europe/London" },
  { id: "paris", label: "Paris, France", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris" },
  { id: "berlin", label: "Berlin, Germany", latitude: 52.52, longitude: 13.405, timezone: "Europe/Berlin" },
  { id: "lisbon", label: "Lisbon, Portugal", latitude: 38.7223, longitude: -9.1393, timezone: "Europe/Lisbon" },
  { id: "madrid", label: "Madrid, Spain", latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid" },
  { id: "rome", label: "Rome, Italy", latitude: 41.9028, longitude: 12.4964, timezone: "Europe/Rome" },
  { id: "sao-paulo", label: "Sao Paulo, Brazil", latitude: -23.5558, longitude: -46.6396, timezone: "America/Sao_Paulo" },
  { id: "porto-alegre", label: "Porto Alegre, Brazil", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" },
  { id: "rio-de-janeiro", label: "Rio de Janeiro, Brazil", latitude: -22.9068, longitude: -43.1729, timezone: "America/Sao_Paulo" },
  { id: "buenos-aires", label: "Buenos Aires, Argentina", latitude: -34.6037, longitude: -58.3816, timezone: "America/Argentina/Buenos_Aires" },
  { id: "mexico-city", label: "Mexico City, Mexico", latitude: 19.4326, longitude: -99.1332, timezone: "America/Mexico_City" },
  { id: "cape-town", label: "Cape Town, South Africa", latitude: -33.9249, longitude: 18.4241, timezone: "Africa/Johannesburg" },
  { id: "dubai", label: "Dubai, UAE", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai" },
  { id: "mumbai", label: "Mumbai, India", latitude: 19.076, longitude: 72.8777, timezone: "Asia/Kolkata" },
  { id: "singapore", label: "Singapore", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore" },
  { id: "tokyo", label: "Tokyo, Japan", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },
  { id: "sydney", label: "Sydney, Australia", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
];

const signProfiles: Record<
  ZodiacSign,
  {
    element: "Fire" | "Earth" | "Air" | "Water";
    mode: "Cardinal" | "Fixed" | "Mutable";
    sun: string;
    moon: string;
    rising: string;
  }
> = {
  Aries: {
    element: "Fire",
    mode: "Cardinal",
    sun: "Your vitality grows through direct action, courage, and the willingness to begin before every detail is perfect.",
    moon: "Emotionally, you need movement, honesty, and the freedom to respond quickly when something matters.",
    rising: "You meet life through initiative. People may experience you as direct, alert, and ready to open the next door.",
  },
  Taurus: {
    element: "Earth",
    mode: "Fixed",
    sun: "Your vitality grows through steadiness, craft, patience, and building something that can actually last.",
    moon: "Emotionally, you need calm, texture, trust, and a body-level sense that life is not rushing you.",
    rising: "You meet life through presence. People may experience you as grounded, tactile, and quietly self-possessed.",
  },
  Gemini: {
    element: "Air",
    mode: "Mutable",
    sun: "Your vitality grows through language, curiosity, exchange, and the ability to hold more than one idea at once.",
    moon: "Emotionally, you need conversation, variety, and a way to name what is moving through your mind.",
    rising: "You meet life through observation. People may experience you as bright, responsive, and mentally alive.",
  },
  Cancer: {
    element: "Water",
    mode: "Cardinal",
    sun: "Your vitality grows through protection, memory, emotional intelligence, and devotion to what feels like home.",
    moon: "Emotionally, you need safety, tenderness, privacy, and permission to move with your changing tides.",
    rising: "You meet life through sensitivity. People may experience you as protective, perceptive, and difficult to read too quickly.",
  },
  Leo: {
    element: "Fire",
    mode: "Fixed",
    sun: "Your vitality grows through creative dignity, loyal expression, and the courage to be seen without apologizing.",
    moon: "Emotionally, you need warmth, recognition, play, and a sense that your heart has room to perform honestly.",
    rising: "You meet life through radiance. People may experience you as warm, proud, expressive, or naturally theatrical.",
  },
  Virgo: {
    element: "Earth",
    mode: "Mutable",
    sun: "Your vitality grows through skill, discernment, useful work, and improving what others might leave vague.",
    moon: "Emotionally, you need order, clarity, practical care, and a way to reduce anxiety through useful action.",
    rising: "You meet life through refinement. People may experience you as careful, observant, precise, and quietly helpful.",
  },
  Libra: {
    element: "Air",
    mode: "Cardinal",
    sun: "Your vitality grows through proportion, social intelligence, beauty, and the art of choosing with grace.",
    moon: "Emotionally, you need harmony, fairness, companionship, and a relational mirror that does not erase you.",
    rising: "You meet life through balance. People may experience you as elegant, diplomatic, receptive, and socially aware.",
  },
  Scorpio: {
    element: "Water",
    mode: "Fixed",
    sun: "Your vitality grows through depth, loyalty, emotional truth, and the courage to face what others avoid.",
    moon: "Emotionally, you need trust, privacy, intensity, and relationships where nothing important is kept superficial.",
    rising: "You meet life through intensity. People may experience you as magnetic, guarded, penetrating, or hard to fool.",
  },
  Sagittarius: {
    element: "Fire",
    mode: "Mutable",
    sun: "Your vitality grows through meaning, movement, study, travel, and the search for a wider horizon.",
    moon: "Emotionally, you need possibility, humor, openness, and the feeling that life still has room to expand.",
    rising: "You meet life through vision. People may experience you as candid, restless, generous, and future-facing.",
  },
  Capricorn: {
    element: "Earth",
    mode: "Cardinal",
    sun: "Your vitality grows through discipline, competence, time, and the private pride of earning your authority.",
    moon: "Emotionally, you need reliability, respect, long-term structure, and space to feel without losing composure.",
    rising: "You meet life through gravity. People may experience you as composed, serious, capable, and self-directed.",
  },
  Aquarius: {
    element: "Air",
    mode: "Fixed",
    sun: "Your vitality grows through distance, pattern recognition, friendship, and refusing to think exactly as expected.",
    moon: "Emotionally, you need perspective, mental space, community, and the freedom to process feelings in your own way.",
    rising: "You meet life through difference. People may experience you as unusual, observant, principled, or quietly contrary.",
  },
  Pisces: {
    element: "Water",
    mode: "Mutable",
    sun: "Your vitality grows through imagination, compassion, surrender, and sensitivity to invisible atmospheres.",
    moon: "Emotionally, you need softness, art, spiritual space, and permission to feel what cannot be neatly explained.",
    rising: "You meet life through permeability. People may experience you as gentle, elusive, intuitive, and hard to define.",
  },
};

const traditionalRulers: Record<ZodiacSign, Planet> = {
  Aries: "Mars",
  Taurus: "Venus",
  Gemini: "Mercury",
  Cancer: "Moon",
  Leo: "Sun",
  Virgo: "Mercury",
  Libra: "Venus",
  Scorpio: "Mars",
  Sagittarius: "Jupiter",
  Capricorn: "Saturn",
  Aquarius: "Saturn",
  Pisces: "Jupiter",
};

const rulerInterpretations: Record<Planet, string> = {
  Sun: "A solar chart ruler asks for visibility, self-command, and a life shaped by what strengthens your core identity.",
  Moon: "A lunar chart ruler makes feeling, memory, body rhythm, and emotional safety central to how the chart operates.",
  Mercury: "A Mercurial chart ruler points to language, learning, trade, analysis, and adaptability as major life tools.",
  Venus: "A Venusian chart ruler emphasizes desire, taste, relationship, harmony, pleasure, and the value of what you choose.",
  Mars: "A Martial chart ruler brings courage, conflict, appetite, protection, and decisive action into the foreground.",
  Jupiter: "A Jupiterian chart ruler seeks meaning, faith, teaching, generosity, growth, and a larger story to live inside.",
  Saturn: "A Saturnian chart ruler asks for time, maturity, discipline, boundaries, and authority built through endurance.",
};

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function degToRad(value: number): number {
  return value * DEG_TO_RAD;
}

function radToDeg(value: number): number {
  return value * RAD_TO_DEG;
}

function signFromLongitude(longitude: number): ZodiacSign {
  return zodiacSigns[Math.floor(normalizeDegrees(longitude) / 30)] ?? "Aries";
}

function offsetAtUtcInstant(utcMs: number, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = formatter.formatToParts(new Date(utcMs));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const zonedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return (zonedAsUtc - utcMs) / 3600000;
}

function timezoneOffsetHours(date: string, time: string, timezone: string): number {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const localUtcMs = Date.UTC(year, month - 1, day, hour, minute);
  const firstOffset = offsetAtUtcInstant(localUtcMs, timezone);
  const correctedUtcMs = localUtcMs - firstOffset * 60 * 60 * 1000;
  return offsetAtUtcInstant(correctedUtcMs, timezone);
}

function julianDayFromInput(input: NatalSnapshotInput, utcOffset: number): number {
  const [year, month, day] = input.date.split("-").map(Number);
  const [hour, minute] = input.time.split(":").map(Number);
  const localUtcMs = Date.UTC(year, month - 1, day, hour, minute);
  const utcMs = localUtcMs - utcOffset * 60 * 60 * 1000;
  return utcMs / 86400000 + 2440587.5;
}

function sunLongitude(julianDay: number): number {
  const n = julianDay - 2451545.0;
  const meanLongitude = normalizeDegrees(280.460 + 0.9856474 * n);
  const meanAnomaly = normalizeDegrees(357.528 + 0.9856003 * n);
  return normalizeDegrees(
    meanLongitude +
      1.915 * Math.sin(degToRad(meanAnomaly)) +
      0.02 * Math.sin(degToRad(2 * meanAnomaly)),
  );
}

function moonLongitude(julianDay: number): number {
  const n = julianDay - 2451545.0;
  const meanLongitude = normalizeDegrees(218.316 + 13.176396 * n);
  const moonAnomaly = normalizeDegrees(134.963 + 13.064993 * n);
  const sunAnomaly = normalizeDegrees(357.529 + 0.98560028 * n);
  const elongation = normalizeDegrees(297.85 + 12.190749 * n);
  const argumentLatitude = normalizeDegrees(93.272 + 13.22935 * n);

  return normalizeDegrees(
    meanLongitude +
      6.289 * Math.sin(degToRad(moonAnomaly)) +
      1.274 * Math.sin(degToRad(2 * elongation - moonAnomaly)) +
      0.658 * Math.sin(degToRad(2 * elongation)) +
      0.214 * Math.sin(degToRad(2 * moonAnomaly)) -
      0.186 * Math.sin(degToRad(sunAnomaly)) -
      0.114 * Math.sin(degToRad(2 * argumentLatitude)),
  );
}

function localSiderealTime(julianDay: number, longitude: number): number {
  const t = (julianDay - 2451545.0) / 36525;
  const gmst =
    280.46061837 +
    360.98564736629 * (julianDay - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  return normalizeDegrees(gmst + longitude);
}

function ascendantLongitude(julianDay: number, latitude: number, longitude: number): number {
  const obliquity = degToRad(23.439291);
  const sidereal = degToRad(localSiderealTime(julianDay, longitude));
  const lat = degToRad(latitude);
  const ascendant = Math.atan2(
    Math.cos(sidereal),
    -(Math.sin(sidereal) * Math.cos(obliquity) + Math.tan(lat) * Math.sin(obliquity)),
  );
  return normalizeDegrees(radToDeg(ascendant));
}

function sunAltitude(
  julianDay: number,
  latitude: number,
  longitude: number,
  sunEclipticLongitude: number,
): number {
  const obliquity = degToRad(23.439291);
  const lambda = degToRad(sunEclipticLongitude);
  const rightAscension = Math.atan2(Math.sin(lambda) * Math.cos(obliquity), Math.cos(lambda));
  const declination = Math.asin(Math.sin(lambda) * Math.sin(obliquity));
  const hourAngle = degToRad(localSiderealTime(julianDay, longitude)) - rightAscension;
  const lat = degToRad(latitude);

  return radToDeg(
    Math.asin(
      Math.sin(lat) * Math.sin(declination) +
        Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle),
    ),
  );
}

function placementTitle(body: "Sun" | "Moon" | "Rising", sign: ZodiacSign): string {
  return `${body} in ${sign}`;
}

function buildSummary(sunSign: ZodiacSign, moonSign: ZodiacSign, risingSign: ZodiacSign): string {
  const sun = signProfiles[sunSign];
  const moon = signProfiles[moonSign];
  const rising = signProfiles[risingSign];

  return `A ${sun.element.toLowerCase()} Sun, ${moon.element.toLowerCase()} Moon, and ${rising.mode.toLowerCase()} ${risingSign} rising gives this snapshot its first shape: vitality through ${sunSign}, instinct through ${moonSign}, and a visible doorway through ${risingSign}.`;
}

export function calculateNatalSnapshot(input: NatalSnapshotInput): NatalSnapshotResult {
  const utcOffset = timezoneOffsetHours(input.date, input.time, input.timezone);
  const julianDay = julianDayFromInput(input, utcOffset);
  const sunLong = sunLongitude(julianDay);
  const moonLong = moonLongitude(julianDay);
  const risingLong = ascendantLongitude(julianDay, input.latitude, input.longitude);
  const sunSign = signFromLongitude(sunLong);
  const moonSign = signFromLongitude(moonLong);
  const risingSign = signFromLongitude(risingLong);
  const chartRuler = traditionalRulers[risingSign];
  const sect = sunAltitude(julianDay, input.latitude, input.longitude, sunLong) >= 0 ? "Day chart" : "Night chart";

  return {
    sunSign,
    moonSign,
    risingSign,
    chartRuler,
    sect,
    summary: buildSummary(sunSign, moonSign, risingSign),
    placements: [
      {
        title: placementTitle("Sun", sunSign),
        body: signProfiles[sunSign].sun,
      },
      {
        title: placementTitle("Moon", moonSign),
        body: signProfiles[moonSign].moon,
      },
      {
        title: placementTitle("Rising", risingSign),
        body: signProfiles[risingSign].rising,
      },
    ],
    rulerInterpretation: {
      title: `${chartRuler} as chart ruler`,
      body: rulerInterpretations[chartRuler],
    },
    sectInterpretation: {
      title: sect,
      body:
        sect === "Day chart"
          ? "With the Sun above the horizon, the chart leans toward visibility, purpose, social role, and the work of acting from conscious direction."
          : "With the Sun below the horizon, the chart leans toward instinct, privacy, emotional weather, and the inner life that quietly steers decisions.",
    },
    timezone: input.timezone,
    utcOffset,
    calculationNote:
      "This free snapshot uses a lightweight browser calculation, city-based geocoding, and static interpretations. A paid reading verifies the birth data and interprets the whole chart, including houses, rulers, aspects, condition, and emphasis.",
  };
}
