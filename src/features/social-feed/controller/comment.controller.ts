import express from "express";
import UserService from "../../../services/account/user.service";
import { ApiError, ApiSuccess, logger } from "../../../utils";
import prisma from "../../../config/prismadb";
import PostService from "../../../services/social-feed/post.service";
import { getPresignedUrls } from "../../../libs/aws";
import { Post, User } from "../../../generated/prisma";
import CommentService from "../../../services/social-feed/comment.service";
import {
  createCommentType,
  createCommentValidation,
  updatecommentType,
  updateCommentValidation,
} from "../../../validations/comment.validation";

const commentService = new CommentService();

class CommentController {
  static async createComment(req: express.Request, res: express.Response) {
    if (!req.body) {
      logger.error("Missing request body");
      return res
        .status(400)
        .json(new ApiError(400, "Missing request body", []));
    }
    const validate = createCommentValidation.parse(req.body);
    const { comment, postId, userId }: createCommentType = validate;
    const files = req.files as Express.Multer.File[];
    logger.info(files?.map((file) => file.originalname));

    let presignedUrls: string[] = [];

    if (files && files.length > 0) {
      presignedUrls = await getPresignedUrls(files);
    }

    const data: any = {
      comment,
      files: presignedUrls,
      user: {
        connect: {
          clerkId: userId,
        },
      },
      post: {
        connect: {
          id: postId,
        },
      },
    };

    try {
      const create_comment = await commentService.createComment(data);

      logger.info(create_comment);
      return res
        .status(201)
        .json(
          new ApiSuccess(201, "Comment created successfully!", create_comment)
        );
    } catch (error) {
      logger.error(error);

      return res
        .status(500)
        .json(new ApiError(500, "Something went wrong!", [error]));
    }
  }

  static async getComments(req: express.Request, res: express.Response) {
    try {
      const params = req.query;
      const { orderBy, take, skip, filter } = params;
      const id = req.params.id;
      const comments = await commentService.getComments(id, {
        filter: filter,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy,
      });
      logger.info(comments);
      res
        .status(200)
        .json(new ApiSuccess(200, "Comments fetched successfully!,", comments));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getCommentById(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      if (!id) return;
      const comment = await commentService.getCommentById(id);
      /*const comment = await prisma.comment.findUnique({
        where: {
          id: id,
        },
      });*/
      logger.info(comment);
      res
        .status(200)
        .json(new ApiSuccess(200, "Comment fetched successfully!,", comment));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async updateComment(req: express.Request, res: express.Response) {
    const id = req.params.id;
    const validate = updateCommentValidation.parse(req.body);
    const { comment }: updatecommentType = validate;
    try {
      const update = await commentService.updateComment(
        {
          comment,
        },
        id
      );
      logger.info(update);
      res
        .status(200)
        .json(new ApiSuccess(201, "Comment updated successfully!,", update));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async deleteComment(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      await commentService.deleteComment(id);
      res.status(200).json(new ApiSuccess(200, "Comment deleted!", ""));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }
}

export default CommentController;
