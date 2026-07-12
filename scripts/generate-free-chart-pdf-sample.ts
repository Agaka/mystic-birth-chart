import fs from "node:fs";
import path from "node:path";
import { buildExpandedFreeReading } from "../src/lib/freeChartReading.ts";
import { createFreeChartPdf } from "../src/lib/freeChartPdf.ts";
import { calculateNatalSnapshot } from "../src/lib/natalSnapshot.ts";

const result = calculateNatalSnapshot({
  date: "2002-08-18",
  time: "11:05",
  latitude: -30.0346,
  longitude: -51.2177,
  timezone: "America/Sao_Paulo",
});

const bytes = await createFreeChartPdf({
  name: "Allan",
  birthDate: "2002-08-18",
  birthTime: "11:05",
  birthCity: "Porto Alegre, Rio Grande do Sul, Brazil",
  result,
  sections: buildExpandedFreeReading(result, "career"),
});

const outputDir = path.join(process.cwd(), "tmp", "pdfs");
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "mystic-free-chart-sample.pdf");
fs.writeFileSync(outputPath, bytes);
console.log(outputPath);
