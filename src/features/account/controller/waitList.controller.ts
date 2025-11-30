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
import WaitListService from "../../../services/account/waitlist.service";

const waitListService = new WaitListService();

class WaitListController {
  static async createUser(req: express.Request, res: express.Response) {
    if (!req.body) {
      logger.error("Missing request body");
      return res
        .status(400)
        .json(new ApiError(400, "Missing request body", []));
    }
    const { name, email, interest, hearing } = req.body;

    try {
      const user = await waitListService.joinWaitList({
        name,
        email,
        interest,
        hearing,
      } satisfies Prisma.WaitListCreateInput);
      logger.info(user);
      if (user) {
        res
          .status(201)
          .json(
            new ApiSuccess(201, "User added to waitlist  successfully!,", user)
          );
      } else {
        res.status(500).json(new ApiError(500, "Something wwent wrong!,", []));
      }
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getWaitLists(req: express.Request, res: express.Response) {
    try {
      const users = await waitListService.getWaitList();
      logger.info(users);
      res
        .status(200)
        .json(new ApiSuccess(200, "WaitLists fetched successfully!,", users));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }
}

export default WaitListController;
