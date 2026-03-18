import Redis from 'ioredis';

class RedisClient {
  private static instance: Redis | null = null;

  static getInstance(): Redis | null {
    if (process.env.DISABLE_REDIS === 'true' || !process.env.REDIS_URL) {
      return null;
    }
    
    if (!this.instance) {
      this.instance = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        tls: {
          rejectUnauthorized: false
        }
      });
      
      this.instance.on('error', (err) => {
        console.error('Redis connection error:', err.message);
        this.instance = null;
      });
      
      this.instance.on('connect', () => {
        console.log('Redis connected successfully');
      });
    }
    return this.instance;
  }
}

export const redis = RedisClient.getInstance();