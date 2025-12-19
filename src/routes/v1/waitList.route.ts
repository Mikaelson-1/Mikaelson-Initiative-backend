import express from "express";
import UserController from "../../features/account/controller/user.controller";
import multer from "multer";
import WaitListController from "../../features/account/controller/waitList.controller";

const waitListRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: WaitList
 *   description: Waitlist management
 */

/**
 * @swagger
 * /api/v1/waitList/welcome:
 *   get:
 *     summary: Welcome message
 *     tags: [WaitList]
 *     responses:
 *       200:
 *         description: Welcome message
 */
waitListRouter.get(
  "/welcome",
  (req: express.Request, res: express.Response) => {
    res.send("Welcome to waitList API v1");
  }
);

/**
 * @swagger
 * /api/v1/waitList:
 *   get:
 *     summary: Get all waitlist entries
 *     tags: [WaitList]
 *     responses:
 *       200:
 *         description: List of waitlist entries
 *   post:
 *     summary: Join the waitlist
 *     tags: [WaitList]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               interest:
 *                 type: string
 *               hearing:
 *                 type: string
 *     responses:
 *       201:
 *         description: Joined waitlist successfully
 */
waitListRouter.get("/", WaitListController.getWaitLists);
waitListRouter.post("/", WaitListController.createUser);

export default waitListRouter;
