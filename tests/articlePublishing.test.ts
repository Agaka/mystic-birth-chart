import assert from "node:assert/strict";
import test from "node:test";
import {
  isArticlePublished,
  resolvePublishInstant,
} from "../src/lib/articlePublishing.ts";

test("date-only articles publish from midnight UTC", () => {
  assert.equal(
    resolvePublishInstant("2026-07-31"),
    Date.parse("2026-07-31T00:00:00.000Z"),
  );
});

test("publishAt overrides the editorial display date", () => {
  assert.equal(
    resolvePublishInstant("2026-07-31", "2026-07-31T16:00:00-04:00"),
    Date.parse("2026-07-31T20:00:00.000Z"),
  );
});

test("articles become public at the exact scheduled instant", () => {
  const publishAt = "2026-08-01T09:00:00-04:00";

  assert.equal(
    isArticlePublished(
      "2026-08-01",
      publishAt,
      new Date("2026-08-01T12:59:59.999Z"),
    ),
    false,
  );
  assert.equal(
    isArticlePublished(
      "2026-08-01",
      publishAt,
      new Date("2026-08-01T13:00:00.000Z"),
    ),
    true,
  );
});

test("invalid publication metadata stays private", () => {
  assert.equal(
    isArticlePublished("invalid", undefined, new Date("2026-08-01T00:00:00Z")),
    false,
  );
  assert.equal(
    isArticlePublished(
      "2026-08-01",
      "tomorrow morning",
      new Date("2026-08-01T00:00:00Z"),
    ),
    false,
  );
});
