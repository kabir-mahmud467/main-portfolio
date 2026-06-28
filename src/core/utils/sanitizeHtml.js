const allowedTags = new Set([
  "a",
  "article",
  "aside",
  "blockquote",
  "br",
  "caption",
  "code",
  "col",
  "colgroup",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "section",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul"
]);

const globalAttributes = new Set(["class", "id", "title", "aria-label"]);
const tagAttributes = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height", "loading", "decoding"]),
  table: new Set(["summary"]),
  th: new Set(["scope", "colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
  col: new Set(["span"]),
  colgroup: new Set(["span"])
};

const voidTags = new Set(["br", "hr", "img", "col"]);

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isSafeUrl(value) {
  const url = String(value || "").trim().toLowerCase();
  return (
    url.startsWith("/") ||
    url.startsWith("#") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("mailto:") ||
    url.startsWith("data:image/")
  );
}

function sanitizeAttributes(tagName, rawAttributes = "") {
  const allowedForTag = tagAttributes[tagName] || new Set();
  const attributes = [];
  const attributePattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = attributePattern.exec(rawAttributes))) {
    const name = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? "";

    if (name.startsWith("on") || name === "style") continue;
    if (!globalAttributes.has(name) && !allowedForTag.has(name)) continue;
    if ((name === "href" || name === "src") && !isSafeUrl(value)) continue;

    if (tagName === "a" && name === "target" && value !== "_blank") continue;

    attributes.push(`${name}="${escapeAttribute(value)}"`);
  }

  if (tagName === "a" && !attributes.some((attribute) => attribute.startsWith("rel="))) {
    attributes.push('rel="noopener noreferrer"');
  }

  if (tagName === "img") {
    if (!attributes.some((attribute) => attribute.startsWith("loading="))) {
      attributes.push('loading="lazy"');
    }
    if (!attributes.some((attribute) => attribute.startsWith("decoding="))) {
      attributes.push('decoding="async"');
    }
  }

  return attributes.length ? ` ${attributes.join(" ")}` : "";
}

export function sanitizeHtml(html) {
  return String(html || "")
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<\/?(html|head|body|meta|link|title)[^>]*>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g, (fullMatch, rawTagName, rawAttributes) => {
      const tagName = rawTagName.toLowerCase();
      const isClosing = fullMatch.startsWith("</");

      if (!allowedTags.has(tagName)) {
        return "";
      }

      if (isClosing) {
        return voidTags.has(tagName) ? "" : `</${tagName}>`;
      }

      return `<${tagName}${sanitizeAttributes(tagName, rawAttributes)}>`;
    });
}

export function stripHtml(html) {
  return String(html || "").replace(/<[^>]*>/g, " ");
}
