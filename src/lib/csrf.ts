/**
 * CSRF Protection Module — Maven Security Standard v2
 * Drop into: src/lib/csrf.ts
 *
 * Usage in mutation routes:
 *   import { validateOrigin, isTrustedSource } from "@/lib/csrf";
 *   if (!isTrustedSource(request) && !validateOrigin(request)) {
 *     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 *   }
 */

const ALLOWED_ORIGINS = new Set([
  // TODO: add production domain once deployed
  // "https://capture-the-moment.vercel.app",
]);

// Trusted sources that skip origin checks (webhooks, internal APIs)
const TRUSTED_HEADERS: Record<string, string> = {
  "stripe-signature": "exists check (Stripe webhooks)",
};

/**
 * Check if request is from a trusted source (webhooks, internal APIs)
 */
export function isTrustedSource(request: Request): boolean {
  for (const header of Object.keys(TRUSTED_HEADERS)) {
    if (request.headers.get(header)) return true;
  }
  return false;
}

/**
 * Validate that the request origin matches allowed origins.
 * Returns true if origin is valid, false if suspicious.
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // In development, allow localhost
  if (process.env.NODE_ENV === "development") return true;

  // Check origin header first (most reliable)
  if (origin) {
    return ALLOWED_ORIGINS.has(origin);
  }

  // Fall back to referer
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return ALLOWED_ORIGINS.has(refererOrigin);
    } catch {
      return false;
    }
  }

  // No origin or referer — block by default
  return false;
}
