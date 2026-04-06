import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

function createLimiter(
  prefix: string,
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1]
): Ratelimit | null {
  if (!hasUpstash) return null;
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${prefix}`,
  });
}

export async function checkLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (!limiter) return { allowed: true, remaining: 999 };
  const result = await limiter.limit(identifier);
  return { allowed: result.success, remaining: result.remaining };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Public booking form — strict: prevents spam submissions that trigger Twilio/Resend costs
export const bookingsLimiter = createLimiter("bookings", 5, "1 m");

// Availability calendar polling — relaxed: legitimate UX need for frequent checks
export const availabilityLimiter = createLimiter("availability", 30, "1 m");

// Admin API actions (keyed by user ID after auth) — generous: low abuse risk behind auth
export const adminLimiter = createLimiter("admin", 60, "1 m");

// SMS send — tight: each call costs real money via Twilio
export const smsLimiter = createLimiter("sms", 10, "1 m");
