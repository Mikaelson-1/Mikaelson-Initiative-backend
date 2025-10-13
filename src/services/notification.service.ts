import { PrismaClient } from "@prisma/client";
import prisma from "../config/prismadb";
import { logger, redis } from "../utils";
import { Repository } from "../repository/base/repository";
import RedisService from "./redis.service";

const notificationRepository = new Repository(prisma.notification);
const redisService = new RedisService();

export default class NotificationService<T> {
  // Get
  async getNotifications(clerkId: string) {
    try {
      const cachedKey = `Notifications:user:${clerkId}`;
      const cachedNotifications = await redisService.get(cachedKey);
      if (cachedNotifications) {
        return cachedNotifications as T;
      } else {
        const notifications = await notificationRepository.findAll(
          "notifications",
          clerkId
        );
        logger.info(notifications);
        await redisService.set(cachedKey, notifications, 600);
        return notifications as T[];
      }
    } catch (error) {
      logger.info("Something went wrong!" + error);
    }
  }

  async getNotificationById(id: string) {
    try {
      const cachedKey = `Notification:${id}`;
      const cachedNotification = await redisService.get(cachedKey);
      if (cachedNotification) {
        return cachedNotification as T;
      }
      const notification = await notificationRepository.findById(
        id,
        "notification"
      );
      logger.info(notification);
      await redisService.set(cachedKey, notification, 600);
      return notification as T;
    } catch (error) {
      logger.info("Something went wrong!" + error);
    }
  }

  async markNotificationAsRead(notificationId: string, data: any) {
    try {
      const notifications = await notificationRepository.update(
        notificationId,
        data
      );
      logger.info(notifications);
      return notifications as T;
    } catch (error) {
      logger.info("Something went wrong!" + error);
    }
  }

  async deleteNotification(id: string) {
    try {
      const del = await notificationRepository.delete(id);
      if (del) {
        logger.info(`Notification:${id} deleted!`);
      }
    } catch (error) {
      logger.info("Something went wrong!" + error);
    }
  }
}
