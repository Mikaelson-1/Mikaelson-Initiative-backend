import { Post, User } from "../../generated/prisma";
import { Repository } from "../../repository/base/repository";
import { getItemsCreatedToday, logger } from "../../utils";
import RedisService from "./../redis.service";
import prisma from "../../config/prismadb";
import crypto from "crypto";

const postRepository = new Repository<Post>(prisma.post);
const redisService = new RedisService();

export default class PostService {
  // Create Post, you can create a post inside a challenge (optional)
  async createPost(data: any) {
    if (!data.post) {
      logger.error("Post is required!");
    }
    await redisService.del("Posts");
    return postRepository.create(data as any);
  }

  // Get all posts
  async getPosts<T>(params?: {
    filter?: any;
    skip?: any;
    take?: number;
    orderBy?: any;
  }): Promise<T | null> {
    try {
      const paramString = JSON.stringify(params || {});
      const key = crypto.createHash("md5").update(paramString).digest("hex");
      const cachedKey = `Posts:${key}`;
      const cachedPosts = await redisService.get(cachedKey);
      if (cachedPosts) {
        logger.info(`Cached Posts:${cachedPosts}`);
        return cachedPosts as T;
      } else {
        const posts = await postRepository.findAll(
          "post",
          undefined,
          undefined,
          params
        );
        await redisService.set(cachedKey, posts, 600);
        return posts as T;
      }
    } catch (error) {
      logger.error("Something went wrong with fetch posts!");
      return [] as T;
    }
  }

  // Get all post a user has created
  async getUserPosts<T>(
    userId?: string | number,
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
      const cachedKey = `Posts:${userId}:${key}`;
      const cachedPosts = await redisService.get(cachedKey);
      logger.info(userId);
      if (cachedPosts) {
        logger.info(`Cached Posts:${cachedPosts}`);
        return cachedPosts as T;
      }

      const posts = await postRepository.findAll(
        "userPosts",
        userId,
        undefined,
        params
      );
      logger.info(posts);
      await redisService.set(cachedKey, posts, 600);
      return posts as T;
    } catch (error) {
      logger.error("Something went wrong with fetch posts!");
      return [] as T;
    }
  }

  // Get a Post
  async getPostById<T>(id: string | number): Promise<T | null> {
    try {
      if (!id) return null;
      const cachedKey = `Post:${id}`;
      const cachedPost = await redisService.get(cachedKey);
      if (cachedPost) {
        return cachedPost as T;
      } else {
        const post = await postRepository.findById(id, "post");
        await redisService.set(cachedKey, post, 600);
        return post as T;
      }
    } catch (error) {
      logger.error("Something went wrong with fetch posts!");
      return [] as T;
    }
  }

  // Update Post
  async updatePost<T>(data: any, id: string | number): Promise<T | null> {
    if (!id) throw new Error("Id is required!");
    return postRepository.update(id, data) as T;
  }

  // Get all tags and the posts under them
  async getAllTags<T>(): Promise<T | null> {
    try {
      const cachedKey = "Tags";
      const cachedTags = await redisService.get(cachedKey);
      //if data is cached in redis, fetch from redis
      if (cachedTags) {
        const posts = cachedTags as Post[] | T[];
        // collect tags and group posts
        const tagsMap: Record<string, Post[]> = {};

        // Get each tags and the post made with each tags
        posts.forEach((post: Post | any) => {
          if (Array.isArray(post.tags)) {
            post.tags.forEach((posttag: any) => {
              const tag = posttag.trim();
              if (!tagsMap[tag]) {
                tagsMap[tag] = [];
              }
              tagsMap[tag].push(post);
            });
          }
        });

        return tagsMap as T;
      }
      const posts = await postRepository.findAll("post");

      // collect tags and group posts
      const tagsMap: Record<string, Post[]> = {};

      posts.forEach((post: Post | any) => {
        if (Array.isArray(post.tags)) {
          post.tags.forEach((posttag: any) => {
            const tag = posttag.trim();
            if (!tagsMap[tag]) {
              tagsMap[tag] = [];
            }
            tagsMap[tag].push(post);
          });
        }
      });

      return tagsMap as T;
    } catch (error) {
      logger.error("Something went wrong with fetch posts!", error as any);
      return {} as T;
    }
  }

  // Delete a Post
  async deletePost(id: string | number) {
    await postRepository.delete(id);
  }

  // Repost a particular post
  async repost(data: any) {
    if (!data) return;
    await redisService.del("Posts");
    return postRepository.create(data);
  }

  // Get all posts created today by a user
  async getPostsCreatedTodayByUser(clerkId: string): Promise<any[]> {
    const cacheKey = "UserTodayPosts";
    const cachedTodayPosts = await redisService.get(cacheKey);
    if (cachedTodayPosts) {
      return cachedTodayPosts as any;
    }
    const posts = await postRepository.findAll("userTodayPosts", clerkId);
    await redisService.set(cacheKey, posts, 600);
    return posts;
  }

  // Get all posts created today
  async getPostsCreatedToday<T>(): Promise<any> {
    try {
      const cachedKey = "TodayPosts";
      const cachedPosts = await redisService.get(cachedKey);
      if (cachedPosts) {
        return cachedPosts;
      } else {
        const posts = await postRepository.findAll("TodayPost");
        await redisService.set(cachedKey, posts, 600);
        return posts as T;
      }
    } catch (error) {
      logger.error("Something went wrong with fetch posts created today!");
      return [] as T;
    }
  }

  // Track the views of a post
  async trackViewsMetric<T>(postId: string): Promise<T | null> {
    try {
      const views = await postRepository.update(postId, undefined, "views");
      return views as T;
    } catch (error) {
      logger.info("Something went wrong with getting user followings" + error);
      return [] as T;
    }
  }
}
