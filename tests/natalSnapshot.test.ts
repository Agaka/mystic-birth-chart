import assert from "node:assert/strict";
import test from "node:test";
import { calculateNatalSnapshot } from "../src/lib/natalSnapshot.ts";

const regressionCases = [
  {
    name: "Porto Alegre daytime chart",
    input: {
      date: "2002-08-18",
      time: "11:05",
      latitude: -30.0346,
      longitude: -51.2177,
      timezone: "America/Sao_Paulo",
    },
    expected: {
      sunSign: "Leo",
      moonSign: "Capricorn",
      risingSign: "Scorpio",
      chartRuler: "Mars",
      sect: "Day chart",
      utcOffset: -3,
    },
  },
  {
    name: "New York winter chart",
    input: {
      date: "1990-01-15",
      time: "08:30",
      latitude: 40.7128,
      longitude: -74.006,
      timezone: "America/New_York",
    },
    expected: {
      sunSign: "Capricorn",
      moonSign: "Virgo",
      risingSign: "Aquarius",
      chartRuler: "Saturn",
      sect: "Day chart",
      utcOffset: -5,
    },
  },
  {
    name: "London summer night chart",
    input: {
      date: "1985-06-21",
      time: "23:45",
      latitude: 51.5072,
      longitude: -0.1276,
      timezone: "Europe/London",
    },
    expected: {
      sunSign: "Cancer",
      moonSign: "Leo",
      risingSign: "Aquarius",
      chartRuler: "Saturn",
      sect: "Night chart",
      utcOffset: 1,
    },
  },
] as const;

for (const regressionCase of regressionCases) {
  test(regressionCase.name, () => {
    const result = calculateNatalSnapshot(regressionCase.input);
    const actual = {
      sunSign: result.sunSign,
      moonSign: result.moonSign,
      risingSign: result.risingSign,
      chartRuler: result.chartRuler,
      sect: result.sect,
      utcOffset: result.utcOffset,
    };

    assert.deepEqual(actual, regressionCase.expected);
    assert.equal(result.placements.length, 3);
    assert.ok(result.summary.length > 200);
    assert.ok(result.rulerInterpretation.body.length > 200);
    assert.ok(result.sectInterpretation.body.length > 200);
  });
}

test("invalid timezone never fails silently", () => {
  assert.throws(() =>
    calculateNatalSnapshot({
      date: "2002-08-18",
      time: "11:05",
      latitude: -30.0346,
      longitude: -51.2177,
      timezone: "Not/A_Timezone",
    }),
  );
});
