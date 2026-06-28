export function performanceHeaders(req, res, next) {
  res.setHeader("X-DNS-Prefetch-Control", "on");

  if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff2?)$/)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else if (req.path === "/sitemap.xml" || req.path === "/robots.txt" || req.path === "/rss.xml") {
    res.setHeader("Cache-Control", "public, max-age=900, stale-while-revalidate=86400");
  } else if (req.method === "GET" && !req.path.startsWith("/admin")) {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=600");
  } else {
    res.setHeader("Cache-Control", "no-store");
  }

  next();
}
