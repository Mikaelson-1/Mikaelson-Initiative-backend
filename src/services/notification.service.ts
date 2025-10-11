import { PrismaClient } from "@prisma/client";
import prisma from "../config/prismadb";
import {
  Challenge,
  Comment,
  Follower,
  Like,
  Members,
  Post,
} from "../generated/prisma";
import { logger } from "../utils";

export default class NotificationService<T> {
  private readonly db: PrismaClient;

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }
  async createNotification(type: string, data: T, data2?: T, type2?: string) {
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
    }
  }

  async getNotifications(clerkId: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        receiverId: clerkId,
      },
      include: {
        post: true,
        challenge: true,
        comment: true,
        task: true,
        like: true,
        follower: true,
        bookmark: true,
      },
    });
    logger.info(notifications);
  }
}
