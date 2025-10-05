import { Post, User } from "../../generated/prisma";
import { Repository } from "../../repository/base/repository";
import { logger } from "../../utils";
import RedisService from "./../redis.service";
import prisma from "../../config/prismadb";
import crypto from "crypto";

const commentRepository = new Repository<Comment>(prisma.comment);
const redisService = new RedisService();

export default class CommentService {
  // Create Comment
  async createComment(data: any) {
    await redisService.del("Comments");
    return commentRepository.create(data as any);
  }

  // Get all comments
  async getComments<T>(
    id: string | number,
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      orderBy?: any;
    }
  ): Promise<T | null> {
    try {
      const paramString = JSON.stringify(params || {});
      const key = crypto.createHash("md5").update(paramString).digest("hex");
      const cachedKey = `Comments:${key}`;
      const cachedComments = await redisService.get(cachedKey);
      if (cachedComments) {
        logger.info(`Cached Posts:${cachedComments}`);
        return cachedComments as T;
      } else {
        const comments = await commentRepository.findAll(
          "comment",
          id,
          undefined,
          params
        );
        await redisService.set(cachedKey, comments, 600);
        return comments as T;
      }
    } catch (error) {
      logger.error("Something went wrong with fetching comments!");
      return [] as T;
    }
  }

  // Get a comment
  async getCommentById<T>(id: string | number): Promise<T | null> {
    try {
      if (!id) return null;
      logger.info(`Comment id: ${id}`);
      const cachedKey = `Comment:${id}`;
      const cachedComment = await redisService.get(cachedKey);
      if (cachedComment) {
        return cachedComment as T;
      } else {
        const comment = await commentRepository.findById(id, "comment");
        await redisService.set(cachedKey, comment, 600);
        return comment as T;
      }
    } catch (error) {
      logger.error("Something went wrong with fetching comment!");
      return [] as T;
    }
  }

  // Update comment
  async updateComment<T>(data: any, id: string | number): Promise<T | null> {
    if (!id) throw new Error("Id is required!");
    await redisService.del(`Comment:${id}`);
    return commentRepository.update(id, data) as T;
  }

  // Delete Comment
  async deleteComment(id: string | number) {
    await redisService.del("Comments");
    await commentRepository.delete(id);
  }
}
