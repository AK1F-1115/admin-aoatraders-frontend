/**
 * Output sanitization helpers.
 * Prevents XSS when rendering user-controlled or backend-sourced strings.
 */

/**
 * Strip HTML tags from a string to prevent XSS in text nodes.
 * Use before rendering any untrusted string value.
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '')
}

/**
 * Truncate a string to maxLength characters, appending "…" if truncated.
 */
export function truncate(input: string | null | undefined, maxLength: number): string {
  if (!input) return ''
  if (input.length <= maxLength) return input
  return `${input.slice(0, maxLength)}…`
}

/**
 * Sanitize a value for safe display — strips HTML and trims whitespace.
 * Falls back to the provided fallback string (default "—").
 */
export function safeDisplay(
  input: string | null | undefined,
  fallback = '—',
): string {
  if (!input) return fallback
  const stripped = stripHtml(input).trim()
  return stripped || fallback
}
