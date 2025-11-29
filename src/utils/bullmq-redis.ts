import IORedis from "ioredis";
import logger from "./logger";

export const bullRedis = new IORedis(
  process.env.UPSTASH_REDIS_REST_IOREDIS_TOKEN!,
  {
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
  }
);

/*bullRedis.on("connect", () => {
  logger.info("✅ BullRedis upstash connected successfully");
});

bullRedis.on("error", (err) => {
  logger.error({ err }, "❌ Redis connection failed");
});*/
