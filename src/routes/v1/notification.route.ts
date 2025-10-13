import express from "express";
import NotifcationController from "../../features/notifications/controller/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get(
  "/welcome",
  (req: express.Request, res: express.Response) => {
    res.send("Welcome to Notification API v1");
  }
);

notificationRouter.get("/:id", NotifcationController.getNotification);
notificationRouter.patch("/:id", NotifcationController.markNotificationAsRead);
notificationRouter.delete("/:id", NotifcationController.deleteNotification);
notificationRouter.get("/receiver/:id", NotifcationController.getNotifications);

export default notificationRouter;
