import { createClient } from 'redis'

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined
}

export const redis = globalForRedis.redis ?? createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Connect to Redis
if (!redis.isOpen) {
  redis.connect().catch(console.error)
}

// Helper functions
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis GET error:', error)
    return null
  }
}

export async function cacheSet(key: string, value: any, ttl?: number): Promise<void> {
  try {
    const stringValue = JSON.stringify(value)
    if (ttl) {
      await redis.setEx(key, ttl, stringValue)
    } else {
      await redis.set(key, stringValue)
    }
  } catch (error) {
    console.error('Redis SET error:', error)
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Redis DEL error:', error)
  }
}

