import { Queue } from "bullmq";
import { bullRedis } from "../utils/bullmq-redis";
import logger from "../utils/logger";

let emailQueue: Queue | null = null;

if (bullRedis) {
  emailQueue = new Queue("emails", {
    connection: bullRedis,
  });
  logger.info("Email queue initialized");
} else {
  logger.info("ℹEmail queue disabled - no Redis connection");
}

export { emailQueue };
