import { zodiacSigns, type Planet, type ZodiacSign } from "./natalSnapshot.ts";

const rulers: Record<ZodiacSign, Planet> = {
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

const houseThemes: Record<number, { title: string; body: string; question: string }> = {
  1: { title: "Identity, body, and direction", body: "The year returns attention to how you enter life, make decisions, inhabit the body, and claim a direction that is recognizably your own.", question: "What part of your life now requires a clearer first-person decision?" },
  2: { title: "Resources, livelihood, and value", body: "Income, pricing, possessions, skills, and the material conditions that support your choices become more consequential.", question: "Which resource needs a more deliberate structure this year?" },
  3: { title: "Learning, language, and local life", body: "Study, writing, siblings, short journeys, messages, and the habits through which your immediate environment shapes thought move forward.", question: "What repeated conversation or skill deserves serious attention?" },
  4: { title: "Home, family, and foundations", body: "Private life, ancestry, parents, land, memory, and the structures that create or disturb belonging become the ground of the year.", question: "What foundation must be repaired before the next public step?" },
  5: { title: "Creativity, pleasure, and generation", body: "Art, play, romance, children, performance, and the risks taken for something you genuinely want become active fields.", question: "What are you willing to create without knowing how it will be received?" },
  6: { title: "Work, service, and maintenance", body: "Daily labor, craft, routines, obligations, coworkers, and the management of strain require practical reorganization.", question: "Which routine would make the rest of life more workable?" },
  7: { title: "Partnership, clients, and agreements", body: "Committed relationships, contracts, direct opponents, and the terms between self and other become harder to treat casually.", question: "Which agreement needs to be named rather than assumed?" },
  8: { title: "Shared resources, trust, and obligation", body: "Debt, inheritance, intimacy, grief, taxes, disclosure, and the cost of depending on others move closer to the center.", question: "Where does trust require clearer terms or professional support?" },
  9: { title: "Belief, study, and the farther horizon", body: "Higher education, publishing, law, religion, divination, travel, and the ideas that orient a life seek expansion or correction.", question: "Which belief is strong enough to be tested rather than merely repeated?" },
  10: { title: "Vocation, reputation, and authority", body: "Career, public responsibility, leadership, achievement, and the consequences of being visible become leading topics.", question: "What responsibility would make your public direction more coherent?" },
  11: { title: "Allies, audience, and future plans", body: "Friends, patrons, communities, professional gains, support systems, and long-range hopes reveal what can grow through other people.", question: "Which alliance expands real possibility rather than only attention?" },
  12: { title: "Retreat, endings, and hidden patterns", body: "Solitude, institutions, private grief, invisible labor, and patterns that weaken agency need containment, support, and honest closure.", question: "What needs rest, release, or help before it becomes another private burden?" },
};

const planetTasks: Record<Planet, string> = {
  Sun: "Act from a coherent center. Visibility matters, but integrity matters more than applause.",
  Moon: "Respond to changing conditions without abandoning the rhythm that keeps you emotionally and physically resourced.",
  Mercury: "Name, document, compare, revise, and make the year's important exchanges precise enough to trust.",
  Venus: "Examine value, reciprocity, attraction, money, and the agreements that make connection sustainable.",
  Mars: "Choose a clean target, establish boundaries, and direct conflict toward action rather than permanent emergency.",
  Jupiter: "Create room for growth while defining the scale at which opportunity remains meaningful and affordable.",
  Saturn: "Build slowly enough that responsibility, limits, and time become structure rather than punishment.",
};

export interface AnnualProfectionResult {
  age: number;
  house: number;
  sign: ZodiacSign;
  timeLord: Planet;
  startsOn: string;
  endsOn: string;
  title: string;
  interpretation: string;
  question: string;
  planetTask: string;
  cycle: Array<{ age: number; house: number; sign: ZodiacSign; timeLord: Planet }>;
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function birthdayForYear(birthDate: Date, year: number): Date {
  const month = birthDate.getUTCMonth();
  const day = birthDate.getUTCDate();
  const candidate = new Date(Date.UTC(year, month, day));
  if (candidate.getUTCMonth() !== month) return new Date(Date.UTC(year, month + 1, 0));
  return candidate;
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function calculateAnnualProfection(
  birthDateValue: string,
  risingSign: ZodiacSign,
  referenceDateValue = new Date().toISOString().slice(0, 10),
): AnnualProfectionResult {
  const birthDate = parseDate(birthDateValue);
  const referenceDate = parseDate(referenceDateValue);
  let birthday = birthdayForYear(birthDate, referenceDate.getUTCFullYear());
  if (referenceDate < birthday) birthday = birthdayForYear(birthDate, referenceDate.getUTCFullYear() - 1);
  const nextBirthday = birthdayForYear(birthDate, birthday.getUTCFullYear() + 1);
  let age = birthday.getUTCFullYear() - birthDate.getUTCFullYear();
  if (birthday.getUTCMonth() < birthDate.getUTCMonth()) age -= 1;

  const house = (age % 12) + 1;
  const risingIndex = zodiacSigns.indexOf(risingSign);
  const sign = zodiacSigns[(risingIndex + house - 1) % 12];
  const timeLord = rulers[sign];
  const theme = houseThemes[house];
  const cycle = Array.from({ length: 12 }, (_, index) => {
    const cycleAge = age - (age % 12) + index;
    const cycleHouse = (cycleAge % 12) + 1;
    const cycleSign = zodiacSigns[(risingIndex + cycleHouse - 1) % 12];
    return { age: cycleAge, house: cycleHouse, sign: cycleSign, timeLord: rulers[cycleSign] };
  });

  return {
    age,
    house,
    sign,
    timeLord,
    startsOn: isoDate(birthday),
    endsOn: isoDate(nextBirthday),
    title: theme.title,
    interpretation: theme.body,
    question: theme.question,
    planetTask: planetTasks[timeLord],
    cycle,
  };
}
