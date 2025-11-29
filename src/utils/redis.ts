import Redis from "ioredis";
import logger from "./logger";

const redis = new Redis(process.env.UPSTASH_REDIS_REST_IOREDIS_TOKEN!);

redis.on("connect", () => {
  logger.info("✅ Redis upstash connected successfully");
});

redis.on("error", (err) => {
  logger.error({ err }, "❌ Redis connection failed");
});

export default redis;
