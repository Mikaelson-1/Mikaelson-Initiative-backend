import TaskService from "../../../services/dashboard/task.service";
import express from "express";
import { ApiError, ApiSuccess, logger } from "../../../utils";
import {
  createTaskType,
  createTaskValidation,
  updateTaskType,
  updateTaskValidation,
} from "../../../validations/habit.validation";

const taskService = new TaskService();

class TaskController {
  static async createTask(req: express.Request, res: express.Response) {
    if (!req.body) {
      logger.error("Missing request body");
      return res
        .status(400)
        .json(new ApiError(400, "Missing request body", []));
    }

    const validate = createTaskValidation.parse(req.body);
    const { clerkId, task, challengeId, description, dueTime }: createTaskType =
      validate;

    const data: any = {
      user: {
        connect: {
          clerkId: clerkId,
        },
      },
      task,
      description,
      dueTime,
    };

    if (challengeId) {
      data.challenge = {
        connect: {
          id: challengeId,
        },
      };
    }

    try {
      const task = await taskService.createTask(data);
      return res
        .status(201)
        .json(new ApiSuccess(201, "Task created successfully!", task));
    } catch (error) {
      logger.error(error);

      return res
        .status(500)
        .json(new ApiError(500, "Something went wrong!", [error]));
    }
  }

  static async getTasks(req: express.Request, res: express.Response) {
    try {
      const params = req.query;
      const { orderBy, take, skip, filter } = params;
      const id = req.params.id;

      const tasks = await taskService.getAllUserTodaysTask(id, {
        filter: filter,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy,
      });
      logger.info(tasks);
      res
        .status(200)
        .json(new ApiSuccess(200, "Tasks fetched successfully!,", tasks));
    } catch (error) {
      logger.error(error);

      return res
        .status(500)
        .json(new ApiError(500, "Something went wrong!", [error]));
    }
  }

  static async getTaskById(req: express.Request, res: express.Response) {
    const clerkId = req.params.id;
    try {
      const task = await taskService.getTask(clerkId);
      logger.info(task);
      res
        .status(200)
        .json(new ApiSuccess(200, "Task fetched successfully!,", task));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async deleteTask(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      await taskService.deleteTask(id);
      res
        .status(200)
        .json(new ApiSuccess(201, "Task deleted!,", "Task deleted!"));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }

  static async updateTask(req: express.Request, res: express.Response) {
    const id = req.params.id;
    const validate = updateTaskValidation.parse(req.body);
    const { task, description }: updateTaskType = validate;
    try {
      const update = await taskService.updateTask(
        {
          task,
          description,
        },
        id
      );
      logger.info(update);
      res
        .status(201)
        .json(new ApiSuccess(201, "Task updated successfully!,", update));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something wwent wrong!,", [error]));
    }
  }
}

export default TaskController;
