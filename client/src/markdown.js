/** Lightweight markdown → HTML for chat bubbles (no external deps). */
export function renderMarkdown(text) {
  if (!text) return '';

  const normalized = text.trim().replace(/\n{3,}/g, '\n\n');
  const blocks = normalized.split(/\n\n/);

  return blocks.map(renderBlock).join('');
}

function renderBlock(block) {
  const trimmed = block.trim();
  if (!trimmed) return '';

  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);

  if (lines.every((l) => /^- /.test(l))) {
    const items = lines.map((l) => `<li>${inlineFormat(l.slice(2))}</li>`).join('');
    return `<ul class="pt-md-ul">${items}</ul>`;
  }

  if (lines.length === 1) {
    const heading = parseHeading(lines[0]);
    if (heading) return `<div class="pt-md-label">${heading}</div>`;
    return `<p class="pt-md-p">${inlineFormat(lines[0])}</p>`;
  }

  return lines
    .map((line) => {
      const heading = parseHeading(line);
      if (heading) return `<div class="pt-md-label">${heading}</div>`;
      if (/^- /.test(line)) return `<ul class="pt-md-ul"><li>${inlineFormat(line.slice(2))}</li></ul>`;
      return `<p class="pt-md-p">${inlineFormat(line)}</p>`;
    })
    .join('');
}

function parseHeading(line) {
  const m = line.match(/^#{2,3}\s+(.+)$/);
  return m ? inlineFormat(m[1]) : null;
}

function inlineFormat(s) {
  let html = escapeHtml(s);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  return html;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
