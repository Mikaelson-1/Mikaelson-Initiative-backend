import { Queue } from "bullmq";
import { bullRedis } from "../utils/bullmq-redis";

export const notificationQueue = new Queue("notifications", {
  connection: bullRedis,
});
