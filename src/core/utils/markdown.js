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
  let listType = null;
  let inQuote = false;

  function flushParagraph() {
    if (!paragraph.length) return;
    const joined = paragraph.join(" ");
    const imageOnly = joined.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);
    if (imageOnly) {
      html.push(
        `<img src="${imageOnly[2]}" alt="${escapeHtml(imageOnly[1])}" loading="lazy" ` +
        `class="mt-6 w-full rounded-xl border border-line/70 object-cover shadow-soft" />`
      );
      paragraph = [];
      return;
    }
    html.push(`<p>${inlineMarkdown(joined)}</p>`);
    paragraph = [];
  }

  function closeList() {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  }

  function closeQuote() {
    if (inQuote) {
      html.push("</blockquote>");
      inQuote = false;
    }
  }

  function renderTable(rows) {
    const headers = rows[0]
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c !== "");
    const body = rows
      .slice(1)
      .filter((r) => !r.match(/^\|[\s:|-]+\|$/));
    const cell = (content, tag) =>
      `<${tag} class="border border-line/60 bg-white/5 px-3 py-2 text-left align-top text-sm text-ink/80">${inlineMarkdown(content.trim())}</${tag}>`;
    return (
      `<div class="mt-6 overflow-x-auto rounded-xl border border-line/70 bg-white/40 shadow-soft">` +
      `<table class="w-full border-collapse text-sm">` +
      `<thead><tr>${headers.map((h) => cell(h, "th")).join("")}</tr></thead>` +
      `<tbody>${body.map((r) => `<tr>${r.split("|").map((c) => c.trim()).filter((c) => c !== "").map((c) => cell(c, "td")).join("")}</tr>`).join("")}</tbody>` +
      `</table></div>`
    );
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const codeFence = line.match(/^```(\w+)?/);
    if (codeFence) {
      flushParagraph();
      closeList();
      closeQuote();
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

    const tableMatch = line.match(/^\|.*\|$/);
    if (tableMatch) {
      flushParagraph();
      closeList();
      closeQuote();
      const rows = [line];
      while (i + 1 < lines.length && lines[i + 1].trim()) {
        rows.push(lines[++i]);
      }
      const isTable = rows.length >= 2 && rows[1].match(/^\|[\s:|-]+\|$/);
      if (isTable) {
        html.push(renderTable(rows));
        continue;
      }
      paragraph.push(line.trim());
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      closeList();
      closeQuote();
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      closeList();
      if (!inQuote) {
        inQuote = true;
        html.push(`<blockquote class="my-6 border-l-4 border-flame/60 bg-white/40 px-4 py-2 italic text-ink/70">`);
      }
      html.push(`<p>${inlineMarkdown(quoteMatch[1])}</p>`);
      continue;
    }

    const ulMatch = line.match(/^-\s+(.*)$/);
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (ulMatch || olMatch) {
      flushParagraph();
      closeQuote();
      const nextType = olMatch ? "ol" : "ul";
      const content = (olMatch || ulMatch)[1];
      if (!listType) {
        listType = nextType;
        html.push(
          nextType === "ul"
            ? `<ul class="my-5 list-disc space-y-2 pl-6 text-ink/80">`
            : `<ol class="my-5 list-decimal space-y-2 pl-6 text-ink/80">`
        );
      }
      html.push(`<li>${inlineMarkdown(content)}</li>`);
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      closeList();
      closeQuote();
      html.push(`<h3 class="mt-8 text-2xl font-extrabold text-ink">${inlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      closeList();
      closeQuote();
      html.push(`<h2 class="mt-10 font-display text-3xl font-extrabold text-ink">${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      closeList();
      closeQuote();
      html.push(`<h1 class="mt-10 font-display text-4xl font-extrabold text-ink">${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();
  closeQuote();
  if (inCode) html.push("</code></pre>");
  return html.join("\n");
}
