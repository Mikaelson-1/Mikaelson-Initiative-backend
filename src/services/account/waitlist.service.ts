import { Follower, Subscribe, User } from "../../generated/prisma";
import { Repository } from "../../repository/base/repository";
import { logger } from "../../utils";
import RedisService from "./../redis.service";
import prisma from "../../config/prismadb";
import crypto from "crypto";
import { sendNewUserEmail } from "../../libs/email";
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
      const waitList = await waitListRepository.create(data);
      if (waitList) {
        logger.info(waitList);
        return waitList;
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
        return waitList;
      }
    } catch (error) {
      logger.info(
        "Something went wrong with fetching user to waitlist" + error
      );
    }
  }
}
