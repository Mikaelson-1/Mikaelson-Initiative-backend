import "dotenv/config";
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
import notificationRouter from "./routes/v1/notification.route";
import "./jobs/sendTaskReminders.job";
import { getHoursLeftToday } from "./utils/date";
import checkDbHealth from "./utils/dbhealth";
import "./workers/notification.workers";
import "./workers/email.worker";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { setupSwagger } from "./swagger";
import waitListRouter from "./routes/v1/waitList.route";

const app = express();
const server = http.createServer(app);
const PORT = 5000;

app.use(compression());

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

app.use(cors(corsOptions) as any);

app.use(limiter);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API Documentation",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/v1/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/users", userRouter);

app.use("/api/v1/posts", postRouter);

app.use("/api/v1/likes", likeRouter);

app.use("/api/v1/challenges", challengeRouter);

app.use("/api/v1/comments", commentRouter);

app.use("/api/v1/bookmarks", bookmarkRouter);

app.use("/api/v1/tasks", taskRouter);

app.use("/api/v1/notifications", notificationRouter);

app.use("/api/v1/waitList", waitListRouter);

const startServer = async () => {
  getHoursLeftToday();
  checkDbHealth();
  console.log(new Date());
  server.listen(PORT, () => logger.info(`Server is running at PORT ${PORT}`));
};

startServer();
