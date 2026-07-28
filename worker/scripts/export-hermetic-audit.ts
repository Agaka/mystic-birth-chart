import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { hermeticCorrespondences } from "../src/hermeticCorrespondences.ts";

const outputDirectory = resolve(import.meta.dirname, "../../docs/hermetic-audit");
const goldenDawnOrder = ["Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer"] as const;

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csv(headers: readonly string[], rows: ReadonlyArray<ReadonlyArray<unknown>>): string {
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
}

async function main(): Promise<void> {
  await mkdir(outputDirectory, { recursive: true });
  const source = "Golden Dawn / Shem ha-Mephorash reference transcription";
  const sourceUrl = "https://www.tarrdaniel.com/documents/Thelemagick/gd/publication/english/Schemhamphorash.html";

  const quinanceRows = goldenDawnOrder.flatMap((sign, signIndex) =>
    hermeticCorrespondences.quinances[sign].map(([angel, planet, reference], index) => [
      signIndex * 6 + index + 1,
      sign,
      index * 5,
      index * 5 + 5,
      planet,
      angel,
      reference,
      "needs_manual_review",
      source,
      sourceUrl,
      "",
      "",
    ]),
  );
  await writeFile(resolve(outputDirectory, "03-shem-quinances.csv"), csv(
    ["golden_dawn_number", "sign", "degree_from", "degree_to", "planet", "angel", "scripture_reference", "audit_status", "source", "source_url", "book_reference", "review_note"],
    quinanceRows,
  ));

  const sphereRows = Object.entries(hermeticCorrespondences.planetarySpheres).map(([planet, entry]) => [
    planet, entry.sephirah, entry.virtue, entry.imbalance, entry.day, "needs_manual_review", "Liber 777 / Golden Dawn framework", "", "",
  ]);
  await writeFile(resolve(outputDirectory, "01-planetary-spheres.csv"), csv(
    ["planet", "sephirah", "virtue", "imbalance", "planetary_day", "audit_status", "source", "book_reference", "review_note"],
    sphereRows,
  ));

  const zodiacRows = Object.entries(hermeticCorrespondences.zodiac).map(([sign, entry]) => [
    sign, entry.letter, entry.tarot, entry.path, "needs_manual_review", "Liber 777 / Golden Dawn framework", "", "",
  ]);
  await writeFile(resolve(outputDirectory, "02-zodiac-paths.csv"), csv(
    ["sign", "hebrew_letter_transliteration", "tarot_trump", "path_number", "audit_status", "source", "book_reference", "review_note"],
    zodiacRows,
  ));
}

void main();
