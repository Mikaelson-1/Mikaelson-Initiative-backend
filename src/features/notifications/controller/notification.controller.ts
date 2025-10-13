import NotificationService from "../../../services/notification.service";
import express from "express";
import { ApiError, ApiSuccess, logger } from "../../../utils";
import prisma from "../../../config/prismadb";

const notificationService = new NotificationService();

class NotifcationController {
  static async getNotifications(req: express.Request, res: express.Response) {
    try {
      const receiverId = req.params.id;
      const notifications = await notificationService.getNotifications(
        receiverId
      );
      logger.info(notifications);
      if (notifications) {
        res
          .status(200)
          .json(
            new ApiSuccess(
              200,
              "Notifications gotten successfully!,",
              notifications
            )
          );
      }
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getNotification(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      const notification = await notificationService.getNotificationById(id);
      logger.info(notification);
      if (notification) {
        res
          .status(200)
          .json(
            new ApiSuccess(
              200,
              "Notification gotten successfully!,",
              notification
            )
          );
      }
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async markNotificationAsRead(
    req: express.Request,
    res: express.Response
  ) {
    try {
      const id = req.params.id;
      const notifications = await notificationService.markNotificationAsRead(
        id,
        {
          isRead: true,
        }
      );
      logger.info(notifications);
      if (notifications) {
        res
          .status(200)
          .json(
            new ApiSuccess(200, "Notification marked as read!,", notifications)
          );
      }
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async deleteNotification(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      await notificationService.deleteNotification(id);

      //const del = await prisma?.notification.deleteMany({});

      res
        .status(200)
        .json(new ApiSuccess(200, "Notification deleted successfully!,", []));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }
}

export default NotifcationController;
