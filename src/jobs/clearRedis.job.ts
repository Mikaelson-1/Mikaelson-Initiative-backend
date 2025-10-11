import RedisService from "../services/redis.service";
import cron from "node-cron";
import { logger } from "../utils";
import redis from "../utils/redis";

const redisService = new RedisService();

cron.schedule("0 0 * * *", async () => {
  try {
    logger.info("Clearing all keys in redis...");
    const keys = await redis.keys("posts:*");
    if (keys.length > 0) await redis.del(...keys);
    logger.info("Redis cache cleared at midnight!");
  } catch {
    logger.info("Something went wrong!");
  }
});
