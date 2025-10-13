import express from "express";
import UserService from "../../../services/account/user.service";
import { ApiError, ApiSuccess, logger } from "../../../utils";
import prisma from "../../../config/prismadb";
import { getPresignedUrl } from "../../../libs/aws";
import {
  Bookmark,
  Challenge,
  Comment,
  Like,
  Post,
  User,
} from "../../../generated/prisma";
import { Prisma } from "../../../generated/prisma";
import ChallengeService from "../../../services/social-feed/challenge.service";
import {
  createUserType,
  createUserValidation,
  followUserType,
  followUserValidation,
  updateUserType,
  updateUserValidation,
} from "../../../validations/user.validation";

const userService = new UserService();
const challengeService = new ChallengeService();

class UserController {
  static async createUser(req: express.Request, res: express.Response) {
    if (!req.body) {
      logger.error("Missing request body");
      return res
        .status(400)
        .json(new ApiError(400, "Missing request body", []));
    }

    const validateUser = createUserValidation.parse(req.body);
    const { username, email, clerkId }: createUserType = validateUser;
    const [uniqueName, _] = email.split("@");

    try {
      const user = await userService.createUser({
        username,
        uniqueName,
        email,
        clerkId,
      } satisfies Prisma.UserCreateInput);
      logger.info(user);
      res
        .status(201)
        .json(new ApiSuccess(201, "User created successfully!,", user));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getUserById(req: express.Request, res: express.Response) {
    const clerkId = req.params.id;
    try {
      const user = await userService.getUser(clerkId);
      logger.info(user);
      res
        .status(200)
        .json(new ApiSuccess(200, "User fetched successfully!,", user));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getUsers(req: express.Request, res: express.Response) {
    const params = req.query;
    const { filter, skip, take, orderBy } = params;
    try {
      const users = await userService.getAllUsers({
        filter: filter,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy,
      });
      logger.info(users);
      res
        .status(200)
        .json(new ApiSuccess(200, "Users fetched successfully!,", users));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async updateUser(req: express.Request, res: express.Response) {
    const clerkId = req.params.id;
    const validate = updateUserValidation.parse(req.body);
    const { username, bio, uniqueName }: updateUserType = validate;
    try {
      const files = req.files as {
        profileImage?: Express.Multer.File[];
        coverImage?: Express.Multer.File[];
      };

      const user = (await userService.getUser(clerkId)) as User;
      logger.info(user);

      let profileImageUrl: string | any = user.profileImage;
      let coverImageUrl: string | any = user.coverImage;

      if (files.profileImage?.[0]) {
        profileImageUrl = await getPresignedUrl(
          files?.profileImage?.[0] as any
        );
      }

      if (files.coverImage?.[0]) {
        coverImageUrl = await getPresignedUrl(files?.coverImage?.[0] as any);
      }

      const updatePayload: any = {};
      if (username !== undefined) updatePayload.username = username;
      if (bio !== undefined) updatePayload.bio = bio;
      if (uniqueName !== undefined) updatePayload.uniqueName = uniqueName;
      if (files?.profileImage?.[0])
        updatePayload.profileImage = profileImageUrl;
      if (files?.coverImage?.[0]) updatePayload.coverImage = coverImageUrl;

      const update_user = await userService.updateUser(
        updatePayload satisfies Prisma.UserUpdateInput,
        clerkId
      );
      logger.info(update_user);
      res
        .status(201)
        .json(new ApiSuccess(201, "User updated successfully!,", update_user));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async deleteUser(req: express.Request, res: express.Response) {
    try {
      const clerkId = req.params.id;
      const user = await prisma?.user.findUnique({
        where: {
          clerkId: clerkId,
        },
      });
      await userService.deleteUser(user?.id as string);

      res
        .status(200)
        .json(new ApiSuccess(200, "Account deleted!,", "User deleted!"));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getTopContributors(req: express.Request, res: express.Response) {
    try {
      const users = (await userService.getAllUsers()) as (User & {
        Post: Post[];
        Like: Like[];
        Challenge: Challenge[];
        Comment: Comment[];
        Bookmark: Bookmark[];
      })[];

      const usersWithPostCount = await userService.getTopContributors();

      res
        .status(200)
        .json(
          new ApiSuccess(200, "Top contributors gotten!,", usersWithPostCount)
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async followUser(req: express.Request, res: express.Response) {
    try {
      const validate = followUserValidation.parse(req.body);
      const { userId, clerkId }: followUserType = validate;

      const follow = await userService.followUser(
        {
          //user to be followed
          user: {
            connect: {
              clerkId: userId,
            },
          },
          //user that follows
          follower: {
            connect: {
              clerkId: clerkId,
            },
          },
        } satisfies Prisma.FollowerCreateInput,
        userId,
        clerkId
      );
      logger.info(follow);
      if (follow?.id) {
        res
          .status(201)
          .json(new ApiSuccess(201, `You have followed ${userId}`, follow));
      } else {
        logger.info("You are already following this user");
        res
          .status(200)
          .json(new ApiSuccess(200, `You are already following this user`, ""));
      }
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getFollowers(req: express.Request, res: express.Response) {
    try {
      const clerkId = req.params.id;
      const followers = await userService.getFollowers(clerkId);
      logger.info(followers);
      res
        .status(200)
        .json(
          new ApiSuccess(200, "Followers fetched successfully!,", followers)
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getFollowings(req: express.Request, res: express.Response) {
    try {
      const clerkId = req.params.id;
      const followers = await userService.getFollowing(clerkId);
      res
        .status(200)
        .json(
          new ApiSuccess(
            201,
            "Your followings fetched successfully!,",
            followers
          )
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getAllUserLikes(req: express.Request, res: express.Response) {
    try {
      const clerkId = req.params.id;
      const followers = await userService.getAllUserLikes(clerkId);
      logger.info(followers);
      res
        .status(200)
        .json(
          new ApiSuccess(200, "All likes fetched successfully!,", followers)
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getChallengesYouArePartOf(
    req: express.Request,
    res: express.Response
  ) {
    try {
      const clerkId = req.params.id;
      const challenges =
        await challengeService.getChallangesYouAreIncludedAsMember(clerkId);
      res
        .status(200)
        .json(
          new ApiSuccess(
            200,
            "Challenges you are a member of gotten!",
            challenges
          )
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async subscirbeToUser(req: express.Request, res: express.Response) {
    if (!req.body) {
      logger.error("Missing request body");
      return res
        .status(400)
        .json(new ApiError(400, "Missing request body", []));
    }

    const { subscribeToId, clerkId } = req.body;

    try {
      const subscribe = await userService.subscribeToUser({
        subscribeTo: {
          connect: {
            clerkId: subscribeToId,
          },
        },
        subscriber: {
          connect: {
            clerkId: clerkId,
          },
        },
      } satisfies Prisma.SubscribeCreateInput);
      logger.info(subscribe);
      res
        .status(201)
        .json(
          new ApiSuccess(201, "You have subscribed to this user!,", subscribe)
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }
}

export default UserController;
