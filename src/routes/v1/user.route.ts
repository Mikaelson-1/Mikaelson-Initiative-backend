import express from "express";
import UserController from "../../features/account/controller/user.controller";
import multer from "multer";

const userRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

userRouter.get("/welcome", (req: express.Request, res: express.Response) => {
  res.send("Welcome to Users API v1");
});

userRouter.get("/top/contributors", UserController.getTopContributors);
userRouter.post("/", UserController.createUser);
userRouter.get("/", UserController.getUsers);
userRouter.post("/follow", UserController.followUser);
userRouter.post("/subscribe", UserController.subscirbeToUser);
userRouter.get("/:id/followers", UserController.getFollowers);
userRouter.get("/:id/followings", UserController.getFollowings);
userRouter.get("/:id/likes", UserController.getAllUserLikes);
userRouter.get("/:id/challenges", UserController.getChallengesYouArePartOf);
userRouter.get("/:id", UserController.getUserById);
userRouter.patch(
  "/:id",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  UserController.updateUser
);
userRouter.delete("/:id", UserController.deleteUser);

export default userRouter;
