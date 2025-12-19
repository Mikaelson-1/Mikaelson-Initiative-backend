import express from "express";
import BookmarkController from "../../features/social-feed/controller/bookmark.controller";

const bookmarkRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookmarks
 *   description: Bookmark management
 */

/**
 * @swagger
 * /api/v1/bookmarks/welcome:
 *   get:
 *     summary: Welcome message
 *     tags: [Bookmarks]
 *     responses:
 *       200:
 *         description: Welcome message
 */
bookmarkRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Bookmarks API v1");
});

/**
 * @swagger
 * /api/v1/bookmarks:
 *   post:
 *     summary: Create a bookmark
 *     tags: [Bookmarks]
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
 *     responses:
 *       201:
 *         description: Bookmark created successfully
 */
bookmarkRouter.post("/", BookmarkController.createBookmark);

/**
 * @swagger
 * /api/v1/bookmarks/user/{id}:
 *   get:
 *     summary: Get user bookmarks
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user bookmarks
 */
bookmarkRouter.get("/user/:id", BookmarkController.getBookmarks);

/**
 * @swagger
 * /api/v1/bookmarks/{id}:
 *   get:
 *     summary: Get bookmark by ID
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark details
 *   delete:
 *     summary: Delete bookmark
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bookmark deleted successfully
 */
bookmarkRouter.get("/:id", BookmarkController.getBookmarkById);
bookmarkRouter.delete("/:id", BookmarkController.deleteBookmark);

export default bookmarkRouter;
