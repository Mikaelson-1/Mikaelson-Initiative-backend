import express from "express";
import UserController from "../../features/account/controller/user.controller";
import multer from "multer";

const userRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management authentication and profile
 */

/**
 * @swagger
 * /api/v1/users/welcome:
 *   get:
 *     summary: Welcome message
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Welcome message
 */
userRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Users API v1");
});

/**
 * @swagger
 * /api/v1/users/top-contributors:
 *   get:
 *     summary: Get top contributors
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of top contributors
 */
userRouter.get("/top-contributors", UserController.getTopContributors);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clerkId:
 *                 type: string
 *               username:
 *                 type: string
 *               uniqueName:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *   get:
 *     summary: Get all users
 *     tags: [Users]
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
 *         description: List of users
 */
userRouter.post("/", UserController.createUser);
userRouter.get("/", UserController.getUsers);

/**
 * @swagger
 * /api/v1/users/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               followerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User followed successfully
 */
userRouter.post("/follow", UserController.followUser);

/**
 * @swagger
 * /api/v1/users/subscribe:
 *   post:
 *     summary: Subscribe to a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscribeToId:
 *                 type: string
 *               subscriberId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscribed successfully
 */
userRouter.post("/subscribe", UserController.subscirbeToUser);

/**
 * @swagger
 * /api/v1/users/{id}/followers:
 *   get:
 *     summary: Get user followers
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of followers
 */
userRouter.get("/:id/followers", UserController.getFollowers);

/**
 * @swagger
 * /api/v1/users/{id}/followings:
 *   get:
 *     summary: Get user followings
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of followings
 */
userRouter.get("/:id/followings", UserController.getFollowings);

/**
 * @swagger
 * /api/v1/users/{id}/likes:
 *   get:
 *     summary: Get user likes
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of likes
 */
userRouter.get("/:id/likes", UserController.getAllUserLikes);

/**
 * @swagger
 * /api/v1/users/{id}/challenges:
 *   get:
 *     summary: Get user challenges
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of challenges
 */
userRouter.get("/:id/challenges", UserController.getChallengesYouArePartOf);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
userRouter.get("/:id", UserController.getUserById);
userRouter.patch(
  "/:id",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  UserController.updateUser
);
userRouter.delete("/:id", UserController.deleteUser);

export default userRouter;
