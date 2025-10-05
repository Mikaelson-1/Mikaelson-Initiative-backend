import express from "express";
import UserService from "../../../services/account/user.service";
import { ApiError, ApiSuccess, logger } from "../../../utils";
import prisma from "../../../config/prismadb";
import LikeService from "../../../services/social-feed/like.service";
import { Like } from "../../../generated/prisma";
import {
  createLikeType,
  createLikeValidation,
} from "../../../validations/like.validation";

const likeService = new LikeService();

class LikeController {
  static async createLike(req: express.Request, res: express.Response) {
    if (!req.body) {
      logger.error("Missing request body");
      return res
        .status(400)
        .json(new ApiError(400, "Missing request body", []));
    }

    const validate = createLikeValidation.parse(req.body);
    const { postId, clerkId, commentId }: createLikeType = validate;

    try {
      let targetId: string;
      let likeWhat: "post" | "comment";

      if (postId) {
        targetId = postId;
        likeWhat = "post";
      } else if (commentId) {
        targetId = commentId;
        likeWhat = "comment";
      } else {
        return res
          .status(400)
          .json(new ApiError(400, "Missing postId or commentId", []));
      }

      // connect user
      const data: any = {
        user: { connect: { clerkId } },
      };

      if (likeWhat === "post") {
        data.post = { connect: { id: postId } };
      } else {
        data.comment = { connect: { id: commentId } };
      }

      const like = await likeService.createLike(
        data,
        targetId,
        clerkId,
        likeWhat
      );

      logger.info(like);
      if (like?.id) {
        res
          .status(201)
          .json(new ApiSuccess(201, `${likeWhat} liked successfully!`, like));
      } else {
        res
          .status(200)
          .json(
            new ApiSuccess(
              200,
              `${likeWhat} already liked!`,
              `You have already liked this ${likeWhat}!`
            )
          );
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json(new ApiError(500, "Something went wrong!", [error]));
    }
  }

  static async getLikes(req: express.Request, res: express.Response) {
    try {
      const postId = req.params.id;
      const likes = await likeService.getLikes(postId);
      logger.info(likes);
      res
        .status(200)
        .json(new ApiSuccess(200, "Likes fetched successfully!,", likes));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async deleteLikes(req: express.Request, res: express.Response) {
    try {
      const likeId = req.params.id;
      const likes = await likeService.deleteLike(likeId);
      logger.info(likes);
      res
        .status(200)
        .json(new ApiSuccess(200, "Likes deleted successfully!,", likes));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }
}

export default LikeController;
