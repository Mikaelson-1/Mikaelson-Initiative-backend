import { Queue } from "bullmq";
import { bullRedis } from "../utils/bullmq-redis";

export const emailQueue = new Queue("emails", {
  connection: bullRedis,
});
