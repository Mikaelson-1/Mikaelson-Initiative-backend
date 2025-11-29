import { Redis } from "@upstash/redis";
import logger from "./logger";

const redis = new Redis({
  url: "https://meet-hermit-20779.upstash.io",
  token: "AVErAAIncDJlN2MxYjVmOTY1ZTA0YjNkYTMxNDMxYzY4MWIyNWE0OHAyMjA3Nzk",
});

redis
  .ping()
  .then(() => logger.info("✅ Upstash Redis connected"))
  .catch((err) => logger.error({ err }, "❌ Redis connection failed"));

export default redis;
