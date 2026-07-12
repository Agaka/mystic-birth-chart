import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const contentDir = path.join(root, "src", "content", "articles");
const files = fs.readdirSync(contentDir).filter((file) => file.endsWith(".md"));
const slugs = new Set(files.map((file) => file.replace(/\.md$/, "")));
const titles = new Map();
const errors = [];

const forbiddenPatterns = [
  /\bTODO\b/i,
  /\bTBD\b/i,
  /\blorem ipsum\b/i,
  /\bas an AI\b/i,
  /\binternal instruction\b/i,
  /\bwrite (?:this|the|an) article\b/i,
  /\binsert (?:copy|text|content) here\b/i,
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

  if (content.trim().split(/\s+/).length < 250) {
    errors.push(`${file}: article is too thin (fewer than 250 words)`);
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
}

if (errors.length > 0) {
  console.error(`Article audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Article audit passed: ${files.length} articles checked.`);
