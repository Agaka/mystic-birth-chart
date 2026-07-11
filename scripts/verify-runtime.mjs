import assert from "node:assert/strict";

const baseUrl = process.env.VERIFY_BASE_URL || "http://localhost:3000";
const canonicalOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://mysticbirthchart.com";

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const body = await response.text();
  return { response, body };
}

function canonicalFrom(html) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] || "";
  return tag.match(/href=["']([^"']+)["']/i)?.[1] || "";
}

function anchorPaths(html) {
  return [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)]
    .map((match) => match[1].replaceAll("&amp;", "&"))
    .filter((href) => href.startsWith("/") && !href.startsWith("//"))
    .map((href) => href.split("#")[0])
    .filter(Boolean);
}

const sitemapResult = await get("/sitemap.xml");
assert.equal(sitemapResult.response.status, 200, "sitemap.xml must return 200");
assert.match(sitemapResult.body, /<urlset/i, "sitemap.xml must be valid XML");

const sitemapUrls = [...sitemapResult.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
  match[1].replace(canonicalOrigin, ""),
);

assert.ok(sitemapUrls.length >= 60, "sitemap should include public pages, categories, and articles");
assert.ok(!sitemapUrls.some((path) => path.startsWith("/checkout/")), "checkout must not be in sitemap");
assert.ok(!sitemapUrls.includes("/icon.png"), "icon.png must not be in sitemap");
assert.ok(!sitemapUrls.includes("/apple-icon.png"), "apple-icon.png must not be in sitemap");

const routeFailures = [];
const canonicalFailures = [];
const h1Failures = [];
const discoveredLinks = new Set();

for (const path of sitemapUrls) {
  const { response, body } = await get(path || "/");
  if (response.status !== 200) routeFailures.push(`${path || "/"}: ${response.status}`);

  const canonical = canonicalFrom(body);
  const expectedCanonical = `${canonicalOrigin}${path}`;
  if (canonical !== expectedCanonical) {
    canonicalFailures.push(`${path || "/"}: ${canonical || "missing"}`);
  }

  const h1Count = (body.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) h1Failures.push(`${path || "/"}: ${h1Count}`);

  for (const link of anchorPaths(body)) discoveredLinks.add(link);
}

assert.deepEqual(routeFailures, [], `public route failures:\n${routeFailures.join("\n")}`);
assert.deepEqual(canonicalFailures, [], `canonical failures:\n${canonicalFailures.join("\n")}`);
assert.deepEqual(h1Failures, [], `H1 failures:\n${h1Failures.join("\n")}`);

const linkFailures = [];
for (const path of discoveredLinks) {
  const { response } = await get(path);
  if (response.status >= 400) linkFailures.push(`${path}: ${response.status}`);
}
assert.deepEqual(linkFailures, [], `internal link failures:\n${linkFailures.join("\n")}`);

const robotsResult = await get("/robots.txt");
assert.equal(robotsResult.response.status, 200);
assert.match(robotsResult.body, /Sitemap: https:\/\/mysticbirthchart\.com\/sitemap\.xml/i);
assert.match(robotsResult.body, /Disallow: \/checkout\//i);
assert.match(robotsResult.body, /Disallow: \/thank-you/i);

const rssResult = await get("/rss.xml");
assert.equal(rssResult.response.status, 200, "rss.xml must return 200");
assert.match(
  rssResult.response.headers.get("content-type") || "",
  /application\/rss\+xml/i,
  "rss.xml must use an RSS content type",
);
assert.match(rssResult.body, /<rss\b/i, "rss.xml must be valid RSS XML");
assert.ok(
  (rssResult.body.match(/<item>/gi) || []).length >= 40,
  "rss.xml should expose the article library",
);

for (const path of ["/checkout/basic", "/checkout/complete", "/checkout/pending", "/thank-you"]) {
  const { response, body } = await get(path);
  assert.equal(response.status, 200, `${path} must return 200`);
  assert.match(body, /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex[^"']*["']/i, `${path} must be noindex`);
}

const home = await get("/");
assert.match(home.body, /opengraph-image/i, "Home must expose an OG image");
assert.match(home.body, /"@type":"Organization"/i, "Home must include Organization structured data");
assert.match(home.body, /"@type":"WebSite"/i, "Home must include WebSite structured data");

const readingPage = await get("/birth-chart-report");
assert.match(readingPage.body, /"@type":"FAQPage"/i, "Readings must include visible FAQ structured data");

const commercialPage = await get("/complete-natal-chart-reading");
assert.match(commercialPage.body, /"@type":"Product"/i, "Commercial landing must include Product structured data");
assert.match(commercialPage.body, /"@type":"FAQPage"/i, "Commercial landing must include FAQ structured data");
assert.doesNotMatch(commercialPage.body, /AggregateRating|"@type":"Review"/i);

const articlePage = await get("/blog/what-is-a-birth-chart-reading");
assert.match(articlePage.body, /"@type":"BlogPosting"/i, "Article must include BlogPosting structured data");
assert.match(articlePage.body, /"@type":"BreadcrumbList"/i, "Article must include BreadcrumbList structured data");

for (const header of [
  "content-security-policy",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "x-frame-options",
  "strict-transport-security",
]) {
  assert.ok(home.response.headers.get(header), `missing security header: ${header}`);
}

assert.match(home.response.headers.get("content-security-policy") || "", /frame-ancestors 'none'/i);
assert.equal(home.response.headers.get("x-content-type-options"), "nosniff");
assert.equal(home.response.headers.get("x-frame-options"), "DENY");

const invalidCheckout = await fetch(`${baseUrl}/api/checkout`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tier: "invalid", name: "Test", email: "invalid@example.com" }),
});
assert.equal(invalidCheckout.status, 400, "invalid checkout tier must be rejected server-side");

const invalidFulfillment = await fetch(`${baseUrl}/api/email`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ tier: "basic" }),
});
assert.equal(invalidFulfillment.status, 400, "unverified fulfillment must be rejected server-side");

console.log(
  JSON.stringify(
    {
      publicRoutesChecked: sitemapUrls.length,
      internalLinksChecked: discoveredLinks.size,
      noindexPagesChecked: 4,
      rssFeedsChecked: 1,
      structuredDataChecks: 7,
      securityHeadersChecked: 6,
      rejectedUnsafeApiRequests: 2,
    },
    null,
    2,
  ),
);
