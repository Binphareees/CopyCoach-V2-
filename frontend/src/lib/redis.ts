import { Redis } from "@upstash/redis";

const memoryStore = new Map<string, { value: string; expiresAt: number }>();

let redisInstance: Redis | null = null;

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

export function getRedis(): Redis | null {
  if (!isRedisConfigured()) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[redis] UPSTASH_REDIS_REST_URL/TOKEN missing — using in-memory fallback (single instance only)."
      );
    }
    return null;
  }
  if (!redisInstance) {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisInstance;
}

export const kv = {
  async get(key: string): Promise<string | null> {
    const redis = getRedis();
    if (redis) {
      try {
        return await redis.get<string>(key);
      } catch (err) {
        console.error("[redis] get error:", err);
        return null;
      }
    }
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value;
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const redis = getRedis();
    if (redis) {
      try {
        if (ttlSeconds) {
          await redis.set(key, value, { ex: ttlSeconds });
        } else {
          await redis.set(key, value);
        }
      } catch (err) {
        console.error("[redis] set error:", err);
      }
      return;
    }
    memoryStore.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds ? ttlSeconds * 1000 : 30 * 60 * 1000),
    });
  },

  async del(key: string): Promise<void> {
    const redis = getRedis();
    if (redis) {
      try {
        await redis.del(key);
      } catch (err) {
        console.error("[redis] del error:", err);
      }
      return;
    }
    memoryStore.delete(key);
  },
};