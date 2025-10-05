import express from "express";
import UserService from "../../../services/account/user.service";
import { ApiError, ApiSuccess, logger } from "../../../utils";
import prisma from "../../../config/prismadb";
import PostService from "../../../services/social-feed/post.service";
import { getPresignedUrls } from "../../../libs/aws";
import { Post, User } from "../../../generated/prisma";
import { skip } from "@prisma/client/runtime/library";
import {
  createPostType,
  createPostValidation,
  repostType,
  repostValidation,
  updatePostType,
  updatePostValidation,
} from "../../../validations/post.validation";

const postService = new PostService();
const userService = new UserService();

class PostController {
  static async createPost(req: express.Request, res: express.Response) {
    if (!req.body) {
      logger.error("Missing request body");
      return res
        .status(400)
        .json(new ApiError(400, "Missing request body", []));
    }
    const validate = createPostValidation.parse(req.body);
    const { post, tags, userId, challengeId }: createPostType = validate;

    const files = req.files as Express.Multer.File[];
    logger.info(files?.map((file) => file.originalname));

    let presignedUrls: string[] = [];

    if (files && files.length > 0) {
      presignedUrls = await getPresignedUrls(files);
    }
    /*  for (const file of files) {
      const urls = await getPresignedUrl(file);
      presignedUrls.push(urls as string);
    } */

    const data: any = {
      post,
      files: presignedUrls,
      tags: tags || [],
      user: {
        connect: {
          clerkId: userId,
        },
      },
    };

    // only connect challenge if provided
    if (challengeId) {
      data.challenge = {
        connect: {
          id: challengeId,
        },
      };
    }

    try {
      const create_post = await postService.createPost(data);

      logger.info(create_post);
      return res
        .status(201)
        .json(new ApiSuccess(201, "Post created successfully!", create_post));
    } catch (error) {
      logger.error(error);

      return res
        .status(500)
        .json(new ApiError(500, "Something went wrong!", [error]));
    }
  }

  static async getPosts(req: express.Request, res: express.Response) {
    try {
      const params = req.query;
      const { orderBy, take, skip, filter } = params;

      const posts = await postService.getPosts({
        filter: filter,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy,
      });
      logger.info(posts);
      res
        .status(200)
        .json(new ApiSuccess(200, "Posts fetched successfully!,", posts));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getUsersPosts(req: express.Request, res: express.Response) {
    try {
      const params = req.query;
      const { orderBy, take, skip, filter } = params;
      const clerkId = req.params.id;
      /*const user = await prisma?.user.findUnique({
        where: {
          clerkId: clerkId,
        },
      });*/
      const user = (await userService.getUser(clerkId)) as User;
      logger.info(user?.clerkId);

      const posts = await postService.getUserPosts(user?.id, {
        filter: filter,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy,
      });

      /* const posts = await prisma.post.findMany({
        where: {
          userId: user?.id,
        },
      });*/
      logger.info(posts);
      res
        .status(200)
        .json(new ApiSuccess(200, "Posts fetched successfully!,", posts));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getPostById(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      if (!id) return;
      const post = await postService.getPostById(id);
      logger.info(post);
      res
        .status(200)
        .json(new ApiSuccess(200, "Post fetched successfully!,", post));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async updatePost(req: express.Request, res: express.Response) {
    const id = req.params.id;
    const validate = updatePostValidation.parse(req.body);
    const { post, tags }: updatePostType = validate;
    try {
      const update = await postService.updatePost(
        {
          post,
          tags: tags || [],
        },
        id
      );
      logger.info(update);
      res
        .status(200)
        .json(new ApiSuccess(201, "Post updated successfully!,", update));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getTagsPosts(req: express.Request, res: express.Response) {
    try {
      const tagPosts = await postService.getAllTags();
      const sortedTagPosts = Object.entries(tagPosts as any[]) // [[tag, posts[]], ...]
        .sort((a, b) => b[1].length - a[1].length); // sort by number of posts

      Object.entries(tagPosts as any).map(([tags, posts]) => {
        logger.info(tags);
        const postLength = (posts as Post[]).length;
        logger.info(`${postLength} posts is in #${tags}`);
        (posts as Post[]).forEach((post) => {
          //logger.info(`Post: ${post.post}`);
        });
      });
      //logger.info(tagPosts);
      res
        .status(200)
        .json(
          new ApiSuccess(
            200,
            "Tags and content gotten successfully!,",
            tagPosts
          )
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async deletePost(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      await postService.deletePost(id);
      res.status(200).json(new ApiSuccess(200, "Post deleted!", ""));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async repost(req: express.Request, res: express.Response) {
    try {
      const validate = repostValidation.parse(req.body);
      const { postId, post, clerkId }: repostType = validate;
      const repost = await postService.repost({
        repostOf: {
          connect: {
            id: postId,
          },
        },
        post,
        user: {
          connect: {
            clerkId: clerkId,
          },
        },
      });
      res
        .status(200)
        .json(new ApiSuccess(201, "You have repost this post!", repost));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async userPostCreatedToday(
    req: express.Request,
    res: express.Response
  ) {
    try {
      const clerkId = req.params.id;
      const user = (await userService.getUser(clerkId)) as User;
      const posts = await postService.getPostsCreatedTodayByUser(user.id);
      logger.info(posts);
      res
        .status(200)
        .json(
          new ApiSuccess(
            200,
            `User Posts created today gotten ${posts.length}`,
            posts
          )
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async AllPostCreatedToday(
    req: express.Request,
    res: express.Response
  ) {
    try {
      const posts = await postService.getPostsCreatedToday();
      logger.info(posts);
      res
        .status(200)
        .json(
          new ApiSuccess(
            200,
            `All Posts created today gotten ${posts.length}`,
            posts
          )
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async trackViewsMetric(req: express.Request, res: express.Response) {
    try {
      const postId = req.params.id;
      const views = await postService.trackViewsMetric(postId);
      logger.info(views);
      res
        .status(201)
        .json(new ApiSuccess(201, `This post has been viewed`, views));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }
}

export default PostController;
