import { Challenge, Members, Post, User } from "../../generated/prisma";
import { Repository } from "../../repository/base/repository";
import prisma from "../../config/prismadb";
import RedisService from "../redis.service";
import { logger } from "../../utils";
import crypto from "crypto";
import { countUniquePostDays } from "../../utils/date";
import NotificationService from "../notification.service";
import { notificationQueue } from "../../queues/notification.queue";

type UserChallengePostsResult = {
  posts: Post[];
  percentageOfPosts: number;
};

// A challenge is created and users can create post inside a challenge
const challengeRepository = new Repository<
  Challenge & {
    Members: (Members & { user: User })[];
  }
>(prisma.challenge);
const postRepository = new Repository<Post>(prisma.post);

const memberRepository = new Repository<Members>(prisma.members);
const redisService = new RedisService();
const notificationService = new NotificationService();

export default class ChallengeService {
  // Create a challenge group
  async createChallenge(data: any) {
    if (!data.challenge && !data.clerkId) return null;
    await redisService.del(`Challenge`);
    return challengeRepository.create(data);
  }

  // Get all challenge groups
  async getChallenge<T>(params?: {
    filter?: any;
    skip?: any;
    take?: number;
    orderBy?: any;
  }): Promise<T | null> {
    const paramString = JSON.stringify(params || {});
    const key = crypto.createHash("md5").update(paramString).digest("hex");
    const cachedKey = `Challenge:${key}`;
    const cachedChallenge = await redisService.get(cachedKey);
    if (cachedChallenge) {
      return cachedChallenge as T;
    } else {
      const challenges = await challengeRepository.findAll(
        "challenge",
        undefined,
        undefined,
        params
      );
      await redisService.set(cachedKey, challenges, 600);
      return challenges as T;
    }
  }

  // Get a challenge group
  async getChallengeById<T>(id: string | number): Promise<T | null> {
    if (!id) return null;
    const cachedKey = `Challenge:${id}`;
    const cachedChallenge = await redisService.get(cachedKey);
    if (cachedChallenge) {
      return cachedChallenge as T;
    } else {
      const challenge = await challengeRepository.findById(id, "challenge");
      await redisService.set(cachedKey, challenge, 600);
      return challenge as T;
    }
  }

  // Get all user posts created inside a challenge and percentage of days posted
  async getUserChallengePosts<T>(
    clerkId: string,
    challengeId: string | number
  ): Promise<UserChallengePostsResult | null> {
    const cacheKey = `userChallengePost:${clerkId}:${challengeId}`;
    const cachedPostsRaw = await redisService.get(cacheKey);

    if (cachedPostsRaw) {
      const cachedPosts = cachedPostsRaw as Post[];

      const challenge = await challengeRepository.findById(
        challengeId,
        "challenge"
      );

      const numOfDaysPosted = countUniquePostDays(cachedPosts);
      //const numOfPosts = cachedPosts.length;
      const numOfChallengeDays = challenge?.days ?? 0;
      const percentageOfPosts =
        numOfChallengeDays > 0
          ? (numOfDaysPosted / numOfChallengeDays) * 100
          : 0;

      return { posts: cachedPosts, percentageOfPosts };
    } else {
      const posts = await postRepository.findAll(
        "userChallengePosts",
        clerkId,
        challengeId
      );
      await redisService.set(cacheKey, posts, 600);

      const challenge = await challengeRepository.findById(
        challengeId,
        "challenge"
      );

      const numOfDaysPosted = countUniquePostDays(posts);
      //const numOfPosts = posts.length;
      const numOfChallengeDays = challenge?.days ?? 0;
      const percentageOfPosts =
        numOfChallengeDays > 0
          ? (numOfDaysPosted / numOfChallengeDays) * 100
          : 0;

      if (percentageOfPosts === 100) {
        const sendUserNotification = await notificationQueue.add(
          "sendNotification",
          {
            type: "challengeCompleted",
            data: challenge,
            data2: posts,
            type2: "sendNotificationToUser",
          }
        );
        const sendChallengeCreatorNotification = await notificationQueue.add(
          "sendNotification",
          {
            type: "challengeCompleted",
            data: challenge,
            data2: posts,
            type2: "sendNotificationToChallengeCreator",
          }
        );
      }

      return { posts, percentageOfPosts };
    }
  }

  // Update Challenge
  async updateChallenge<T>(data: any, id: string | number): Promise<T | null> {
    if (!id) throw new Error("Id is required!");
    return challengeRepository.update(id, data) as T;
  }

  // Delete Challenge group
  async deleteChallenge(id: string | number) {
    if (!id) throw new Error("Id is required!");
    return challengeRepository.delete(id);
  }

  // Join challenge group as a member
  async addMemberToChallenge(data: any, clerkId: string, challengeId: string) {
    const isMemberInChallenge = await memberRepository.findFirst(
      challengeId,
      clerkId,
      "challengeMember"
    );
    if (isMemberInChallenge) {
      logger.info("You are already a member in this challenge");
    } else {
      await redisService.del(`Challenge`);
      const member = await memberRepository.create(data);
      if (member.id) {
        await notificationQueue.add("sendNotification", {
          type: "member",
          data: member,
        });
        return member;
      }
    }
  }

  // Get all members in a challenge group
  async getMembersInChallenge<T>(challengeId: string): Promise<T | null> {
    const cachedKey = `Members:${challengeId}`;
    const cachedChallengeMembers = await redisService.get(cachedKey);
    if (cachedChallengeMembers) {
      return cachedChallengeMembers as T;
    } else {
      const user = await memberRepository.findAll(
        "challengeMembers",
        challengeId
      );
      await redisService.set(cachedKey, user, 600);
      return user as T;
    }
  }

  // Remove member from a challenge group or leave a challange group
  async removeMemberInChallege(memberId: string) {
    if (!memberId) return;
    await memberRepository.delete(memberId);
  }

  // Get all Challenges you have joined
  async getChallangesYouAreIncludedAsMember<T>(
    clerkId: string
  ): Promise<T[] | null> {
    try {
      const challenges = await challengeRepository.findAll("challenge");
      const challangeYouAreIncludedAsMember = challenges.filter((challange) =>
        challange.Members.some((member) => member.user.clerkId === clerkId)
      );
      return challangeYouAreIncludedAsMember as T[];
    } catch (error) {
      logger.error(
        "Something went wrong with fetching challenges you are a member of!" +
          error
      );
      return [];
    }
  }
}
