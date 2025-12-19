import express from "express";
import TaskController from "../../features/dashboard/controller/task.controller";

const taskRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task and Habit management
 */

/**
 * @swagger
 * /api/v1/tasks/welcome:
 *   get:
 *     summary: Welcome message
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Welcome message
 */
taskRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Task API v1");
});

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *               description:
 *                 type: string
 *               dueTime:
 *                 type: string
 *                 format: date-time
 *               userId:
 *                 type: string
 *               challengeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
taskRouter.post("/", TaskController.createTask);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details
 *   patch:
 *     summary: Update task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *               dueTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Task updated successfully
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */
taskRouter.get("/:id", TaskController.getTaskById);
taskRouter.patch("/:id", TaskController.updateTask);
taskRouter.delete("/:id", TaskController.deleteTask);

/**
 * @swagger
 * /api/v1/tasks/{id}/user:
 *   get:
 *     summary: Get user tasks
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user tasks
 */
taskRouter.get("/:id/user", TaskController.getTasks);

export default taskRouter;
