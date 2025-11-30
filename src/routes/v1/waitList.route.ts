import express from "express";
import UserController from "../../features/account/controller/user.controller";
import multer from "multer";
import WaitListController from "../../features/account/controller/waitList.controller";

const waitListRouter = express.Router();

waitListRouter.get(
  "/welcome",
  (req: express.Request, res: express.Response) => {
    res.send("Welcome to waitList API v1");
  }
);

waitListRouter.get("/", WaitListController.getWaitLists);
waitListRouter.post("/", WaitListController.createUser);

export default waitListRouter;
