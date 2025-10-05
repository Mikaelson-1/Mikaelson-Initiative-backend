import express from "express";
import BookmarkController from "../../features/social-feed/controller/bookmark.controller";

const bookmarkRouter = express.Router();

bookmarkRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Bookmarks API v1");
});

bookmarkRouter.post("/", BookmarkController.createBookmark);
bookmarkRouter.get("/user/:id", BookmarkController.getBookmarks);
bookmarkRouter.get("/:id", BookmarkController.getBookmarkById);
bookmarkRouter.delete("/:id", BookmarkController.deleteBookmark);

export default bookmarkRouter;
