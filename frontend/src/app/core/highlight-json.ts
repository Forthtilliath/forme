import { escapeHtml } from '@forthtilliath/ts-kit';

const TOKEN =
  /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

/**
 * Colore un JSON deja indente en <span class="j-*">. Chaque morceau est echappe :
 * le resultat peut etre injecte via [innerHTML] sans ouvrir de faille.
 */
export function highlightJson(json: string): string {
  let html = '';
  let last = 0;
  for (const match of json.matchAll(TOKEN)) {
    const [whole, str, colon, keyword, number] = match;
    html += escapeHtml(json.slice(last, match.index));
    if (str !== undefined) {
      const cls = colon ? 'j-key' : 'j-str';
      html += `<span class="${cls}">${escapeHtml(str)}</span>${colon ? escapeHtml(colon) : ''}`;
    } else if (keyword !== undefined) {
      html += `<span class="j-kw">${keyword}</span>`;
    } else if (number !== undefined) {
      html += `<span class="j-num">${number}</span>`;
    }
    last = match.index + whole.length;
  }
  return html + escapeHtml(json.slice(last));
}
