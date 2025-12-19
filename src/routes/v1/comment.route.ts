import express from "express";
import multer from "multer";
import CommentController from "../../features/social-feed/controller/comment.controller";

const commentRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management
 */

/**
 * @swagger
 * /api/v1/comments/welcome:
 *   get:
 *     summary: Welcome message
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: Welcome message
 */
commentRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Comments API v1");
});

/**
 * @swagger
 * /api/v1/comments:
 *   post:
 *     summary: Create a comment
 *     tags: [Comments]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *               userId:
 *                 type: string
 *               postId:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Comment created successfully
 */
commentRouter.post("/", upload.array("files"), CommentController.createComment);

/**
 * @swagger
 * /api/v1/comments/post/{id}:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
commentRouter.get("/post/:id", CommentController.getComments);

/**
 * @swagger
 * /api/v1/comments/{id}:
 *   get:
 *     summary: Get comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment details
 *   patch:
 *     summary: Update comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *   delete:
 *     summary: Delete comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 */
commentRouter.get("/:id", CommentController.getCommentById);
commentRouter.patch("/:id", CommentController.updateComment);
commentRouter.delete("/:id", CommentController.deleteComment);

export default commentRouter;
