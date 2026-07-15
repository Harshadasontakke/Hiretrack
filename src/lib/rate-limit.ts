/**
 * Minimal in-memory rate limiter.
 *
 * Good enough for a single-instance / small-team deployment of HireTrack.
 * If you scale HireTrack across multiple server instances, swap the
 * in-memory `Map` below for a shared store (e.g. Redis / Upstash) — the
 * `check()` API is intentionally small so that's a drop-in change.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// Periodically clear out expired buckets so this Map doesn't grow forever.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Milliseconds until the window resets. */
  retryAfterMs: number;
};

/**
 * Fixed-window rate limiter.
 *
 * @param key        Unique identifier for the thing being limited
 *                    (e.g. `login:${ip}` or `register:${ip}`).
 * @param limit      Max number of calls allowed within the window.
 * @param windowMs   Length of the window in milliseconds.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, retryAfterMs: windowMs };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
    };
  }

  existing.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    retryAfterMs: existing.resetAt - now,
  };
}

/**
 * Best-effort client IP extraction, since Next.js's `Request` doesn't
 * expose a socket address directly. Falls back to "unknown" (which still
 * rate-limits, just as one shared bucket) if no proxy header is present.
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
