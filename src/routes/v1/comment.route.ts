import express from "express";
import multer from "multer";
import CommentController from "../../features/social-feed/controller/comment.controller";

const commentRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

commentRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Comments API v1");
});

commentRouter.post("/", upload.array("files"), CommentController.createComment);
commentRouter.get("/post/:id", CommentController.getComments);
commentRouter.get("/:id", CommentController.getCommentById);
commentRouter.patch("/:id", CommentController.updateComment);
commentRouter.delete("/:id", CommentController.deleteComment);

export default commentRouter;
