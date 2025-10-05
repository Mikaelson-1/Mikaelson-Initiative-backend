import express from "express";
import TaskController from "../../features/dashboard/controller/task.controller";

const taskRouter = express.Router();

taskRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Task API v1");
});

taskRouter.post("/", TaskController.createTask);
taskRouter.get("/:id", TaskController.getTaskById);
taskRouter.patch("/:id", TaskController.updateTask);
taskRouter.delete("/:id", TaskController.deleteTask);
taskRouter.get("/:id/user", TaskController.getTasks);

export default taskRouter;
