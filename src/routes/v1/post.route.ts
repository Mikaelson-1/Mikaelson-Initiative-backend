import express from "express";
import PostController from "../../features/social-feed/controller/post.controller";
import multer from "multer";

const postRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management and social feed
 */

/**
 * @swagger
 * /api/v1/posts/welcome:
 *   get:
 *     summary: Welcome message
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Welcome message
 */
postRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Posts API v1");
});

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               post:
 *                 type: string
 *               userId:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 */
postRouter.post("/", upload.array("files"), PostController.createPost);
postRouter.get("/", PostController.getPosts);

/**
 * @swagger
 * /api/v1/posts/today:
 *   get:
 *     summary: Get posts created today
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts created today
 */
postRouter.get("/today", PostController.AllPostCreatedToday);

/**
 * @swagger
 * /api/v1/posts/tags:
 *   get:
 *     summary: Get posts by tags
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *     responses:
 *       200:
 *         description: List of posts with specified tags
 */
postRouter.get("/tags", PostController.getTagsPosts);

/**
 * @swagger
 * /api/v1/posts/repost:
 *   post:
 *     summary: Repost a post
 *     tags: [Posts]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               repostOfId:
 *                 type: string
 *               userId:
 *                 type: string
 *               post:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Post reposted successfully
 */
postRouter.post("/repost", upload.array("files"), PostController.repost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *   patch:
 *     summary: Update post
 *     tags: [Posts]
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
 *               post:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *   delete:
 *     summary: Delete post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
postRouter.get("/:id", PostController.getPostById);
postRouter.patch("/:id", PostController.updatePost);
postRouter.delete("/:id", PostController.deletePost);

/**
 * @swagger
 * /api/v1/posts/user/{id}:
 *   get:
 *     summary: Get user posts
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user posts
 */
postRouter.get("/user/:id", PostController.getUsersPosts);

/**
 * @swagger
 * /api/v1/posts/following/{id}:
 *   get:
 *     summary: Get posts from followed users
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of following posts
 */
postRouter.get("/following/:id", PostController.getFollowingPosts);

/**
 * @swagger
 * /api/v1/posts/user/{id}/today:
 *   get:
 *     summary: Get user posts created today
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user posts created today
 */
postRouter.get("/user/:id/today", PostController.userPostCreatedToday);

/**
 * @swagger
 * /api/v1/posts/{id}/views:
 *   patch:
 *     summary: Track post views
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Views updated
 */
postRouter.patch("/:id/views", PostController.trackViewsMetric);

export default postRouter;
