import { logger } from "../utils";
import redis from "../utils/redis";

export default class RedisService {
  async set<T>(key: string, value: T, ttl: number) {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    if (ttl) {
      await redis?.setex(key, ttl, stringValue);
      logger.info(`${key} has been stored in redis`);
    } else {
      await redis?.set(key, stringValue);
      logger.info(`${key} has been stored in redis`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await redis?.get(key);
    if (data === null) return null;

    const stringData = data?.toString();
    try {
      return JSON.parse(stringData!) as T;
    } catch {
      return stringData as T;
    }
  }

  async del(key: string) {
    if (!key) return;
    await redis?.del(key);
    logger.info(`${key} has been deleted from redis`);
  }

  async exist(key: string): Promise<boolean> {
    return (await redis?.exists(key)) === 1;
  }

  async flushdb() {
    await redis?.flushdb();
    logger.info("Redis DB has been clear!");
  }

  async delByPattern(pattern: string) {
    const keys = await redis.keys(pattern);

    if (!keys || keys.length === 0) return;

    await redis.del(...keys);

    console.log(`Deleted ${keys.length} keys matching ${pattern}`);
  }
}
