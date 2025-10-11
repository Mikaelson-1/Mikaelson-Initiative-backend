import { Like, User } from "../../generated/prisma";
import { Repository } from "../../repository/base/repository";
import { logger } from "../../utils";
import prisma from "../../config/prismadb";
import RedisService from "../redis.service";
import NotificationService from "../notification.service";

const likeRepository = new Repository<Like>(prisma.like);
const redisService = new RedisService();
const notificationService = new NotificationService();

export default class LikeService {
  // Like a post/comment
  async createLike(
    data: any,
    targetId: string,
    clerkId: string,
    likeWhat: "post" | "comment"
  ) {
    const hasUserLiked = await likeRepository.findFirst(
      targetId,
      clerkId,
      "like",
      likeWhat
    );
    if (hasUserLiked) {
      logger.info(`You have already liked this ${likeWhat}!`);
    } else {
      logger.info("Liking post...");
      await redisService.del(`Likes:${targetId}`);
      const like = await likeRepository.create(data);

      if (like?.id) {
        await notificationService.createNotification("like", like);
        return like;
      }
    }
  }

  // Get post/comment likes
  async getLikes<T>(id: string | number): Promise<T | null> {
    try {
      const cachedKey = `Likes:${id}`;
      const cachedLikes = await redisService.get(cachedKey);
      if (cachedLikes) {
        return cachedLikes as T;
      }

      const like = await likeRepository.findAll("like", id);
      await redisService.set(cachedKey, like, 600);
      return like as T;
    } catch (error) {
      logger.error("Something went wrong with fetch likes!", error as any);
      return {} as T;
    }
  }

  async getLikeById<T>(id: string | number): Promise<T | null> {
    try {
      const cachedKey = `Like:${id}`;
      const cachedLike = await redisService.get(cachedKey);
      if (cachedLike) {
        return cachedLike as T;
      }

      const like = await likeRepository.findById(id, "like");
      await redisService.set(cachedKey, like, 600);
      return like as T;
    } catch (error) {
      logger.error("Something went wrong with fetch likes!", error as any);
      return {} as T;
    }
  }

  // Unlike
  async deleteLike(id: string | number) {
    if (!id) throw new Error("Id is required!");
    await redisService.del(`Like:${id}`);
    return likeRepository.delete(id);
  }
}
