import express from "express";
import LikeController from "../../features/social-feed/controller/like.controller";

const likeRouter = express.Router();

likeRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Likes API v1");
});

likeRouter.post("/", LikeController.createLike);
likeRouter.get("/:id", LikeController.getLikes);
likeRouter.delete("/:id", LikeController.deleteLikes);

export default likeRouter;
