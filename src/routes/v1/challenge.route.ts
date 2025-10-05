import express from "express";
import ChallengeController from "../../features/social-feed/controller/challenge.controller";

const challengeRouter = express.Router();

challengeRouter.get(
  "/welcome",
  (req: express.Request, res: express.Response) => {
    res.send("Welcome to Challenges API v1");
  }
);

challengeRouter.post("/", ChallengeController.createChallenge);
challengeRouter.get("/", ChallengeController.getChallenges);
challengeRouter.post("/members", ChallengeController.addMemberToChallenge);
challengeRouter.get("/:id", ChallengeController.getChallengeById);
challengeRouter.patch("/:id", ChallengeController.updateChallenge);
challengeRouter.delete("/:id", ChallengeController.deleteChallenge);
challengeRouter.get("/:id/members", ChallengeController.getChallengeMembers);
challengeRouter.delete(
  "/:id/members/:memberId",
  ChallengeController.removeMember
);
challengeRouter.get("/:id/:userId", ChallengeController.getUserChallengePosts);

export default challengeRouter;
