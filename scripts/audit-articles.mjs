import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentDir = path.join(root, "src", "content", "articles");
const files = fs.readdirSync(contentDir).filter((file) => file.endsWith(".md"));
const slugs = new Set(files.map((file) => file.replace(/\.md$/, "")));
const titles = new Map();
const errors = [];
const scheduledInstants = new Map();
const scheduledDates = new Map();
const longParagraphs = new Map();

const forbiddenPatterns = [
  /\bTODO\b/i,
  /\bTBD\b/i,
  /\blorem ipsum\b/i,
  /\bas an AI\b/i,
  /\binternal instruction\b/i,
  /\bwrite (?:this|the|an) article\b/i,
  /\binsert (?:copy|text|content) here\b/i,
  /\b(?:drafting|writing) instructions?\b/i,
  /\b(?:system|developer) message\b/i,
  /\btarget (?:word count|length)\b/i,
  /\bSEO (?:brief|instructions?)\b/i,
  /\bthe article should\b/i,
  /\binclude (?:a|an|the) (?:section|heading|call to action)\b/i,
];

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(contentDir, file), "utf8");
  const { data, content } = matter(source);

  for (const field of ["title", "category", "date", "author"]) {
    if (!String(data[field] ?? "").trim()) {
      errors.push(`${file}: missing ${field} in frontmatter`);
    }
  }

  if (!String(data.description ?? data.excerpt ?? "").trim()) {
    errors.push(`${file}: missing description or excerpt in frontmatter`);
  }

  const title = String(data.title ?? "").trim();
  if (titles.has(title)) {
    errors.push(`${file}: duplicate title also used by ${titles.get(title)}`);
  } else if (title) {
    titles.set(title, file);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data.date ?? ""))) {
    errors.push(`${file}: date must use YYYY-MM-DD`);
  }

  const wordCount = content.trim().split(/\s+/).length;
  if (wordCount < 250) {
    errors.push(`${file}: article is too thin (fewer than 250 words)`);
  }

  const publishAt = String(data.publishAt ?? "").trim();
  if (publishAt) {
    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(
        publishAt,
      ) ||
      !Number.isFinite(Date.parse(publishAt))
    ) {
      errors.push(`${file}: publishAt must be a valid ISO timestamp with timezone`);
    }

    if (wordCount < 1800) {
      errors.push(`${file}: scheduled article is too thin (${wordCount} words; minimum 1800)`);
    }

    if (!/^## Sources and further study\s*$/im.test(content)) {
      errors.push(`${file}: scheduled article needs a Sources and further study section`);
    }

    const internalLinks = [...content.matchAll(/\]\(\/blog\/[^)]+\)/g)].length;
    if (internalLinks < 3) {
      errors.push(`${file}: scheduled article needs at least 3 internal article links`);
    }

    if (scheduledInstants.has(publishAt)) {
      errors.push(`${file}: duplicate publishAt also used by ${scheduledInstants.get(publishAt)}`);
    } else {
      scheduledInstants.set(publishAt, file);
    }

    const date = String(data.date ?? "");
    const filesForDate = scheduledDates.get(date) ?? [];
    filesForDate.push(file);
    scheduledDates.set(date, filesForDate);
  }

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      errors.push(`${file}: possible leaked drafting instruction (${pattern})`);
    }
  }

  for (const match of content.matchAll(/\]\(\/blog\/([^\s)#?]+)[^)]*\)/g)) {
    const linkedSlug = match[1].replace(/\/$/, "");
    if (
      !linkedSlug.startsWith("category/") &&
      linkedSlug !== slug &&
      !slugs.has(linkedSlug)
    ) {
      errors.push(`${file}: broken internal article link /blog/${linkedSlug}`);
    }
  }

  for (const paragraph of content.split(/\n\s*\n/)) {
    const normalized = paragraph
      .replace(/\[[^\]]+\]\([^)]+\)/g, "")
      .replace(/[^a-z0-9]+/gi, " ")
      .trim()
      .toLowerCase();
    if (normalized.length < 180) continue;

    const owners = longParagraphs.get(normalized) ?? [];
    owners.push({ file, scheduled: Boolean(publishAt) });
    longParagraphs.set(normalized, owners);
  }
}

for (const [date, scheduledFiles] of scheduledDates) {
  if (scheduledFiles.length > 2) {
    errors.push(`${date}: more than 2 scheduled articles (${scheduledFiles.join(", ")})`);
  }
}

for (const owners of longParagraphs.values()) {
  if (owners.length < 2 || !owners.some((owner) => owner.scheduled)) continue;
  errors.push(`duplicate long paragraph in ${owners.map((owner) => owner.file).join(", ")}`);
}

if (errors.length > 0) {
  console.error(`Article audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Article audit passed: ${files.length} articles checked.`);
