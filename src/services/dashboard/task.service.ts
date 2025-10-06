import { Habit, User } from "../../generated/prisma";
import { DashboardRepository } from "../../repository/dashboard/repository";
import { logger } from "../../utils";
import RedisService from "../redis.service";
import crypto from "crypto";
import prisma from "../../config/prismadb";

const dashboardRepository = new DashboardRepository<Habit & { user: User }>(
  prisma?.habit
);
const redisService = new RedisService();

export default class TaskService {
  async createTask(data: any) {
    try {
      if (!data) return null;
      await redisService.del(`Users`);
      return dashboardRepository.create(data);
    } catch (error) {
      logger.info("Something went wrong with creating task" + error);
    }
  }

  async getTask<T>(
    id: string | number
  ): Promise<T | (Habit & { user: User }) | null> {
    try {
      if (!id) return null;
      const cachedKey = `Task:${id}`;
      const cachedTask = await redisService.get(cachedKey);
      if (cachedTask) {
        return cachedTask as T;
      } else {
        const task = await dashboardRepository.findById(id, "task");
        if (task) {
          await redisService.set(cachedKey, task, 600);
        }
        return task as T;
      }
    } catch (error) {
      logger.info("Something went wrong with getting task" + error);
      return null;
    }
  }

  // Get all users
  async getAllUserTodaysTask<T>(
    clerkId: string,
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      orderBy?: any;
    }
  ): Promise<T | null | Habit[]> {
    try {
      const paramString = JSON.stringify(params || {});
      const key = crypto.createHash("md5").update(paramString).digest("hex");

      const cachedKey = `Task:${key}`;
      const cachedTasks = await redisService.get(cachedKey);
      if (cachedTasks) {
        return cachedTasks as Habit[] | T;
      } else {
        const tasks = await dashboardRepository.findAll(
          "userTasks",
          clerkId,
          undefined,
          params
        );
        if (tasks) {
          await redisService.set(cachedKey, tasks, 600);
        }
        return tasks as Habit[] | T;
      }
    } catch (error) {
      logger.info(
        "Something went wrong with getting user today's tasks" + error
      );
      return [] as T;
    }
  }

  async updateTask<T>(data: any, id: string | number): Promise<T | null> {
    try {
      if (!id) throw new Error("Id is required!");
      await redisService.del(`Task:${id}`);
      return dashboardRepository.update(id, data, "task") as T;
    } catch (error) {
      logger.info("Something went wrong with updating task" + error);
      return null;
    }
  }

  async deleteTask(id: string | number) {
    try {
      if (!id) throw new Error("Id is required!");
      await redisService.del(`Task:${id}`);
      return dashboardRepository.delete(id);
    } catch (error) {
      logger.info("Something went wrong with deleting task" + error);
      return null;
    }
  }
}
