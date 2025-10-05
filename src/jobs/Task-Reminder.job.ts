import cron from "node-cron";
import { logger } from "../utils";
import { sendReminderEmail } from "../libs/email";
import prisma from "../config/prismadb";
import { getDay } from "../utils/date";

const { today } = getDay();

cron.schedule("0 * * * *", async () => {
  try {
    logger.info("Checking Incompleted Tasks reminder...");

    const now = new Date();

    const TwoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const SixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const TwelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const TwentyThreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000);

    const TwoHoursReminder = async () => {
      const tasks = await prisma.habit.findMany({
        where: {
          isCompleted: false,
          FirstReminder: false,
          createdAt: {
            gte: today,
            lte: TwoHoursAgo,
          },
        },
        include: {
          user: true,
        },
      });

      for (const task of tasks) {
        try {
          await sendReminderEmail(task.task, "2 hours", task.user.email);
          await prisma.habit.update({
            where: { id: task.id },
            data: { FirstReminder: true },
          });
          logger.info(`2-hour reminder sent for task ${task.id}`);
        } catch (error) {
          logger.error(
            `Failed to send 2-hour reminder for task ${task.id}:` + error
          );
        }
      }
    };

    const SixHoursReminder = async () => {
      const tasks = await prisma.habit.findMany({
        where: {
          isCompleted: false,
          FirstReminder: true, // Must have received first reminder
          SecondReminder: false,
          createdAt: {
            gte: today,
            lte: SixHoursAgo,
          },
        },
        include: {
          user: true,
        },
      });

      for (const task of tasks) {
        try {
          await sendReminderEmail(task.task, "6 hours", task.user.email);
          await prisma.habit.update({
            where: { id: task.id },
            data: { SecondReminder: true },
          });
          logger.info(`6-hour reminder sent for task ${task.id}`);
        } catch (error) {
          logger.error(
            `Failed to send 6-hour reminder for task ${task.id}:` + error
          );
        }
      }
    };

    const TwelveHoursReminder = async () => {
      const tasks = await prisma.habit.findMany({
        where: {
          isCompleted: false,
          SecondReminder: true, // Must have received second reminder
          ThirdReminder: false,
          createdAt: {
            gte: today,
            lte: TwelveHoursAgo,
          },
        },
        include: {
          user: true,
        },
      });

      for (const task of tasks) {
        try {
          await sendReminderEmail(task.task, "12 hours", task.user.email);
          await prisma.habit.update({
            where: { id: task.id },
            data: { ThirdReminder: true },
          });
          logger.info(`12-hour reminder sent for task ${task.id}`);
        } catch (error) {
          logger.error(
            `Failed to send 12-hour reminder for task ${task.id}:` + error
          );
        }
      }
    };

    const TwentyThreeHoursReminder = async () => {
      const tasks = await prisma.habit.findMany({
        where: {
          isCompleted: false,
          ThirdReminder: true, // Must have received third reminder
          FourthReminder: false,
          createdAt: {
            gte: today,
            lte: TwentyThreeHoursAgo,
          },
        },
        include: {
          user: true,
        },
      });

      for (const task of tasks) {
        try {
          await sendReminderEmail(task.task, "23 hours", task.user.email);
          await prisma.habit.update({
            where: { id: task.id },
            data: { FourthReminder: true },
          });
          logger.info(`23-hour reminder sent for task ${task.id}`);
        } catch (error) {
          logger.error(
            `Failed to send 23-hour reminder for task ${task.id}` + error
          );
        }
      }
    };

    await Promise.all([
      TwoHoursReminder(),
      SixHoursReminder(),
      TwelveHoursReminder(),
      TwentyThreeHoursReminder(),
    ]);

    logger.info("Reminder check completed");
  } catch (error) {
    logger.error("Error in reminder cron job:" + error);
  }
});
