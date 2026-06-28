export const toolDefinitions = [
  ["password-generator", "Password Generator", "Generate strong passwords with configurable length and character sets.", "Security"],
  ["qr-generator", "QR Generator", "Create QR codes from URLs, text, or contact snippets.", "Utility"],
  ["json-formatter", "JSON Formatter", "Format, validate, and inspect JSON snippets quickly.", "Developer"],
  ["base64-encoder", "Base64 Encoder", "Encode plain text into Base64 safely in your browser.", "Developer"],
  ["base64-decoder", "Base64 Decoder", "Decode Base64 strings into readable plain text.", "Developer"],
  ["word-counter", "Word Counter", "Count words, sentences, and estimated reading time.", "Writing"],
  ["character-counter", "Character Counter", "Count characters, spaces, lines, and paragraphs.", "Writing"],
  ["uuid-generator", "UUID Generator", "Generate random UUID v4 identifiers instantly.", "Developer"],
  ["lorem-ipsum-generator", "Lorem Ipsum Generator", "Generate placeholder paragraphs for layouts and mockups.", "Design"],
  ["color-converter", "Color Converter", "Convert HEX, RGB, and HSL color values.", "Design"],
  ["timestamp-converter", "Timestamp Converter", "Convert Unix timestamps and ISO dates.", "Developer"],
  ["text-difference-checker", "Text Difference Checker", "Compare two text blocks and highlight line differences.", "Writing"],
  ["image-compressor", "Image Compressor", "Compress images locally in the browser using canvas.", "Image"],
  ["image-converter", "Image Converter", "Convert images locally between common browser-supported formats.", "Image"]
].map(([slug, name, description, category]) => ({
  slug,
  name,
  description,
  category,
  moduleKey: slug,
  route: `/tools/${slug}`,
  controller: `${slug}Controller`,
  view: `pages/tools/${slug}`,
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: name, href: `/tools/${slug}` }
  ],
  seo: {
    title: `${name} | Free Online Tool`,
    description,
    canonicalPath: `/tools/${slug}`
  },
  schema: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    applicationCategory: category,
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  }
}));

export function getToolDefinition(slug) {
  return toolDefinitions.find((tool) => tool.slug === slug);
}
