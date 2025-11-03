import express from "express";
import PostController from "../../features/social-feed/controller/post.controller";
import multer from "multer";

const postRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

postRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Posts API v1");
});
postRouter.post("/", upload.array("files"), PostController.createPost);
postRouter.get("/", PostController.getPosts);
postRouter.get("/today", PostController.AllPostCreatedToday);
postRouter.get("/tags", PostController.getTagsPosts);
postRouter.post("/repost", upload.array("files"), PostController.repost);
postRouter.get("/:id", PostController.getPostById);
postRouter.patch("/:id", PostController.updatePost);
postRouter.delete("/:id", PostController.deletePost);
postRouter.get("/user/:id", PostController.getUsersPosts);
postRouter.get("/following/:id", PostController.getFollowingPosts);
postRouter.get("/user/:id/today", PostController.userPostCreatedToday);
postRouter.patch("/:id/views", PostController.trackViewsMetric);

export default postRouter;
