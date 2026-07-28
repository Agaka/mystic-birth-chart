import assert from "node:assert/strict";
import test from "node:test";
import { calculateFullChart } from "../src/fullChart.ts";
import { buildSynastryEvidence } from "../src/synastryEngine.ts";

const first = calculateFullChart({ date: "2002-08-18", time: "11:05", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });
const second = calculateFullChart({ date: "2000-09-27", time: "01:28", latitude: -30.0346, longitude: -51.2177, timezone: "America/Sao_Paulo" });

test("known birth times produce inter-chart contacts, house overlays, and angle contacts", () => {
  const result = buildSynastryEvidence(first, second, { firstTimeKnown: true, secondTimeKnown: true });
  assert.ok(result.contacts.length >= 8);
  assert.ok(result.houseOverlays.length >= 10);
  assert.ok(result.angleContacts.length > 0);
  assert.deepEqual(result.omitted, []);
});

test("unknown birth time removes houses and angles without discarding reliable planets", () => {
  const result = buildSynastryEvidence(first, second, { firstTimeKnown: true, secondTimeKnown: false, secondMoonSigns: ["Virgo", "Libra"] });
  assert.ok(result.contacts.some((contact) => contact.bodyA !== "Moon" && contact.bodyB !== "Moon"));
  assert.ok(result.houseOverlays.every((overlay) => overlay.owner === "First"));
  assert.ok(result.angleContacts.every((contact) => contact.angleOwner === "First"));
  assert.ok(result.omitted.some((item) => item.includes("Second person's houses")));
  assert.ok(result.moonCautions.some((item) => item.includes("may change sign")));
});

test("classifications use the promised four-value vocabulary", () => {
  const allowed = new Set(["supportive", "demanding", "mixed", "highly consequential"]);
  const result = buildSynastryEvidence(first, second, { firstTimeKnown: true, secondTimeKnown: true });
  assert.ok(result.contacts.every((contact) => allowed.has(contact.classification)));
});
