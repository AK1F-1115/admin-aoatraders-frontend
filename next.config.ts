import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * CSP notes:
 *  - script-src: 'self' + 'unsafe-inline' — Next.js App Router still emits
 *    small inline hydration scripts. Strict nonce-based CSP is a future
 *    hardening step; for now 'unsafe-inline' is scoped to 'self' origin only.
 *  - style-src: 'unsafe-inline' — react-syntax-highlighter injects inline styles.
 *  - connect-src: restricts fetch/XHR to same origin only (all external calls
 *    go through the /api/* proxy, not direct from the browser).
 *  - frame-ancestors 'none': prevents clickjacking (same effect as X-Frame-Options: DENY).
 *  - object-src 'none': disables Flash/plugins.
 *  - base-uri 'self': prevents <base> tag hijacking.
 *  - form-action 'self': prevents forms from submitting to external sites.
 */
const securityHeaders = [
  // Clickjacking protection
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIME sniffing protection
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer — only send origin when navigating cross-origin
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // HSTS — enforce HTTPS for 1 year (includeSubDomains; no preload yet)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Permissions — disable powerful browser APIs not needed by this app
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js App Router requires 'unsafe-inline' for hydration scripts
      "script-src 'self' 'unsafe-inline'",
      // react-syntax-highlighter uses inline styles
      "style-src 'self' 'unsafe-inline'",
      // Images: allow data URIs for chart placeholders
      "img-src 'self' data:",
      // All API calls go through /api/* proxy — no direct browser → backend requests
      "connect-src 'self'",
      "font-src 'self'",
      // Block plugins entirely
      "object-src 'none'",
      "media-src 'none'",
      // Block iframes (belt + suspenders alongside X-Frame-Options)
      "frame-ancestors 'none'",
      "frame-src 'none'",
      // Prevent <base> tag hijacking
      "base-uri 'self'",
      // Prevent form submissions to external sites
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig;
