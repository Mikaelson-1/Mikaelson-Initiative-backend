import NotificationService from "../../../services/notification.service";
import express from "express";
import { ApiError, ApiSuccess, logger } from "../../../utils";

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
              "Notification gotten successfully!,",
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
}

export default NotifcationController;
