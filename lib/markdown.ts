// Minimal, safe Markdown → HTML for imported Studiolo bodies. Escapes all HTML first.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(s: string) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(NOLAN[^\]]*)\]/g, '<span class="bracket">[$1]</span>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
}

export function renderMarkdown(md: string): string {
  const out: string[] = [];
  let list: string[] | null = null as string[] | null;
  const flush = () => {
    if (list) out.push(`<ul>${list.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`);
    list = null;
  };
  for (const block of md.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = block.split("\n");
    if (lines.every((l) => /^\s*[-*] /.test(l))) {
      list = (list ?? []).concat(lines.map((l) => l.replace(/^\s*[-*] /, "")));
      continue;
    }
    flush();
    const t = block.trim();
    if (!t) continue;
    const h = /^(#{1,3}) (.+)$/.exec(t);
    if (h) out.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`);
    else if (t.startsWith("> ")) out.push(`<blockquote>${inline(t.replace(/^> ?/gm, ""))}</blockquote>`);
    else out.push(`<p>${inline(t).replace(/\n/g, "<br>")}</p>`);
  }
  flush();
  return out.join("\n");
}
