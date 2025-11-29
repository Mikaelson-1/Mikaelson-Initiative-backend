import Redis from "ioredis";
import logger from "./logger";

let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_IOREDIS_TOKEN) {
  redis = new Redis(process.env.UPSTASH_REDIS_REST_IOREDIS_TOKEN, {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
  });

  redis.on("connect", () => {
    logger.info("✅ Redis upstash connected successfully");
  });

  redis.on("error", (err) => {
    logger.error({ err }, "❌ Redis connection failed");
  });
} else {
  logger.info("Redis not configured - caching disabled");
}

export default redis;