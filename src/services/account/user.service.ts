import { Follower, User } from "../../generated/prisma";
import { Repository } from "../../repository/base/repository";
import { logger } from "../../utils";
import RedisService from "./../redis.service";
import prisma from "../../config/prismadb";
import crypto from "crypto";

const userRepository = new Repository<User>(prisma.user);
const followRepository = new Repository<Follower>(prisma.follower);
const redisService = new RedisService();

// Create user and connect the clerkId from the frontend
export default class UserService {
  async createUser(data: any) {
    try {
      if (!data.email && !data.username && !data.clerkId) return null;
      await redisService.del(`Users`);
      return userRepository.create(data);
    } catch (error) {
      logger.info("Something went wrong with creating user" + error);
    }
  }

  // Get a user
  async getUser<T>(id: string | number): Promise<T | User | null> {
    try {
      if (!id) return null;
      const cachedKey = `User:${id}`;
      const cachedUser = await redisService.get(cachedKey);
      if (cachedUser) {
        return cachedUser as User | T;
      } else {
        const user = await userRepository.findById(id, "user");
        if (user) {
          await redisService.set(cachedKey, user, 600);
        }
        return user as User;
      }
    } catch (error) {
      logger.info("Something went wrong with getting user" + error);
      return null;
    }
  }

  // Get all users
  async getAllUsers<T>(params?: {
    filter?: any;
    skip?: any;
    take?: number;
    orderBy?: any;
  }): Promise<T | null | User[]> {
    try {
      const paramString = JSON.stringify(params || {});
      const key = crypto.createHash("md5").update(paramString).digest("hex");

      const cachedKey = `Users:${key}`;
      const cachedUsers = await redisService.get(cachedKey);
      if (cachedUsers) {
        return cachedUsers as User[] | T;
      } else {
        const users = await userRepository.findAll(
          "user",
          undefined,
          undefined,
          params
        );
        if (users) {
          await redisService.set(cachedKey, users, 600);
        }
        return users as User[] | T;
      }
    } catch (error) {
      logger.info("Something went wrong with getting users" + error);
      return [] as T;
    }
  }

  // Get all top user with the most posts
  async getTopContributors<T>(): Promise<T | null | User[]> {
    try {
      const users = await userRepository.findAll("topContributors");
      return users as User[] | T;
    } catch (error) {
      logger.info("Something went wrong with getting top contributors" + error);
      return [] as T;
    }
  }

  // Update User
  async updateUser<T>(data: any, id: string | number): Promise<T | null> {
    try {
      if (!id) throw new Error("Id is required!");
      await redisService.del(`User:${id}`);
      return userRepository.update(id, data, "user") as T;
    } catch (error) {
      logger.info("Something went wrong with updating user" + error);
      return null;
    }
  }

  // Delete User
  async deleteUser(id: string | number) {
    try {
      if (!id) throw new Error("Id is required!");
      await redisService.del(`User:${id}`);
      return userRepository.delete(id);
    } catch (error) {
      logger.info("Something went wrong with deleting user" + error);
      return null;
    }
  }

  // Follow a User
  async followUser(data: any, userId: string, clerkId: string) {
    try {
      const hasUserFollowed = await userRepository.findFirst(
        userId,
        clerkId,
        "follow"
      );
      if (hasUserFollowed) {
        logger.info("You are already following this user");
      } else {
        return followRepository.create(data);
      }
    } catch (error) {
      logger.info("Something went wrong with following user" + error);
      return null;
    }
  }

  // Get all user followers
  async getFollowers<T>(clerkId: string): Promise<T[] | null> {
    try {
      const cachedKey = `Followers:${clerkId}`;
      const cachedFollowers = await redisService.get(cachedKey);
      if (cachedFollowers) {
        return cachedFollowers as T[];
      }
      const followers = await userRepository.findAll("followers", clerkId);
      if (followers) {
        await redisService.set(cachedKey, followers, 600);
      }
      return followers as T[];
    } catch (error) {
      logger.info("Something went wrong with getting user followers" + error);
      return [];
    }
  }

  // Get all users following a user
  async getFollowing<T>(clerkId: string): Promise<T[] | null> {
    try {
      const cachedKey = `Following:${clerkId}`;
      const cachedFollowings = await redisService.get(cachedKey);
      if (cachedFollowings) {
        return cachedFollowings as T[];
      }
      const followings = await userRepository.findAll("following", clerkId);
      if (followings) {
        await redisService.set(cachedKey, followings, 600);
      }
      return followings as T[];
    } catch (error) {
      logger.info("Something went wrong with getting user followings" + error);
      return [];
    }
  }

  // Get all a particular user likes
  async getAllUserLikes<T>(clerkId: string): Promise<T[] | null> {
    try {
      const cachedKey = `UserLikes:${clerkId}`;
      const cachedLikes = await redisService.get(cachedKey);
      if (cachedLikes) {
        return cachedLikes as T[];
      }
      const likes = await userRepository.findAll("userLikes", clerkId);
      if (likes) {
        await redisService.set(cachedKey, likes, 600);
      }
      return likes as T[];
    } catch (error) {
      logger.info("Something went wrong with getting user likes" + error);
      return [];
    }
  }
}
