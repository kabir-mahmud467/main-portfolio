import { appConfig } from "../../config/app.config.js";

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeUrl(value) {
  if (!value) return "";
  return String(value).trim();
}

function isLocalhostUrl(value) {
  if (!value) return true;
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(value);
}

export function buildSitemapXml({ staticUrls = [], blogUrls = [], projectUrls = [], toolUrls = [], baseUrl = "" } = {}) {
  const normalizedBaseUrl = normalizeUrl(baseUrl || appConfig.url);
  const seen = new Set();
  const urls = [...staticUrls, ...blogUrls, ...projectUrls, ...toolUrls]
    .filter(Boolean)
    .map((entry) => ({
      loc: normalizeUrl(entry.loc),
      lastmod: entry.lastmod || new Date().toISOString()
    }))
    .map((entry) => ({
      ...entry,
      loc: normalizeUrl(entry.loc)
    }))
    .filter((entry) => {
      if (!entry.loc || seen.has(entry.loc)) return false;
      if (isLocalhostUrl(entry.loc)) return false;
      if (normalizedBaseUrl && !entry.loc.startsWith(normalizedBaseUrl)) {
        const absoluteUrl = normalizeUrl(entry.loc);
        if (!absoluteUrl.startsWith("http://") && !absoluteUrl.startsWith("https://")) {
          entry.loc = `${normalizedBaseUrl}${entry.loc.startsWith("/") ? entry.loc : `/${entry.loc}`}`;
        }
      }
      seen.add(entry.loc);
      return true;
    });

  const body = urls
    .map((url) => `  <url><loc>${escapeXml(url.loc)}</loc><lastmod>${escapeXml(url.lastmod)}</lastmod></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}
