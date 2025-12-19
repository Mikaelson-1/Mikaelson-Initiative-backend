import express from "express";
import ChallengeController from "../../features/social-feed/controller/challenge.controller";

const challengeRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Challenges
 *   description: Challenge management
 */

/**
 * @swagger
 * /api/v1/challenges/welcome:
 *   get:
 *     summary: Welcome message
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: Welcome message
 */
challengeRouter.get(
  "/welcome",
  (req: express.Request, res: express.Response) => {
    res.send("Welcome to Challenges API v1");
  }
);

/**
 * @swagger
 * /api/v1/challenges:
 *   post:
 *     summary: Create a challenge
 *     tags: [Challenges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challenge:
 *                 type: string
 *               userId:
 *                 type: string
 *               days:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *   get:
 *     summary: Get all challenges
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: List of challenges
 */
challengeRouter.post("/", ChallengeController.createChallenge);
challengeRouter.get("/", ChallengeController.getChallenges);

/**
 * @swagger
 * /api/v1/challenges/posts:
 *   get:
 *     summary: Get all challenge posts
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: List of challenge posts
 */
challengeRouter.get("/posts", ChallengeController.getChallengePosts);

/**
 * @swagger
 * /api/v1/challenges/members:
 *   post:
 *     summary: Add member to challenge
 *     tags: [Challenges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               challengeId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added successfully
 */
challengeRouter.post("/members", ChallengeController.addMemberToChallenge);

/**
 * @swagger
 * /api/v1/challenges/{id}:
 *   get:
 *     summary: Get challenge by ID
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challenge details
 *   patch:
 *     summary: Update challenge
 *     tags: [Challenges]
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
 *               challenge:
 *                 type: string
 *               days:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Challenge updated successfully
 *   delete:
 *     summary: Delete challenge
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challenge deleted successfully
 */
challengeRouter.get("/:id", ChallengeController.getChallengeById);
challengeRouter.patch("/:id", ChallengeController.updateChallenge);
challengeRouter.delete("/:id", ChallengeController.deleteChallenge);

/**
 * @swagger
 * /api/v1/challenges/{id}/members:
 *   get:
 *     summary: Get challenge members
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of challenge members
 */
challengeRouter.get("/:id/members", ChallengeController.getChallengeMembers);

/**
 * @swagger
 * /api/v1/challenges/{id}/members/{memberId}:
 *   delete:
 *     summary: Remove member from challenge
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 */
challengeRouter.delete(
  "/:id/members/:memberId",
  ChallengeController.removeMember
);

/**
 * @swagger
 * /api/v1/challenges/{id}/{userId}:
 *   get:
 *     summary: Get user challenge posts
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user challenge posts
 */
challengeRouter.get("/:id/:userId", ChallengeController.getUserChallengePosts);

export default challengeRouter;
