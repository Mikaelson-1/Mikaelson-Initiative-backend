import { Post, User } from "../../generated/prisma";
import { Repository } from "../../repository/base/repository";
import { logger } from "../../utils";
import RedisService from "../redis.service";
import prisma from "../../config/prismadb";

const bookmarkRepository = new Repository<Post>(prisma.bookmark);
const redisService = new RedisService();

export default class BookmarkService {
  // Bookmark post
  async addBookmark(data: any, targetId: string, clerkId: string) {
    if (!data) {
      logger.error("data is required!");
    }
    const hasUserBookmark = await bookmarkRepository.findFirst(
      targetId,
      clerkId,
      "bookmark"
    );
    if (!hasUserBookmark) {
      await redisService.del("Bookmarks");
      return bookmarkRepository.create(data as any);
    } else {
      logger.info("You have bookmarked this post already");
    }
  }

  // Get all user bookmarks
  async getBookmark<T>(userId: string): Promise<T | null> {
    try {
      const cachedKey = "Bookmarks";
      const cachedBookmarks = await redisService.get(cachedKey);
      if (cachedBookmarks) {
        logger.info(`Cached Posts:${cachedBookmarks}`);
        return cachedBookmarks as T;
      } else {
        logger.info(userId);
        const bookmark = await bookmarkRepository.findAll("bookmark", userId);
        await redisService.set(cachedKey, bookmark, 600);
        return bookmark as T;
      }
    } catch (error) {
      logger.error("Something went wrong with fetch bookmark!");
      return [] as T;
    }
  }

  // Get a bookmarked post
  async getBookmarkById<T>(id: string | number): Promise<T | null> {
    try {
      const cachedKey = `Bookmarks:${id}`;
      const cachedBookmarks = await redisService.get(cachedKey);
      if (cachedBookmarks) {
        logger.info(`Cached Posts:${cachedBookmarks}`);
        return cachedBookmarks as T;
      } else {
        const bookmark = await bookmarkRepository.findById(id, "bookmark");
        await redisService.set(cachedKey, bookmark, 600);
        return bookmark as T;
      }
    } catch (error) {
      logger.error("Something went wrong with fetch bookmark!");
      return [] as T;
    }
  }

  // Delete bookmark
  async deleteBookmark(id: string | number) {
    await bookmarkRepository.delete(id);
  }
}
