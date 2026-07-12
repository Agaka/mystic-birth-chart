import assert from "node:assert/strict";
import test from "node:test";
import { calculateAnnualProfection } from "../src/lib/annualProfection.ts";
import { buildExpandedFreeReading } from "../src/lib/freeChartReading.ts";
import { calculateMoonPhaseFromLongitudes, calculateNatalSnapshot } from "../src/lib/natalSnapshot.ts";

test("annual profection changes on the birthday and uses traditional rulers", () => {
  const beforeBirthday = calculateAnnualProfection("2000-07-20", "Aries", "2026-07-12");
  assert.equal(beforeBirthday.age, 25);
  assert.equal(beforeBirthday.house, 2);
  assert.equal(beforeBirthday.sign, "Taurus");
  assert.equal(beforeBirthday.timeLord, "Venus");
  assert.equal(beforeBirthday.startsOn, "2025-07-20");
  assert.equal(beforeBirthday.endsOn, "2026-07-20");

  const afterBirthday = calculateAnnualProfection("2000-07-20", "Aries", "2026-07-20");
  assert.equal(afterBirthday.age, 26);
  assert.equal(afterBirthday.house, 3);
  assert.equal(afterBirthday.sign, "Gemini");
  assert.equal(afterBirthday.timeLord, "Mercury");
});

test("annual profection cycle contains twelve consecutive houses", () => {
  const result = calculateAnnualProfection("1994-02-28", "Scorpio", "2026-07-12");
  assert.equal(result.cycle.length, 12);
  assert.deepEqual(result.cycle.map((item) => item.house), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test("moon phase boundaries return the eight named phases", () => {
  const cases = [
    [0, "New Moon"],
    [45, "Waxing Crescent"],
    [90, "First Quarter"],
    [135, "Waxing Gibbous"],
    [180, "Full Moon"],
    [225, "Waning Gibbous"],
    [270, "Last Quarter"],
    [315, "Waning Crescent"],
  ] as const;

  for (const [angle, name] of cases) {
    const phase = calculateMoonPhaseFromLongitudes(0, angle);
    assert.equal(phase.name, name);
  }
  assert.equal(calculateMoonPhaseFromLongitudes(0, 180).illumination, 100);
  assert.equal(calculateMoonPhaseFromLongitudes(0, 0).illumination, 0);
});

test("expanded free reading is substantial and derived from calculated chart data", () => {
  const result = calculateNatalSnapshot({
    date: "2002-08-18",
    time: "11:05",
    latitude: -30.0346,
    longitude: -51.2177,
    timezone: "America/Sao_Paulo",
  });
  const sections = buildExpandedFreeReading(result, "career");
  assert.equal(sections.length, 6);
  assert.ok(sections.map((section) => `${section.title} ${section.body}`).join(" ").split(/\s+/).length > 350);
  assert.match(sections[0].title, new RegExp(result.sunSign));
  assert.match(sections[1].title, new RegExp(result.moonPhase.name));
  assert.ok(result.moonPhase.angle >= 0 && result.moonPhase.angle < 360);
});
