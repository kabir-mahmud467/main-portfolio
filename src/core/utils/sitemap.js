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

export function buildSitemapXml({ staticUrls = [], blogUrls = [], projectUrls = [], toolUrls = [] } = {}) {
  const baseUrl = normalizeUrl(appConfig.url);

  if (!baseUrl || isLocalhostUrl(baseUrl)) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  }

  const seen = new Set();
  const urls = [...staticUrls, ...blogUrls, ...projectUrls, ...toolUrls]
    .filter(Boolean)
    .map((entry) => ({
      loc: normalizeUrl(entry.loc),
      lastmod: entry.lastmod || new Date().toISOString()
    }))
    .filter((entry) => {
      if (!entry.loc || isLocalhostUrl(entry.loc) || seen.has(entry.loc)) return false;
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
