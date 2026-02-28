/**
 * Simple in-memory rate limiter.
 * Works on Vercel serverless functions (per-instance).
 * For production with multiple instances, use Upstash Redis instead.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Maximum number of requests */
  max: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // No existing entry or window expired — allow and create new entry
  if (!entry || now > entry.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + config.windowSeconds * 1000,
    });
    return { allowed: true, remaining: config.max - 1, retryAfterSeconds: 0 };
  }

  // Within window — check count
  if (entry.count < config.max) {
    entry.count++;
    return {
      allowed: true,
      remaining: config.max - entry.count,
      retryAfterSeconds: 0,
    };
  }

  // Rate limited
  const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
  return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
}

/**
 * Get client IP from request (works with Vercel, Cloudflare, etc.)
 */
export function getClientIp(request: Request): string {
  const forwarded = (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim();
  const real = request.headers.get("x-real-ip");
  return forwarded || real || "unknown";
}