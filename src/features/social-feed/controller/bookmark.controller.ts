import express from "express";
import UserService from "../../../services/account/user.service";
import { ApiError, ApiSuccess, logger } from "../../../utils";
import prisma from "../../../config/prismadb";
import PostService from "../../../services/social-feed/post.service";
import { getPresignedUrls } from "../../../libs/aws";
import { Post, User } from "../../../generated/prisma";
import BookmarkService from "../../../services/social-feed/bookmark.service";
import {
  createBookmarkType,
  createBookmarkValidation,
} from "../../../validations/bookmark.validation";

const bookmarkService = new BookmarkService();
const userService = new UserService();

class BookmarkController {
  static async createBookmark(req: express.Request, res: express.Response) {
    try {
      const validate = createBookmarkValidation.parse(req.body);
      const { postId, userId }: createBookmarkType = validate;
      const bookmark = await bookmarkService.addBookmark(
        {
          post: {
            connect: {
              id: postId,
            },
          },
          user: {
            connect: {
              clerkId: userId,
            },
          },
        },
        postId,
        userId
      );

      if (bookmark?.id) {
        return res
          .status(201)
          .json(new ApiSuccess(201, "Post Bookmark successfully!", bookmark));
      } else {
        return res
          .status(201)
          .json(
            new ApiSuccess(200, "You have already bookmarked this post", "")
          );
      }
    } catch (error) {
      logger.error(error);

      return res
        .status(500)
        .json(new ApiError(500, "Something went wrong!", [error]));
    }
  }

  static async getBookmarks(req: express.Request, res: express.Response) {
    try {
      const clerkId = req.params.id;
      const params = req.query;
      const { orderBy, take, skip, filter } = params;
      const user = (await userService.getUser(clerkId)) as User;
      logger.info(user?.id);

      const bookmarks = await bookmarkService.getBookmark(clerkId);

      return res
        .status(200)
        .json(new ApiSuccess(200, "Bookmarks gotten successfully!", bookmarks));
    } catch (error) {
      logger.error(error);

      return res
        .status(500)
        .json(new ApiError(500, "Something went wrong!", [error]));
    }
  }

  static async getBookmarkById(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;

      const bookmark = await bookmarkService.getBookmarkById(id);

      return res
        .status(200)
        .json(new ApiSuccess(200, "Bookmark gotten successfully!", bookmark));
    } catch (error) {
      logger.error(error);

      return res
        .status(500)
        .json(new ApiError(500, "Something went wrong!", [error]));
    }
  }

  static async deleteBookmark(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;

      await bookmarkService.deleteBookmark(id);

      return res
        .status(200)
        .json(new ApiSuccess(200, "Bookmark deleted successfully!", ""));
    } catch (error) {
      logger.error(error);

      return res
        .status(500)
        .json(new ApiError(500, "Something went wrong!", [error]));
    }
  }
}

export default BookmarkController;
