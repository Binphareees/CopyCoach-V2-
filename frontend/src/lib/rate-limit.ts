import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/redis";

type LimitResult = { success: boolean; remaining: number };

type Limiter = (identifier: string) => Promise<LimitResult>;

const memoryBuckets = new Map<string, number[]>();

function memoryLimiter(limit: number, windowSeconds: number): Limiter {
  return async (identifier: string) => {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const timestamps = (memoryBuckets.get(identifier) || []).filter(
      (t) => now - t < windowMs
    );
    timestamps.push(now);
    memoryBuckets.set(identifier, timestamps);
    return {
      success: timestamps.length <= limit,
      remaining: Math.max(0, limit - timestamps.length),
    };
  };
}

// Sliding-window rate limiter. Backed by Upstash Redis when configured;
// falls back to an in-memory per-process limiter so local/dev still work.
export function getRateLimiter(limit: number, windowSeconds: number): Limiter {
  const redis = getRedis();
  const prefix = `rl:${limit}:${windowSeconds}:`;

  if (redis) {
    const ratelimit = new Ratelimit({
      redis,
      prefix,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    });
    return async (identifier: string) => {
      try {
        const result = await ratelimit.limit(identifier);
        return { success: result.success, remaining: result.remaining };
      } catch (err) {
        console.error("[rate-limit] Upstash error (allowing request):", err);
        return { success: true, remaining: limit };
      }
    };
  }

  return memoryLimiter(limit, windowSeconds);
}