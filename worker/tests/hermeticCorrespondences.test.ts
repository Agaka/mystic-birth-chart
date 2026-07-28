import assert from "node:assert/strict";
import test from "node:test";
import { hermeticCorrespondences, quinanceFor } from "../src/hermeticCorrespondences.ts";

test("the Hermetic product uses a closed, versioned Golden Dawn correspondence set", () => {
  assert.ok(hermeticCorrespondences.version);
  assert.equal(Object.keys(hermeticCorrespondences.quinances).length, 12);
  assert.equal(hermeticCorrespondences.quinances.Aries.length, 6);
  assert.equal(hermeticCorrespondences.quinances.Cancer.length, 6);
  assert.equal(quinanceFor("Aries", 0).angel, "Uhauel");
  assert.equal(quinanceFor("Cancer", 27.5).angel, "Mevamiah");
});
