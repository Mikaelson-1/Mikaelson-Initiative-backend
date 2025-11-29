import { Queue } from "bullmq";
import { bullRedis } from "../utils/bullmq-redis";
import logger from "../utils/logger";

let notificationQueue: Queue | null = null;

if (bullRedis) {
  notificationQueue = new Queue("notifications", {
    connection: bullRedis,
  });
  logger.info("✅ Notification queue initialized");
} else {
  logger.info("Notification queue disabled - no Redis connection");
}

export { notificationQueue };
