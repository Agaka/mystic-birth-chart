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
    sun: "Your life force strengthens when you are allowed to begin, act, test courage, and answer life directly. You can lose vitality when you are kept waiting for permission or forced to over-explain an instinct that already knows it needs movement. A full reading would ask where Mars is placed, because Aries fire can become clean initiative, constant conflict, or a heroic refusal to stay small depending on the rest of the chart.",
    moon: "Your emotional system needs honesty, motion, and enough freedom to respond before the feeling goes stale. Anger, impatience, and sudden enthusiasm may all be signals that something in you wants to move now, not after everyone else agrees. A full reading would look at Mars, the Moon's house, and its aspects to see whether this emotional fire is protecting you, rushing you, or trying to wake you up.",
    rising: "You meet life through initiative. People may experience you as direct, alert, self-starting, or difficult to ignore, even when you do not feel as confident inside as you look from the outside. A full reading would follow Mars, your chart ruler, to see where the story actually goes after that first impact.",
  },
  Taurus: {
    element: "Earth",
    mode: "Fixed",
    sun: "Your life force strengthens through steadiness, craft, patience, and the quiet proof that something can actually last. You may not come alive through pressure or spectacle; you come alive when your senses, values, body, and time are treated with respect. A full reading would ask what Venus is doing, because Taurus can describe peace, pleasure, loyalty, or stubborn self-protection depending on how the chart supports it.",
    moon: "Your emotional body needs calm, texture, consistency, and a pace that does not constantly rip you away from yourself. You may process feelings through the body first: appetite, tension, fatigue, comfort, touch, beauty, and the need to feel safe in your own skin. A full reading would look at Venus and the Moon's house to see where you seek stability and where life asks you to soften without losing ground.",
    rising: "You meet life through presence. People may experience you as grounded, tactile, steady, attractive, or quietly resistant to being hurried. A full reading would follow Venus, your chart ruler, because the real story is not only that you seem calm; it is where your desire, value, and attachment are leading the chart.",
  },
  Gemini: {
    element: "Air",
    mode: "Mutable",
    sun: "Your life force strengthens through language, curiosity, exchange, and the ability to keep more than one door open. You may feel most alive when you are learning, comparing, asking, translating, or moving between worlds that other people keep separate. A full reading would examine Mercury, because Gemini brightness can become skill, restlessness, anxiety, comedy, teaching, or clever survival depending on the whole chart.",
    moon: "Your emotional life needs words, movement, and the relief of naming what is happening inside before it becomes too heavy. You may think your feelings before you feel them, or need conversation to understand what your body already knows. A full reading would study Mercury, the Moon's house, and the aspects to see whether your mind is helping your emotions breathe or keeping them in constant motion.",
    rising: "You meet life through observation. People may experience you as quick, responsive, curious, talkative, or mentally awake to every small change in the room. A full reading would follow Mercury, your chart ruler, to see whether this life path is organized around study, communication, trade, nervous adaptation, or the art of moving between identities.",
  },
  Cancer: {
    element: "Water",
    mode: "Cardinal",
    sun: "Your life force strengthens through protection, memory, emotional intelligence, and devotion to what feels worthy of care. You may be more motivated by belonging, ancestry, family, privacy, and loyalty than by abstract achievement. A full reading would ask where the Moon is placed, because Cancer can be tenderness, guardedness, leadership through care, or a life organized around emotional inheritance.",
    moon: "Your emotional life needs safety, tenderness, privacy, and permission to change shape without being called inconsistent. Your moods may carry information, especially about belonging, memory, attachment, and what your body experiences as home. A full reading would study the Moon's house, phase, and aspects to see whether you are protecting what is sacred or protecting yourself from being seen.",
    rising: "You meet life through sensitivity. People may experience you as protective, perceptive, watchful, and difficult to read too quickly. A full reading would follow the Moon, your chart ruler, because your path often moves through tides: memory, family, care, retreat, return, and the question of where you truly belong.",
  },
  Leo: {
    element: "Fire",
    mode: "Fixed",
    sun: "Your life force strengthens through creative dignity, loyal expression, and the courage to be seen without apologizing for having a center. You may feel drained when life asks you to hide your warmth, mute your pride, or perform for approval instead of creating from the heart. A full reading would study the Sun by house and aspect to see where your radiance is natural and where it has become a wound around recognition.",
    moon: "Your emotional life needs warmth, play, appreciation, and a place where your heart can express itself without being mocked or minimized. You may not only want attention; you may need proof that your feeling has an audience that cares. A full reading would look at the Moon's house and the Sun's condition to understand whether your need for recognition is nourishing, theatrical, private, or complicated by pride.",
    rising: "You meet life through radiance. People may experience you as warm, proud, expressive, dramatic, loyal, or hard to miss. A full reading would follow the Sun, your chart ruler, because the question is not only how visible you are; it is where your life is asking you to become coherent, dignified, and creatively alive.",
  },
  Virgo: {
    element: "Earth",
    mode: "Mutable",
    sun: "Your life force strengthens through skill, discernment, useful work, and the quiet satisfaction of making something cleaner, clearer, or more functional than it was before. You may suffer when your care turns into constant self-correction. A full reading would study Mercury, because Virgo can describe devotion to craft, nervous perfectionism, healing intelligence, or a life organized around service and refinement.",
    moon: "Your emotional life needs order, clarity, practical care, and a way to make anxiety useful instead of letting it circle endlessly. You may process feeling by fixing, sorting, improving, or trying to understand what went wrong. A full reading would study Mercury and the Moon's aspects to see whether your precision is protecting your sensitivity or quietly exhausting it.",
    rising: "You meet life through refinement. People may experience you as observant, careful, precise, modest, analytical, and quietly helpful. A full reading would follow Mercury, your chart ruler, to see where your intelligence is being spent: on service, study, worry, healing, critique, or the lifelong work of separating what matters from what merely nags.",
  },
  Libra: {
    element: "Air",
    mode: "Cardinal",
    sun: "Your life force strengthens through proportion, social intelligence, beauty, and the difficult art of choosing without losing grace. You may be more decisive than people assume, but your decisions often pass through relationship, fairness, and consequence first. A full reading would study Venus, because Libra can describe charm, diplomacy, aesthetic judgment, relational intelligence, or the burden of keeping peace at your own expense.",
    moon: "Your emotional life needs harmony, fairness, companionship, and a relational mirror that does not erase you. You may feel unsettled when the atmosphere is ugly, unjust, or socially tense, even if nobody else admits something is wrong. A full reading would study Venus and the Moon's house to see where you seek balance and where life asks you to stop negotiating against your own need.",
    rising: "You meet life through balance. People may experience you as elegant, receptive, diplomatic, visually aware, and socially intelligent. A full reading would follow Venus, your chart ruler, because the deeper question is where your desire for harmony leads the life: relationship, art, justice, public grace, or the hard lesson of choosing.",
  },
  Scorpio: {
    element: "Water",
    mode: "Fixed",
    sun: "Your life force strengthens through depth, loyalty, emotional truth, and the courage to face what other people prefer to keep buried. You may not be satisfied with surface explanations, and you may feel false around anything too polite to be honest. A full reading would study Mars, because Scorpio can become strategy, protection, obsession, healing, secrecy, or the power to endure transformation.",
    moon: "Your emotional life needs trust, privacy, intensity, and relationships where the important thing is not treated like an inconvenience. You may feel deeply, but you may reveal that feeling only after testing whether the other person can handle truth. A full reading would study Mars, the Moon's house, and aspects to see whether your emotional intensity is guarding a wound, protecting loyalty, or asking to become clean power.",
    rising: "You meet life through intensity. People may experience you as magnetic, guarded, penetrating, private, or hard to fool. A full reading would follow Mars, your chart ruler, because your first impression is only the surface of a deeper question: where is your life asking for courage, confrontation, protection, and transformation?",
  },
  Sagittarius: {
    element: "Fire",
    mode: "Mutable",
    sun: "Your life force strengthens through meaning, movement, study, travel, and the search for a horizon wide enough to believe in. You may feel trapped when life becomes too small, too literal, or too committed to fear. A full reading would study Jupiter, because Sagittarius can become wisdom, exaggeration, teaching, faith, escape, or the refusal to live without a larger story.",
    moon: "Your emotional life needs possibility, humor, spaciousness, and the feeling that the future has not closed. You may recover through movement, learning, laughter, or a change of perspective that reminds you life is bigger than the current room. A full reading would study Jupiter and the Moon's house to see whether your need for freedom is nourishment, avoidance, philosophy, or a genuine spiritual appetite.",
    rising: "You meet life through vision. People may experience you as candid, restless, generous, blunt, hopeful, or always oriented toward the next horizon. A full reading would follow Jupiter, your chart ruler, because the important question is where your life seeks meaning, where it overreaches, and where faith becomes a path instead of a slogan.",
  },
  Capricorn: {
    element: "Earth",
    mode: "Cardinal",
    sun: "Your life force strengthens through discipline, competence, time, and the private pride of earning authority rather than pretending to have it. You may come alive slowly, especially when life gives you a mountain worth climbing. A full reading would study Saturn, because Capricorn can describe maturity, pressure, ambition, loneliness, mastery, or the long work of becoming someone you can respect.",
    moon: "Your emotional life needs reliability, respect, long-term structure, and enough privacy to feel without losing composure. You may not trust feelings that arrive without form, and you may have learned early to become capable before you felt ready. A full reading would study Saturn and the Moon's house to see where emotional restraint protects you and where it quietly withholds nourishment.",
    rising: "You meet life through gravity. People may experience you as composed, serious, capable, reserved, self-directed, or older than your years. A full reading would follow Saturn, your chart ruler, because the deeper story is where life asks you to build authority slowly, carry weight wisely, and stop confusing pressure with purpose.",
  },
  Aquarius: {
    element: "Air",
    mode: "Fixed",
    sun: "Your life force strengthens through distance, pattern recognition, friendship, and the refusal to think exactly as expected. You may need enough separation from the crowd to see the system clearly. A full reading would study Saturn, because Aquarius can describe principle, exile, intelligence, social vision, emotional distance, or the burden of belonging to the future before the present understands you.",
    moon: "Your emotional life needs perspective, mental space, community, and the freedom to process feelings in your own way. You may not want to be swallowed by emotion; you may need to understand the pattern before you can admit the feeling. A full reading would study Saturn, the Moon's house, and aspects to see whether detachment is wisdom, self-protection, loneliness, or a genuine need for clean air.",
    rising: "You meet life through difference. People may experience you as unusual, observant, principled, cool, inventive, or quietly contrary. A full reading would follow Saturn, your chart ruler, because the real story is not only that you are different; it is where that difference becomes discipline, responsibility, community, or distance.",
  },
  Pisces: {
    element: "Water",
    mode: "Mutable",
    sun: "Your life force strengthens through imagination, compassion, surrender, and sensitivity to atmospheres that other people may not notice until much later. You may feel most alive when life has meaning, beauty, music, prayer, myth, or mercy in it. A full reading would study Jupiter, because Pisces can become devotion, confusion, artistry, spiritual hunger, porous boundaries, or the gift of seeing what cannot be reduced to facts.",
    moon: "Your emotional life needs softness, art, spiritual space, and permission to feel what cannot be explained neatly. You may absorb more than you realize, and you may need solitude or ritual to know which feelings are actually yours. A full reading would study Jupiter and the Moon's house to see whether your sensitivity is intuition, overwhelm, compassion, escape, or a doorway into real inner guidance.",
    rising: "You meet life through permeability. People may experience you as gentle, elusive, intuitive, imaginative, or difficult to define in one fixed role. A full reading would follow Jupiter, your chart ruler, because the deeper question is where your life asks for faith, meaning, protection from confusion, and a path large enough for your sensitivity.",
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
  Sun: "Because the Sun rules your Ascendant, visibility, self-command, dignity, and the question of what makes you feel alive become central to the chart. This preview can name the ruler, but the real interpretation depends on the Sun's house, aspects, strength, and role in the whole pattern. A complete reading would ask where your life is asking you to become coherent rather than merely visible.",
  Moon: "Because the Moon rules your Ascendant, feeling, memory, body rhythm, instinct, and emotional safety become central to how the chart operates. This preview can name that lunar doorway, but a complete reading would ask where the Moon is placed, what phase it carries, and which areas of life are shaped by mood, attachment, care, and repetition.",
  Mercury: "Because Mercury rules your Ascendant, language, learning, analysis, trade, movement, and adaptation become major life tools. This preview can name the Mercurial thread, but a complete reading would ask where Mercury lives, what it rules, and whether your mind is serving clarity, survival, craft, nervous motion, or a deeper vocation of interpretation.",
  Venus: "Because Venus rules your Ascendant, desire, taste, relationship, beauty, pleasure, value, and the ability to receive become central to the chart. This preview can name the Venusian thread, but a complete reading would ask where Venus is placed, what she rules, and whether love, money, aesthetics, or self-worth are carrying more of your life story than you realize.",
  Mars: "Because Mars rules your Ascendant, courage, appetite, anger, protection, conflict, and decisive action move toward the foreground. This preview can name the Martial thread, but a complete reading would ask where Mars is placed, what it is fighting for, and whether your fire is defending your life, creating friction, or asking for cleaner direction.",
  Jupiter: "Because Jupiter rules your Ascendant, meaning, faith, teaching, generosity, growth, and the need for a larger story become central to the chart. This preview can name the Jupiterian thread, but a complete reading would ask where Jupiter expands life, where it overpromises, and where wisdom has to become more practical than hope alone.",
  Saturn: "Because Saturn rules your Ascendant, time, maturity, discipline, boundaries, responsibility, and earned authority become central to the chart. This preview can name the Saturnian thread, but a complete reading would ask where Saturn is placed, what it rules, and whether pressure is becoming mastery, fear, loneliness, or a serious calling.",
};

const sectInterpretations: Record<NatalSnapshotResult["sect"], string> = {
  "Day chart":
    "With the Sun above the horizon, the chart has a diurnal emphasis: visibility, purpose, public direction, and conscious agency tend to matter strongly. In traditional astrology, sect also changes how planets behave, especially Jupiter, Saturn, Mars, and Venus. This preview can identify the broad day-chart condition, but a complete reading would ask which planets are helped by the daylight and which ones still need careful handling.",
  "Night chart":
    "With the Sun below the horizon, the chart has a nocturnal emphasis: instinct, privacy, memory, emotional weather, and the hidden life often carry more weight than the outer performance suggests. In traditional astrology, sect changes how the planets act, especially Venus, Mars, Saturn, and Jupiter. This preview can identify the broad night-chart condition, but a complete reading would ask which planets become more personal after dark.",
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

function articleFor(word: string): "a" | "an" {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function buildSummary(sunSign: ZodiacSign, moonSign: ZodiacSign, risingSign: ZodiacSign): string {
  const sun = signProfiles[sunSign];
  const moon = signProfiles[moonSign];
  const rising = signProfiles[risingSign];
  const sunElement = sun.element.toLowerCase();
  const moonElement = moon.element.toLowerCase();
  const risingMode = rising.mode.toLowerCase();

  return `The first pattern is ${articleFor(sunElement)} ${sunElement} Sun, ${articleFor(moonElement)} ${moonElement} Moon, and ${articleFor(risingMode)} ${risingMode} ${risingSign} Rising. That means your chart begins with vitality moving through ${sunSign}, instinct moving through ${moonSign}, and a visible doorway shaped by ${risingSign}. This is not the whole chart. It is the first edge of the map: enough to recognize yourself, but not enough to know which placements are strongest, which houses are activated, or where the chart repeats its deepest theme.`;
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
      body: sectInterpretations[sect],
    },
    timezone: input.timezone,
    utcOffset,
    calculationNote:
      "This free chart preview uses a lightweight browser calculation, city-based geocoding, and static interpretations. It is designed to give a real first reading, not a complete report. A paid reading verifies the birth data and interprets the whole chart, including houses, rulers, aspects, condition, angularity, repeated themes, and chart emphasis.",
  };
}
