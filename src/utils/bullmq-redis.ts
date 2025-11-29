import IORedis from "ioredis";
import logger from "./logger";

let bullRedis: IORedis | null = null;

if (process.env.UPSTASH_REDIS_REST_IOREDIS_TOKEN) {
  bullRedis = new IORedis(process.env.UPSTASH_REDIS_REST_IOREDIS_TOKEN, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
  });

  /*bullRedis.on("connect", () => {
    logger.info("✅ BullRedis upstash connected successfully");
  });

  bullRedis.on("error", (err) => {
    logger.error({ err }, "❌ BullRedis connection failed");
  });*/
} else {
  logger.info("BullRedis not configured - queues disabled");
}

export { bullRedis };
