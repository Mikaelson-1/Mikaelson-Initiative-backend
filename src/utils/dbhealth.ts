import prisma from "../config/prismadb";
import logger from "./logger";

export default async function checkDbHealth() {
  try {
    // Execute a simple query that doesn't modify data
    await prisma.user.count();
    logger.info("Prisma database connection is healthy.");
    return true;
  } catch (error) {
    logger.info("Prisma database connection failed:" + error);
    return false;
  }
}
