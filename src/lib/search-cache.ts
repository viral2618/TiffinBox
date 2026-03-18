import { redis } from '@/lib/redis';

export async function getCachedSearch(query: string) {
  try {
    if (!process.env.REDIS_URL || !redis) return null;
    const cached = await redis.get(`search:${query}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Cache read failed:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function setCachedSearch(query: string, results: any) {
  try {
    if (!process.env.REDIS_URL || !redis) return;
    await redis.setex(`search:${query}`, 300, JSON.stringify(results)); // 5min cache
  } catch (error) {
    console.warn('Cache write failed:', error instanceof Error ? error.message : String(error));
  }
}