import * as SunCalc from "suncalc";

export type PlanetName = "Saturn" | "Jupiter" | "Mars" | "Sun" | "Venus" | "Mercury" | "Moon";

export interface PlanetaryHour {
  index: number; // 1 to 24 (1-12 day, 13-24 night)
  planet: PlanetName;
  startTime: Date;
  endTime: Date;
  isDaytime: boolean;
}

// Chaldean sequence (from slowest to fastest apparent motion)
export const chaldeanSequence: PlanetName[] = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
];

// Day rulers (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
const dayRulers: PlanetName[] = [
  "Sun",     // Sunday
  "Moon",    // Monday
  "Mars",    // Tuesday
  "Mercury", // Wednesday
  "Jupiter", // Thursday
  "Venus",   // Friday
  "Saturn",  // Saturday
];

/**
 * Get the Chaldean sequence index for a given planet
 */
export function getPlanetIndex(planet: PlanetName): number {
  return chaldeanSequence.indexOf(planet);
}

/**
 * Calculate the 24 planetary hours for a given date and location
 */
export function calculatePlanetaryHours(date: Date, latitude: number, longitude: number): PlanetaryHour[] {
  // Normalize the date to noon to avoid edge cases when fetching times
  const queryDate = new Date(date);
  queryDate.setHours(12, 0, 0, 0);

  // Get times for the current day
  const timesToday = SunCalc.getTimes(queryDate, latitude, longitude);
  
  // Get sunrise for the next day to calculate night hours
  const nextDay = new Date(queryDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const timesTomorrow = SunCalc.getTimes(nextDay, latitude, longitude);

  // Safely extract the times we need
  const sunrise = timesToday.sunrise;
  const sunset = timesToday.sunset;
  const nextSunrise = timesTomorrow.sunrise;

  // If we are in extreme latitudes where sun doesn't set/rise, handle gracefully (just fallback to normal 24h)
  if (!sunrise || !sunset || !nextSunrise || isNaN(sunrise.getTime()) || isNaN(sunset.getTime()) || isNaN(nextSunrise.getTime())) {
    return [];
  }

  // Calculate the lengths of diurnal and nocturnal hours in milliseconds
  const dayDurationMs = sunset.getTime() - sunrise.getTime();
  const nightDurationMs = nextSunrise.getTime() - sunset.getTime();
  
  const dayHourMs = dayDurationMs / 12;
  const nightHourMs = nightDurationMs / 12;

  // Find the day ruler (Day of week at sunrise determines the ruler)
  const dayOfWeek = sunrise.getDay();
  const dayRuler = dayRulers[dayOfWeek];
  const startRulerIndex = getPlanetIndex(dayRuler);

  const hours: PlanetaryHour[] = [];

  // Generate 12 daytime hours
  for (let i = 0; i < 12; i++) {
    const planetIndex = (startRulerIndex + i) % 7;
    hours.push({
      index: i + 1,
      planet: chaldeanSequence[planetIndex],
      startTime: new Date(sunrise.getTime() + i * dayHourMs),
      endTime: new Date(sunrise.getTime() + (i + 1) * dayHourMs),
      isDaytime: true,
    });
  }

  // Generate 12 nighttime hours
  const nightStartRulerIndex = (startRulerIndex + 12) % 7;
  for (let i = 0; i < 12; i++) {
    const planetIndex = (nightStartRulerIndex + i) % 7;
    hours.push({
      index: i + 13,
      planet: chaldeanSequence[planetIndex],
      startTime: new Date(sunset.getTime() + i * nightHourMs),
      endTime: new Date(sunset.getTime() + (i + 1) * nightHourMs),
      isDaytime: false,
    });
  }

  return hours;
}
