import express from "express";
import LikeController from "../../features/social-feed/controller/like.controller";

const likeRouter = express.Router();

likeRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Likes API v1");
});

likeRouter.post("/", LikeController.createLike);
likeRouter.get("/:id", LikeController.getLike);
likeRouter.delete("/:id", LikeController.deleteLikes);
likeRouter.get("/post/:id", LikeController.getLikes);

export default likeRouter;
