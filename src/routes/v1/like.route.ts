import express from "express";
import LikeController from "../../features/social-feed/controller/like.controller";

const likeRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Like management
 */

/**
 * @swagger
 * /api/v1/likes/welcome:
 *   get:
 *     summary: Welcome message
 *     tags: [Likes]
 *     responses:
 *       200:
 *         description: Welcome message
 */
likeRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Likes API v1");
});

/**
 * @swagger
 * /api/v1/likes:
 *   post:
 *     summary: Create a like
 *     tags: [Likes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               postId:
 *                 type: string
 *               commentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Like created successfully
 */
likeRouter.post("/", LikeController.createLike);

/**
 * @swagger
 * /api/v1/likes/{id}:
 *   get:
 *     summary: Get like by ID
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like details
 *   delete:
 *     summary: Remove a like
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like removed successfully
 */
likeRouter.get("/:id", LikeController.getLike);
likeRouter.delete("/:id", LikeController.deleteLikes);

/**
 * @swagger
 * /api/v1/likes/post/{id}:
 *   get:
 *     summary: Get likes for a post
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of likes for the post
 */
likeRouter.get("/post/:id", LikeController.getLikes);

export default likeRouter;
