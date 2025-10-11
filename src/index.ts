import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import limiter from "./middleware/rate-limit";
import userRouter from "./routes/v1/user.route";
import { corsOptions, logger } from "./utils";
import postRouter from "./routes/v1/post.route";
import likeRouter from "./routes/v1/like.route";
import challengeRouter from "./routes/v1/challenge.route";
import commentRouter from "./routes/v1/comment.route";
import bookmarkRouter from "./routes/v1/bookmark.route";
import taskRouter from "./routes/v1/task.route";
import "./jobs/sendTaskReminders.job";
import { getHoursLeftToday } from "./utils/date";
import checkDbHealth from "./utils/dbhealth";

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(compression());

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(limiter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/posts", postRouter);

app.use("/api/v1/likes", likeRouter);

app.use("/api/v1/challenges", challengeRouter);

app.use("/api/v1/comments", commentRouter);

app.use("/api/v1/bookmarks", bookmarkRouter);

app.use("/api/v1/tasks", taskRouter);

const startServer = async () => {
  getHoursLeftToday();
  checkDbHealth();
  server.listen(PORT, () => logger.info(`Server is running at PORT ${PORT}`));
};

startServer();
