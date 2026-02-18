/**
 * In-memory rate limiter for authentication endpoints
 *
 * NOTE: This is MVP-appropriate. For production, use Redis or Upstash
 * to enable rate limiting across multiple server instances.
 */

interface RateLimitStore {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

const store = new Map<string, RateLimitStore>();

// Cleanup expired entries every 60 seconds to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetAt < now) {
      store.delete(key);
    }
  }
}, 60000);

export function rateLimit({ key, limit, windowMs }: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  // No record or expired window - start fresh
  if (!record || record.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      success: true,
      remaining: limit - 1,
      resetAt,
    };
  }

  // Increment count within existing window
  if (record.count < limit) {
    record.count++;
    return {
      success: true,
      remaining: limit - record.count,
      resetAt: record.resetAt,
    };
  }

  // Rate limit exceeded
  return {
    success: false,
    remaining: 0,
    resetAt: record.resetAt,
  };
}

// Preset configurations for common use cases
export const loginLimiter = (key: string) =>
  rateLimit({ key, limit: 5, windowMs: 15 * 60 * 1000 }); // 5 attempts per 15 minutes

export const resetLimiter = (key: string) =>
  rateLimit({ key, limit: 3, windowMs: 60 * 60 * 1000 }); // 3 attempts per hour
