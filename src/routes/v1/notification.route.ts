import express from "express";
import NotifcationController from "../../features/notifications/controller/notification.controller";

const notificationRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

/**
 * @swagger
 * /api/v1/notifications/welcome:
 *   get:
 *     summary: Welcome message
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Welcome message
 */
notificationRouter.get(
  "/welcome",
  (req: express.Request, res: express.Response) => {
    res.send("Welcome to Notification API v1");
  }
);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification details
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 */
notificationRouter.get("/:id", NotifcationController.getNotification);
notificationRouter.patch("/:id", NotifcationController.markNotificationAsRead);
notificationRouter.delete("/:id", NotifcationController.deleteNotification);

/**
 * @swagger
 * /api/v1/notifications/receiver/{id}:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user notifications
 */
notificationRouter.get("/receiver/:id", NotifcationController.getNotifications);

export default notificationRouter;
