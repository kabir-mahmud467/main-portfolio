export function localizeImage(url, width) {
  if (!url) {
    return url;
  }

  if (url.startsWith("/") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  try {
    new URL(url);
  } catch {
    return url;
  }

  const proxied = `/img?url=${encodeURIComponent(url)}`;
  return width ? `${proxied}&w=${width}` : proxied;
}

export function rewriteHtmlImageSources(html) {
  return String(html || "").replace(/\ssrc="(https?:\/\/[^"]+)"/g, (match, url) => {
    const proxied = localizeImage(url);
    return ` src="${proxied.replace(/&/g, "&amp;")}"`;
  });
}
