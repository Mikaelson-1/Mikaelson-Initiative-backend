import { Follower, Subscribe, User, WaitList } from "../../generated/prisma";
import { Repository } from "../../repository/base/repository";
import { logger } from "../../utils";
import RedisService from "./../redis.service";
import prisma from "../../config/prismadb";
import crypto from "crypto";
import { sendNewUserEmail, waitListEmail } from "../../libs/email";
import { notificationQueue } from "../../queues/notification.queue";
import { emailQueue } from "../../queues/email.queue";

const waitListRepository = new Repository<User>(prisma.waitList);
const redisService = new RedisService();

export default class WaitListService {
  async joinWaitList(data: {
    name: string;
    email: string;
    interest?: string;
    hearing?: string;
  }) {
    try {
      const isUserOnwaitList = await waitListRepository.findFirst(
        data.email,
        "",
        "waitList"
      );
      logger.info("WaitList user status" + isUserOnwaitList);
      if (isUserOnwaitList) {
        logger.info("User is already on waitlist!");
      } else {
        const waitList = await waitListRepository.create(data);
        if (waitList) {
          logger.info(waitList);
          const sendEmail = await waitListEmail(data?.email);
          logger.info(sendEmail)
          return waitList;
        }
      }
    } catch (error) {
      logger.info("Something went wrong with adding user to waitlist" + error);
    }
  }

  async getWaitList() {
    try {
      const waitList = await waitListRepository.findAll("waitList");
      if (waitList) {
        logger.info(waitList);

        for (let i = 0; i < waitList.length; i++) {
          logger.info("waitList email:" + waitList[i].email);
        }

        return waitList;
      }
    } catch (error) {
      logger.info(
        "Something went wrong with fetching user to waitlist" + error
      );
    }
  }

  async checkIfUserIsAddedToWaitList(email: string) {
    try {
      const waitList = await waitListRepository.findFirst("waitList", email);
      return waitList;
    } catch (error) {
      logger.info(
        "Something went wrong with fetching user to waitlist" + error
      );
    }
  }
}
