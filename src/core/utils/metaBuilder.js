import { appConfig } from "../../config/app.config.js";

function getAbsoluteUrl(value) {
  if (!value) return `${appConfig.url}/images/image.jpg`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `${appConfig.url}${value.startsWith("/") ? value : `/${value}`}`;
}

export function buildMeta(req, overrides = {}) {
  const title = overrides.title ? `${overrides.title} | ${appConfig.name}` : appConfig.name;

  return {
    title,
    description:
      overrides.description ||
      "Portfolio, technical writing, projects, and useful online tools by Kabir Mahmud.",
    canonical: overrides.canonical || `${appConfig.url}${req.originalUrl === "/" ? "" : req.originalUrl}`,
    image: getAbsoluteUrl(overrides.image || "/images/image.jpg"),
    type: overrides.type || "website",
    noIndex: overrides.noIndex || false,
    schema: overrides.schema || null
  };
}
