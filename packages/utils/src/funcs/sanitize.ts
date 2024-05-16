/**
 * Sanitize HTML text to prevent XSS injections
 * @param html The text to sanitize
 * @returns The sanitized HTMl text
 */
export function sanitizeHtml(html: string) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
