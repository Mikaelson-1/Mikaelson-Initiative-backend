import { Worker, Job } from "bullmq";
import redis from "../utils/redis";
import prisma from "../config/prismadb";
import logger from "../utils/logger";
import {
  Challenge,
  Comment,
  Follower,
  Habit,
  Like,
  Members,
  Post,
  Subscribe,
} from "../generated/prisma";
import { bullRedis } from "../utils/bullmq-redis";
import RedisService from "../services/redis.service";

interface NotificationJobData {
  type: string;
  data: any;
  data2?: any;
  type2?: string;
  time?: string;
}

const redisService = new RedisService();

/** Here is the notification worker that handles sending notifications to receivers */

export const notificationWorker = new Worker<NotificationJobData>(
  "notifications",
  async (job: Job<NotificationJobData>) => {
    const { type, data, data2, type2, time } = job.data;

    await Promise.all([
      redisService.delByPattern("Notifications:*"),
      redisService.delByPattern("Notification:*"),
    ]);

    // Notify when a post is liked
    switch (type) {
      case "like": {
        const likePayload = data as Like;
        logger.info("Id:" + likePayload.id);
        const Like = await prisma.like.findUnique({
          where: {
            id: likePayload.id,
          },
          include: {
            user: true,
            post: {
              include: {
                user: true,
              },
            },
            comment: {
              include: {
                user: true,
              },
            },
          },
        });

        const receiverId = Like?.postId
          ? Like?.post?.user.clerkId
          : Like?.comment?.user?.clerkId;
        const actorId = Like?.user.clerkId;
        const event_type = "like";
        const message = Like?.post
          ? `${Like?.user.username} liked your post "${Like?.post?.post}"`
          : `${Like?.user.username} liked your comment "${Like?.comment?.comment}"`;

        const notification = await prisma.notification.create({
          data: {
            actor: {
              connect: {
                clerkId: actorId,
              },
            },
            receiver: {
              connect: {
                clerkId: receiverId,
              },
            },
            event_type,
            message,
            like: {
              connect: {
                id: Like?.id,
              },
            },
          },
        });

        logger.info(notification);
        break;
      }

      // Notify when a comment is made
      case "comment": {
        const commentPayload = data as Comment;
        logger.info("Id:" + commentPayload.id);
        const Comment = await prisma.comment.findUnique({
          where: {
            id: commentPayload.id,
          },
          include: {
            user: true,
            post: {
              include: {
                user: true,
              },
            },
            Like: true,
          },
        });

        const receiverId = Comment?.post?.user?.clerkId;
        const actorId = Comment?.user?.clerkId;
        const event_type = "comment";
        const message = `${Comment?.user.username} commented at your post "${Comment?.post.post}".`;

        const notification = await prisma.notification.create({
          data: {
            actor: {
              connect: {
                clerkId: actorId,
              },
            },
            receiver: {
              connect: {
                clerkId: receiverId,
              },
            },
            event_type,
            message,
            comment: {
              connect: {
                id: Comment?.id,
              },
            },
          },
        });

        logger.info(notification);
        break;
      }

      // Notofy when a user follows you
      case "follow": {
        const followPayload = data as Follower;
        logger.info("Id:" + followPayload.id);
        const Following = await prisma.follower.findUnique({
          where: {
            id: followPayload.id,
          },
          include: {
            user: true,
            follower: true,
          },
        });

        const receiverId = Following?.user.clerkId;
        const actorId = Following?.follower.clerkId;
        const event_type = "follow";
        const message = `${Following?.follower.username} started following you.`;

        const notification = await prisma.notification.create({
          data: {
            actor: {
              connect: {
                clerkId: actorId,
              },
            },
            receiver: {
              connect: {
                clerkId: receiverId,
              },
            },
            event_type,
            message,
            follower: {
              connect: {
                id: Following?.id,
              },
            },
          },
        });

        logger.info(notification);
        break;
      }

      // Notify when a user repost your post
      case "repost": {
        const repostPayload = data as Follower;
        logger.info("Id:" + repostPayload.id);
        const Repost = await prisma.post.findUnique({
          where: {
            id: repostPayload.id,
          },
          include: {
            user: true,
            Like: true,
            Comment: true,
            challenge: true,
            repostOf: {
              include: {
                user: true,
              },
            },
          },
        });

        const receiverId = Repost?.repostOf?.user.clerkId;
        const actorId = Repost?.user?.clerkId;
        const event_type = "repost";
        const message = `${Repost?.user.username} reposted your post "${Repost?.post}".`;

        const notification = await prisma.notification.create({
          data: {
            actor: {
              connect: {
                clerkId: actorId,
              },
            },
            receiver: {
              connect: {
                clerkId: receiverId,
              },
            },
            event_type,
            message,
            post: {
              connect: {
                id: Repost?.id,
              },
            },
          },
        });

        logger.info(notification);
        break;
      }

      // Notify to all subscribed user that you made a post
      case "post": {
        const subscribers = data as Subscribe[];
        const validSubscribers = subscribers.filter(
          (sub) => !!sub.subscriberId
        );

        if (validSubscribers.length === 0) {
          logger.info("No valid subscribers found for this post.");
          break;
        }
        const postId = data2.id;

        const post = await prisma.post.findUnique({
          where: {
            id: postId,
          },
          include: {
            user: true,
            Like: true,
            Comment: true,
            challenge: true,
            repostOf: {
              include: {
                user: true,
              },
            },
          },
        });
        const event_type = "post";

        const message = `${post?.user.username} just ${
          type2 === "repost" ? "reposted" : "posted"
        }"${post?.post}".`;

        const notification = await prisma.notification.createMany({
          data: subscribers.map((sub) => ({
            actorId: post?.userId as string,
            receiverId: sub.subscriberId,
            event_type,
            message,
            postId: post?.id as string,
          })),
        });

        logger.info(notification);
        break;
      }

      // Notify challenge owner when you join a challenge
      case "member": {
        const memberPayload = data as Members;
        logger.info("Id:" + memberPayload.id);
        const Member = await prisma.members.findUnique({
          where: {
            id: memberPayload.id,
          },
          include: {
            user: true,
            challenge: {
              include: {
                user: true,
              },
            },
          },
        });

        const receiverId = Member?.challenge.user.clerkId;
        const actorId = Member?.user.clerkId;
        const event_type = "member";
        const message = `${Member?.user.username} joined your challenge "${Member?.challenge.challenge}".`;

        const notification = await prisma.notification.create({
          data: {
            actor: {
              connect: {
                clerkId: actorId,
              },
            },
            receiver: {
              connect: {
                clerkId: receiverId,
              },
            },
            event_type,
            message,
            challenge: {
              connect: {
                id: Member?.challenge?.id,
              },
            },
          },
        });

        logger.info(notification);
        break;
      }

      // Notify you and owner when you have completed a challenge
      case "challengeCompleted": {
        const challengePayload = data as Challenge;
        const userpost = data2 as Post[];
        const userId = userpost[0].userId;

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });
        logger.info("Id:" + challengePayload.id);
        const Challenge = await prisma.challenge.findUnique({
          where: {
            id: challengePayload.id,
          },
          include: {
            user: true,
            Members: true,
          },
        });

        if (type2 === "sendNotificationToUser") {
          const receiverId = user?.clerkId; // Challenge?.user.clerkId
          const actorId = Challenge?.user.clerkId;
          const event_type = "challenge_completed";
          const message = `You have completed the challenge "${Challenge?.challenge}".`;

          const notification = await prisma.notification.create({
            data: {
              actor: {
                connect: {
                  clerkId: actorId,
                },
              },
              receiver: {
                connect: {
                  clerkId: receiverId,
                },
              },
              event_type,
              message,
              challenge: {
                connect: {
                  id: Challenge?.id,
                },
              },
            },
          });

          logger.info(notification);
        } else if (type2 === "sendNotificationToChallengeCreator") {
          const receiverId = Challenge?.user.clerkId;
          const actorId = user?.clerkId;
          const event_type = "challenge_completed";
          const message = `${user?.username} has completed your challenge "${Challenge?.challenge}".`;

          const notification = await prisma.notification.create({
            data: {
              actor: {
                connect: {
                  clerkId: actorId,
                },
              },
              receiver: {
                connect: {
                  clerkId: receiverId,
                },
              },
              event_type,
              message,
              challenge: {
                connect: {
                  id: Challenge?.id,
                },
              },
            },
          });

          logger.info(notification);
        }
        break;
      }

      // Remind you about your task
      case "task": {
        const taskPayload = data as Habit;
        logger.info("Id:" + taskPayload.id);
        const Task = await prisma.habit.findUnique({
          where: {
            id: taskPayload.id,
          },
          include: {
            user: true,
            challenge: {
              include: {
                user: true,
              },
            },
          },
        });

        const receiverId = Task?.user.clerkId;
        const actorId = Task?.user.clerkId;
        const event_type = "task";
        const message =
          type2 === "due"
            ? `Your task "${Task?.task}" is due.`
            : `You have less than ${time} left to complete your task "${Task?.task}".`;

        const notification = await prisma.notification.create({
          data: {
            actor: {
              connect: {
                clerkId: actorId,
              },
            },
            receiver: {
              connect: {
                clerkId: receiverId,
              },
            },
            event_type,
            message,
            task: {
              connect: {
                id: Task?.id,
              },
            },
          },
        });

        logger.info(notification);
        break;
      }
    }
  },
  { connection: bullRedis!, concurrency: 5 }
);
