import express from "express";
import UserService from "../../../services/account/user.service";
import { ApiError, ApiSuccess, logger } from "../../../utils";
import prisma from "../../../config/prismadb";
import LikeService from "../../../services/social-feed/like.service";
import { Like } from "../../../generated/prisma";
import ChallengeService from "../../../services/social-feed/challenge.service";
import {
  createChallengeType,
  createChallengeValidation,
  updateChallengeType,
  updateChallengeValidation,
} from "../../../validations/challenge.validation";

const challengeService = new ChallengeService();

class ChallengeController {
  static async createChallenge(req: express.Request, res: express.Response) {
    if (!req.body) {
      logger.error("Missing request body");
      return res
        .status(400)
        .json(new ApiError(400, "Missing request body", []));
    }

    const validate = createChallengeValidation.parse(req.body);
    const { challenge, clerkId, days }: createChallengeType = validate;

    try {
      const new_challenge = await challengeService.createChallenge({
        challenge,
        days,
        user: {
          connect: { clerkId: clerkId },
        },
      });

      logger.info(new_challenge);
      res
        .status(201)
        .json(
          new ApiSuccess(201, "User created successfully!,", new_challenge)
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getChallenges(req: express.Request, res: express.Response) {
    try {
      const params = req.query;
      const { orderBy, take, skip, filter } = params;
      const challenges = await challengeService.getChallenge({
        filter: filter,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy,
      });

      logger.info(challenges);
      res
        .status(200)
        .json(
          new ApiSuccess(200, "Challenges fetched successfully!,", challenges)
        );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getChallengeById(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      const challenge = await challengeService.getChallengeById(id);
      logger.info(challenge);
      res
        .status(200)
        .json(new ApiSuccess(200, "Likes fetched successfully!,", challenge));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async updateChallenge(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      const validate = updateChallengeValidation.parse(req.body);
      const { challenge }: updateChallengeType = validate;
      const challenges = await challengeService.updateChallenge(
        {
          challenge,
        },
        id
      );
      logger.info(challenges);
      res
        .status(200)
        .json(new ApiSuccess(200, "Likes fetched successfully!,", challenges));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getUserChallengePosts(
    req: express.Request,
    res: express.Response
  ) {
    try {
      const challengeId = req.params.id;
      const clerkId = req.params.userId;
      const result = await challengeService.getUserChallengePosts(
        clerkId,
        challengeId
      );
      logger.info(result);
      res.status(200).json(
        new ApiSuccess(
          200,
          `${
            result?.posts?.length
          } posts made in ${challengeId}. Completed: ${result?.percentageOfPosts.toFixed(
            1
          )}%`,
          {
            posts: result?.posts,
            percentageOfPosts: result?.percentageOfPosts,
          }
        )
      );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getChallengePosts(req: express.Request, res: express.Response) {
    try {
      const result = await challengeService.getAllChallengePosts();
      logger.info(result);
      res.status(200).json(
        new ApiSuccess(200, "Challenge posts gotten!", {
          posts: result?.posts,
          percentageOfPosts: result?.percentageOfPosts,
          numOfDaysPosted: result?.numOfDaysPosted,
        })
      );
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async deleteChallenge(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      await challengeService.deleteChallenge(id);
      res.status(200).json(new ApiSuccess(200, "Challenge deleted!", ""));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async addMemberToChallenge(
    req: express.Request,
    res: express.Response
  ) {
    if (!req.body) {
      logger.error("Missing request body");
      return res
        .status(400)
        .json(new ApiError(400, "Missing request body", []));
    }

    const { challengeId, clerkId } = req.body || {};

    try {
      const member = await challengeService.addMemberToChallenge(
        {
          user: {
            connect: { clerkId: clerkId },
          },
          challenge: {
            connect: {
              id: challengeId,
            },
          },
        },
        clerkId,
        challengeId
      );

      logger.info(member);
      if (member?.id) {
        res
          .status(201)
          .json(
            new ApiSuccess(
              201,
              "you have joined this challenge successfully!,",
              member
            )
          );
      } else {
        res
          .status(200)
          .json(
            new ApiSuccess(201, "You are already in the challenge!,", member)
          );
      }
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async getChallengeMembers(
    req: express.Request,
    res: express.Response
  ) {
    try {
      const challengeId = req.params.id;
      const challenges = await challengeService.getMembersInChallenge(
        challengeId
      );
      logger.info(challenges);
      res
        .status(200)
        .json(
          new ApiSuccess(
            200,
            "Members in challenge gotten successfully!,",
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

  static async removeMember(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      await challengeService.removeMemberInChallege(id);
      res.status(200).json(new ApiSuccess(200, "Member deleted!", ""));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }
}

export default ChallengeController;
