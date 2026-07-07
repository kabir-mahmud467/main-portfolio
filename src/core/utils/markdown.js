function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-ink/10 px-1 py-0.5">$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a class="font-bold text-flame hover:text-ink" href="$2" rel="noopener noreferrer">$1</a>');
}

export function renderMarkdown(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const html = [];
  let inCode = false;
  let codeLang = "";
  let paragraph = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  for (const line of lines) {
    const codeFence = line.match(/^```(\w+)?/);
    if (codeFence) {
      flushParagraph();
      if (!inCode) {
        inCode = true;
        codeLang = codeFence[1] || "text";
        html.push(`<pre class="mt-6 overflow-auto rounded-xl border border-line/70 bg-ink p-4 text-sm leading-7 text-white shadow-soft"><code class="language-${escapeHtml(codeLang)}">`);
      } else {
        inCode = false;
        html.push("</code></pre>");
      }
      continue;
    }

    if (inCode) {
      html.push(`${escapeHtml(line)}\n`);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      html.push(`<h3 class="mt-8 text-2xl font-extrabold text-ink">${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      html.push(`<h2 class="mt-10 font-display text-3xl font-extrabold text-ink">${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      html.push(`<h1 class="mt-10 font-display text-4xl font-extrabold text-ink">${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  if (inCode) html.push("</code></pre>");
  return html.join("\n");
}
