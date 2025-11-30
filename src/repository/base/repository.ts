import { logger } from "../../utils";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "../../generated/prisma";
import { IRepository } from "./repository.interface";
import prisma from "../../config/prismadb";
import { getDay } from "../../utils/date";

/* **Here's the repository of the codebase. All the database queries
concerning the social feed are being made here.** */

const { today, tomorrow } = getDay();

export class Repository<T> implements IRepository<T> {
  private readonly db: any;
  private readonly prismaClient: PrismaClient;

  constructor(db: any, prismaClient: PrismaClient = prisma) {
    this.db = db; // db = prisma.user, prisma.post, ...
    this.prismaClient = prismaClient; // prismaClient = prisma
  }

  async create(data: any): Promise<T> {
    return this.db.create({ data });
  }

  async findById(
    id: string | number,
    type:
      | "user"
      | "post"
      | "challenge"
      | "comment"
      | "bookmark"
      | "like"
      | "notification"
  ): Promise<T | null> {
    switch (type) {
      // Find user by Id
      case "user":
        logger.info(id);
        const user = this.prismaClient.user.findUnique({
          where: {
            clerkId: id as string,
          },
          include: {
            Post: true,
            following: true,
            Follower: true,
            Bookmark: true,
            Habit: true,
          } satisfies Prisma.UserInclude,
        } satisfies Parameters<typeof prisma.user.findUnique>[0]) as Promise<T | null>;
        logger.info(user);
        return user;
      case "post":
        return this.prismaClient.post.findUnique({
          where: {
            id: id as string,
          },
          include: {
            user: true,
            Like: true,
            Comment: true,
            repostOf: true,
            reposts: true,
            Bookmark: true,
          } satisfies Prisma.PostInclude,
        } satisfies Parameters<typeof prisma.post.findUnique>[0]) as Promise<T | null>;

      // Find a challenge group by Id
      case "challenge":
        return this.prismaClient.challenge.findUnique({
          where: {
            id: id as string,
          },
          include: {
            user: true,
            Post: true,
          } satisfies Prisma.ChallengeInclude,
        } satisfies Parameters<typeof prisma.challenge.findUnique>[0]) as Promise<T | null>;

      // Find a comment By Id
      case "comment":
        logger.info(`Comment Id in repo: ${id}`);
        const comment = await this.prismaClient.comment.findUnique({
          where: {
            id: id as string,
          },
          include: {
            user: true,
            post: true,
            Like: true,
          } satisfies Prisma.CommentInclude,
        } satisfies Parameters<typeof prisma.comment.findUnique>[0]);
        logger.info("Comment:", comment);
        return comment as T | null;

      // Find a user bookmark by Id
      case "bookmark":
        return this.prismaClient.bookmark.findUnique({
          where: {
            id: id as string,
          },
          include: {
            post: true,
          } satisfies Prisma.BookmarkInclude,
        } satisfies Parameters<typeof prisma.bookmark.findUnique>[0]) as Promise<T | null>;

      // Get a like by Id
      case "like":
        return this.prismaClient.like.findUnique({
          where: {
            id: id as string,
          } satisfies Prisma.LikeWhereInput,

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
          } satisfies Prisma.LikeInclude,
        } satisfies Parameters<typeof prisma.like.findUnique>[0]) as Promise<T | null>;

      case "notification":
        return this.prismaClient.notification.findUnique({
          where: {
            id: id as string,
          } satisfies Prisma.NotificationWhereInput,
          include: {
            post: true,
            challenge: true,
            comment: true,
            task: true,
            like: true,
            follower: true,
            bookmark: true,
          } satisfies Prisma.NotificationInclude,
        } satisfies Parameters<typeof prisma.notification.findUnique>[0]) as Promise<T | null>;

      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async findAll(
    type:
      | "user"
      | "post"
      | "TodayPost"
      | "like"
      | "userPosts"
      | "userTodayPosts"
      | "challenge"
      | "comment"
      | "searchPosts"
      | "searchUsers"
      | "bookmark"
      | "topContributors"
      | "followers"
      | "following"
      | "challengeMembers"
      | "userLikes"
      | "userChallengePosts"
      | "getFollowingPosts"
      | "notifications"
      | "challengePosts"
      | "waitList",
    id?: string | number,
    id2?: string | number,
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      orderBy?: "asc" | "desc";
    }
  ): Promise<T[]> {
    switch (type) {
      // Get all Users (pagination and search logic included)
      case "user":
        return this.prismaClient.user.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            ...(params?.filter
              ? {
                  OR: [
                    {
                      username: {
                        contains: params?.filter,
                        mode: "insensitive",
                      },
                      email: {
                        contains: params?.filter,
                        mode: "insensitive",
                      },
                      uniqueName: {
                        contains: params?.filter,
                        mode: "insensitive",
                      },
                    },
                  ],
                }
              : {}),
          } satisfies Prisma.UserWhereInput,
          include: {
            Post: true,
            Like: true,
            Challenge: true,
            Comment: true,
            Bookmark: true,
          } satisfies Prisma.UserInclude,
          orderBy: {
            createdAt: params?.orderBy ? params?.orderBy : "desc",
          } satisfies Prisma.UserOrderByWithRelationInput,
        } satisfies Parameters<typeof prisma.user.findMany>[0]) as Promise<T[]>;

      // Get all posts (pagination and search logic included)
      case "post":
        return this.prismaClient.post.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            ...(params?.filter
              ? {
                  post: {
                    contains: params.filter,
                    mode: "insensitive",
                  },
                }
              : undefined),
          } satisfies Prisma.PostWhereInput,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.PostOrderByWithRelationInput,
          include: {
            user: true,
            Like: true,
            Comment: true,
            challenge: true,
            reposts: true,
            repostOf: {
              include: {
                user: true,
              },
            },
          } satisfies Prisma.PostInclude,
        } satisfies Parameters<typeof prisma.post.findMany>[0]) as Promise<T[]>;

      // Get all posts created today
      case "TodayPost":
        logger.info(
          `Today: ${today.toISOString()}, Tomorrow: ${tomorrow.toISOString()}`
        );
        return this.prismaClient.post.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
            ...(params?.filter
              ? {
                  post: {
                    contains: params.filter,
                    mode: "insensitive",
                  },
                }
              : undefined),
          } satisfies Prisma.PostWhereInput,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.PostOrderByWithRelationInput,
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
          } satisfies Prisma.PostInclude,
        } satisfies Parameters<typeof prisma.post.findMany>[0]) as Promise<T[]>;

      // Get a post or comment likes
      case "like":
        return this.prismaClient.like.findMany({
          where: {
            OR: [{ postId: id as string }, { commentId: id as string }],
          } satisfies Prisma.LikeWhereInput,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.LikeOrderByWithRelationInput,
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
          } satisfies Prisma.LikeInclude,
        } satisfies Parameters<typeof prisma.like.findMany>[0]) as Promise<T[]>;

      // Get all user posts
      case "userPosts":
        logger.info(`Clerk Id in repo: ${id}`);
        const posts = await this.prismaClient.post.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            userId: id as string,
            ...(params?.filter
              ? {
                  post: {
                    contains: params.filter,
                    mode: "insensitive",
                  },
                }
              : {}),
          } satisfies Prisma.PostWhereInput,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.PostOrderByWithRelationInput,
          include: {
            user: true,
            Like: true,
            challenge: true,
            Comment: true,
            repostOf: {
              include: {
                user: true,
              },
            },
          } satisfies Prisma.PostInclude,
        } satisfies Parameters<typeof prisma.post.findMany>[0]);
        return posts as T[];

      case "challengePosts":
        return await this.prismaClient.post.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            challengeId: {
              not: null,
            },
            ...(params?.filter
              ? {
                  post: {
                    contains: params.filter,
                    mode: "insensitive",
                  },
                }
              : {}),
          } satisfies Prisma.PostWhereInput,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.PostOrderByWithRelationInput,
          include: {
            user: true,
            Like: true,
            challenge: true,
            Comment: true,
            repostOf: {
              include: {
                user: true,
              },
            },
          } satisfies Prisma.PostInclude,
        } satisfies Parameters<typeof prisma.post.findMany>[0]);

      case "userChallengePosts":
        return await this.prismaClient.post.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            userId: id as string,
            challengeId: {
              not: null,
            },

            ...(params?.filter
              ? {
                  post: {
                    contains: params.filter,
                    mode: "insensitive",
                  },
                }
              : {}),
          } satisfies Prisma.PostWhereInput,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.PostOrderByWithRelationInput,
          include: {
            user: true,
            Like: true,
            challenge: true,
            Comment: true,
            repostOf: {
              include: {
                user: true,
              },
            },
          } satisfies Prisma.PostInclude,
        } satisfies Parameters<typeof prisma.post.findMany>[0]);

      // Get all user posts created today
      case "userTodayPosts":
        logger.info(`Clerk Id in repo: ${id}`);
        return await this.prismaClient.post.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
            userId: id as string,
            ...(params?.filter
              ? {
                  post: {
                    contains: params.filter,
                    mode: "insensitive",
                  },
                }
              : {}),
          } satisfies Prisma.PostWhereInput,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.PostOrderByWithRelationInput,
          include: {
            user: true,
            Like: true,
            challenge: true,
            Comment: true,
            repostOf: {
              include: {
                user: true,
              },
            },
          } satisfies Prisma.PostInclude,
        } satisfies Parameters<typeof prisma.post.findMany>[0]);

      // Get all challenge groups
      case "challenge":
        return this.prismaClient.challenge.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            ...(params?.filter
              ? {
                  challenge: {
                    contains: params.filter,
                    mode: "insensitive",
                  },
                }
              : {}),
          } satisfies Prisma.ChallengeWhereInput,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.ChallengeOrderByWithRelationInput,
          include: {
            user: true,
            Post: true,
          } satisfies Prisma.ChallengeInclude,
        } satisfies Parameters<typeof prisma.challenge.findMany>[0]) as Promise<
          T[]
        >;

      // Get all post comments
      case "comment":
        return this.prismaClient.comment.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            postId: id as string,
            ...(params?.filter
              ? {
                  comment: {
                    contains: params.filter,
                    mode: "insensitive",
                  },
                }
              : {}),
          } satisfies Prisma.CommentWhereInput,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.CommentOrderByWithRelationInput,
          include: {
            user: true,
            post: true,
            Like: true,
          } satisfies Prisma.CommentInclude,
        } satisfies Parameters<typeof prisma.comment.findMany>[0]) as Promise<
          T[]
        >;

      // Search Posts
      case "searchPosts":
        const searchQuery = id as string;
        return this.prismaClient.post.findMany({
          where: {
            post: {
              contains: searchQuery,
              mode: "insensitive",
            },
          } satisfies Prisma.PostWhereInput,
          orderBy: {
            createdAt: "desc",
          } satisfies Prisma.PostOrderByWithRelationInput,
          include: {
            user: true,
            Like: true,
            Comment: true,
          } satisfies Prisma.PostInclude,
        } satisfies Parameters<typeof prisma.post.findMany>[0]) as Promise<T[]>;

      // Search Users
      case "searchUsers":
        const userQuery = id as string;
        return this.prismaClient.user.findMany({
          where: {
            OR: [
              {
                username: {
                  contains: userQuery,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: userQuery,
                  mode: "insensitive",
                },
              },
            ],
          } satisfies Prisma.UserWhereInput,
          orderBy: {
            createdAt: "desc",
          } satisfies Prisma.UserOrderByWithRelationInput,
        } satisfies Parameters<typeof prisma.user.findMany>[0]) as Promise<T[]>;

      // Get all user bookmark posts
      case "bookmark":
        return this.prismaClient.bookmark.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            user: {
              clerkId: id as string,
            },
            ...(params?.filter
              ? {
                  post: {
                    post: {
                      contains: params.filter,
                      mode: "insensitive",
                    },
                  },
                }
              : {}),
          } satisfies Prisma.BookmarkWhereInput,
          orderBy: {
            createdAt: "desc",
          } satisfies Prisma.BookmarkOrderByWithRelationInput,
          include: {
            post: true,
          } satisfies Prisma.BookmarkInclude,
        } satisfies Parameters<typeof prisma.bookmark.findMany>[0]) as Promise<
          T[]
        >;

      // Get most active user with  all their posts and likes (user with the most posts)
      case "topContributors":
        return this.prismaClient.user.findMany({
          include: {
            _count: {
              select: { Post: true, Like: true, Comment: true },
            },
            Post: true,
            Like: true,
          } satisfies Prisma.UserInclude,
          orderBy: {
            Post: {
              _count: "desc",
            },
          } satisfies Prisma.UserOrderByWithRelationInput,
        } satisfies Parameters<typeof prisma.user.findMany>[0]) as Promise<T[]>;

      // Get user's followers
      case "followers":
        return this.prismaClient.follower.findMany({
          where: {
            // Pass the userId of the user you want to get their followers
            user: {
              clerkId: id as string,
            },
          } satisfies Prisma.FollowerWhereInput,
          include: {
            user: true,
            follower: true,
          } satisfies Prisma.FollowerInclude,
        } satisfies Parameters<typeof prisma.follower.findMany>[0]) as Promise<
          T[]
        >;

      // Get user's following
      case "following":
        return this.prismaClient.follower.findMany({
          // Pass your userId to get users following you
          where: {
            follower: {
              clerkId: id as string,
            },
          } satisfies Prisma.FollowerWhereInput,
          include: {
            user: true,
            follower: true,
          } satisfies Prisma.FollowerInclude,
        } satisfies Parameters<typeof prisma.follower.findMany>[0]) as Promise<
          T[]
        >;

      case "getFollowingPosts":
        const followingUser = await this.prismaClient.follower.findMany({
          where: {
            follower: {
              clerkId: id as string,
            },
          } satisfies Prisma.FollowerWhereInput,
          select: {
            userId: true,
          } satisfies Prisma.FollowerSelect,
        });
        logger.info("Account you are following:" + followingUser);

        const followingIds = followingUser.map((f: any) => f.userId);

        if (followingIds.length === 0) {
          logger.info("User follows no one — returning empty post list.");
          return [];
        }

        // Get all post created by the accounts you are following
        const followingPosts = await this.prismaClient.post.findMany({
          where: {
            user: {
              id: { in: followingIds },
            },
          } satisfies Prisma.PostWhereInput,
          include: {
            user: true,
            Like: true,
            Comment: {
              include: { user: true },
            },
          } satisfies Prisma.PostInclude,
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          },
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params.skip - 1) * params.take
              : undefined,
        } satisfies Parameters<typeof this.prismaClient.post.findMany>[0]);

        logger.info(followingPosts);
        return followingPosts as unknown as Promise<T[]>;

      // Get all members in a challenge group
      case "challengeMembers":
        return this.prismaClient.members.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            challengeId: id as string,
            ...(params?.filter
              ? {
                  user: {
                    OR: [
                      {
                        username: {
                          contains: params.filter,
                          mode: "insensitive",
                        },
                      },
                      {
                        email: {
                          contains: params.filter,
                          mode: "insensitive",
                        },
                      },
                      {
                        uniqueName: {
                          contains: params?.filter,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                }
              : {}),
          } satisfies Prisma.MembersWhereInput,
          include: {
            user: true,
            challenge: true,
          } satisfies Prisma.MembersInclude,
        } satisfies Parameters<typeof prisma.members.findMany>[0]) as Promise<
          T[]
        >;

      // Get all likes a user has made
      case "userLikes":
        return this.prismaClient.like.findMany({
          where: {
            user: {
              clerkId: id as string,
            },
          } satisfies Prisma.LikeWhereInput,
        } satisfies Parameters<typeof prisma.like.findMany>[0]) as Promise<T[]>;

      // Get all user's posts in a challenge group
      case "userChallengePosts":
        logger.info(`clerkId: ${id}`);
        logger.info(`challengeId: ${id2}`);
        return this.prismaClient.post.findMany({
          take: params?.take ?? undefined,
          skip:
            params?.skip && params?.take
              ? (params?.skip - 1) * params?.take
              : undefined,
          where: {
            user: {
              clerkId: id as string,
            },
            challengeId: id2 as string,
          } satisfies Prisma.PostWhereInput,
          orderBy: {
            createdAt: "desc",
          } satisfies Prisma.PostOrderByWithRelationInput,
          include: {
            user: true,
            challenge: true,
          } satisfies Prisma.PostInclude,
        } satisfies Parameters<typeof prisma.post.findMany>[0]) as Promise<T[]>;

      case "notifications":
        return this.prismaClient.notification.findMany({
          where: {
            receiver: {
              clerkId: id as string,
            },
          } satisfies Prisma.NotificationWhereInput,
          include: {
            post: true,
            challenge: true,
            comment: true,
            task: true,
            like: true,
            follower: true,
            bookmark: true,
          } satisfies Prisma.NotificationInclude,
        } satisfies Parameters<typeof prisma.notification.findMany>[0]) as Promise<
          T[]
        >;

      case "waitList":
        return this.prismaClient.waitList.findMany({
          orderBy: {
            createdAt: params?.orderBy ?? "desc",
          } satisfies Prisma.WaitListOrderByWithRelationInput,
        } satisfies Parameters<typeof prisma.waitList.findMany>[0]) as Promise<
          T[]
        >;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  // Logic to check for queries in the database
  async findFirst(
    targetId: string | number,
    id: string | number,
    type?: "like" | "bookmark" | "follow" | "challengeMember" | "",
    likeWhat?: "post" | "comment"
  ): Promise<T | null> {
    switch (type) {
      // Check if user has already liked a post/comment
      case "like":
        return this.prismaClient.like.findFirst({
          where: {
            ...(likeWhat === "post"
              ? { postId: targetId as string }
              : { commentId: targetId as string }),
            user: {
              clerkId: id as string,
            },
          } satisfies Prisma.LikeWhereInput,
        } satisfies Parameters<typeof prisma.like.findFirst>[0]) as Promise<T | null>;

      // Check if user has already bookmarked a post
      case "bookmark":
        return this.prismaClient.bookmark.findFirst({
          where: {
            postId: targetId as string,
            user: {
              clerkId: id as string,
            },
          } satisfies Prisma.BookmarkWhereInput,
        } satisfies Parameters<typeof prisma.bookmark.findFirst>[0]) as Promise<T | null>;

      // Check if user is already following another user
      case "follow":
        return this.prismaClient.follower.findFirst({
          where: {
            user: {
              clerkId: targetId as string,
            },
            follower: {
              clerkId: id as string,
            },
          } satisfies Prisma.FollowerWhereInput,
        } satisfies Parameters<typeof prisma.follower.findFirst>[0]) as Promise<T | null>;

      // Check if user is already a member of a challenge group
      case "challengeMember":
        return this.prismaClient.members.findFirst({
          where: {
            challengeId: targetId as string,
            user: {
              clerkId: id as string,
            },
          } satisfies Prisma.MembersWhereInput,
        }) satisfies Parameters<
          typeof prisma.members.findFirst
        >[0] as Promise<T | null>;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async update(
    id: string | number,
    data?: Partial<T>,
    type?: "user" | "views"
  ): Promise<T | null> {
    logger.info(`Id: ${id}`);
    switch (type) {
      // Update a user profile
      case "user":
        return this.prismaClient.user.update({
          where: {
            clerkId: id as string,
          },
          data: data as Prisma.UserUpdateInput,
        } satisfies Parameters<typeof prisma.user.update>[0]) as Promise<T | null>;

      // Each view to a post is being recorded
      case "views":
        return this.prismaClient.post.update({
          where: {
            id: id as string,
          } satisfies Prisma.PostWhereInput,
          data: {
            views: {
              increment: 1,
            },
          } satisfies Prisma.PostUpdateInput,
        } satisfies Parameters<typeof prisma.post.update>[0]) as Promise<T | null>;

      // Default updating by model's Id
      default:
        return this.db.update({
          where: {
            id: id as string,
          },
          data,
        }) as Promise<T | null>;
    }
  }

  // Delete By Id
  async delete(id: string | number, type?: string): Promise<boolean> {
    try {
      logger.info(id);
      const result = await this.db.delete({
        where: {
          id: id as string,
        },
      });
      return result !== null;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }
}
