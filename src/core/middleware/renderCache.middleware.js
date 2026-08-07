import { renderCache } from "../utils/renderCache.js";

export function cachedPage(options = {}) {
  const ttl = options.ttl || 60;

  return function cachedPageMiddleware(req, res, next) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }

    if (req.user) {
      return next();
    }

    if (req.session && req.session.flash && Object.keys(req.session.flash).length > 0) {
      return next();
    }

    const key = req.originalUrl;

    const cached = renderCache.get(key);
    if (cached !== null) {
      res.set("X-Render-Cache", "HIT");
      if (typeof cached === "object" && cached.contentType) {
        res.set("Content-Type", cached.contentType);
      }
      return res.send(typeof cached === "object" ? cached.body : cached);
    }

    let stored = false;
    const originalSend = res.send.bind(res);

    res.send = function sendCached(body) {
      if (!stored && typeof body === "string" && res.statusCode === 200) {
        stored = true;
        renderCache.set(key, { body, contentType: res.get("Content-Type") || "" }, ttl);
        res.set("X-Render-Cache", "MISS");
      }
      return originalSend(body);
    };

    next();
  };
}
