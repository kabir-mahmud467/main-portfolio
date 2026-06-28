import { appConfig } from "../../config/app.config.js";

export function buildMeta(req, overrides = {}) {
  const title = overrides.title ? `${overrides.title} | ${appConfig.name}` : appConfig.name;

  return {
    title,
    description:
      overrides.description ||
      "Portfolio, technical writing, projects, and useful online tools by Kabir Mahmud.",
    canonical: overrides.canonical || `${appConfig.url}${req.originalUrl === "/" ? "" : req.originalUrl}`,
    image: overrides.image || "/images/og-default.png",
    type: overrides.type || "website",
    noIndex: overrides.noIndex || false,
    schema: overrides.schema || null
  };
}
