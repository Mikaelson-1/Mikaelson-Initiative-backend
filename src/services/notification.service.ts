import { PrismaClient } from "@prisma/client";
import prisma from "../config/prismadb";
import { logger } from "../utils";

export default class NotificationService<T> {
  async getNotifications(clerkId: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: clerkId,
      },
      include: {
        post: true,
        challenge: true,
        comment: true,
        task: true,
        like: true,
        follower: true,
        bookmark: true,
      },
    });
    logger.info(notifications);
  }
}
