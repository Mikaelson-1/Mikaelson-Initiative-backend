import cron from "node-cron";
import { logger } from "../utils";
import { sendReminderEmail, sendTaskOverDueEmail } from "../libs/email";
import prisma from "../config/prismadb";
import { getDay } from "../utils/date";

/**  Here is a cron background job to send reminder emails to any user that his/her task 
 is not yet marked as completed within 24 hours */

const { today, tomorrow, yesterday } = getDay();
// Run every minute
cron.schedule("* * * * *", async () => {
  try {
    //logger.info("Checking Incompleted Tasks reminder....");
    const now = new Date();

    const TwoHoursAgo = new Date(Math.max(now.getTime() - 2 * 60 * 1000, now.getTime()));
    const SixHoursAgo = new Date(Math.max(now.getTime() - 6 * 60 * 1000, now.getTime()));
    const TwelveHoursAgo = new Date(Math.max(now.getTime() - 12 * 60 * 1000, now.getTime()));
    const TwentyThreeHoursAgo = new Date(Math.max(now.getTime() - 23 * 60 * 1000, now.getTime()));

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

      const tasksWithoutDueTime = tasks.filter((task) => !task.dueTime);

      for (const task of tasksWithoutDueTime) {
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

      const tasksWithoutDueTime = tasks.filter((task) => !task.dueTime);
      for (const task of tasksWithoutDueTime) {
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

      const tasksWithoutDueTime = tasks.filter((task) => !task.dueTime);

      for (const task of tasksWithoutDueTime) {
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

      const tasksWithoutDueTime = tasks.filter((task) => !task.dueTime);

      for (const task of tasksWithoutDueTime) {
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

    const sendEndOfDayOverdue = async () => {
      const now = new Date();
      const currentHour = now.getHours();

      // Only run between 11 PM and midnight
      if (currentHour !== 23) return;

      const tasks = await prisma.habit.findMany({
        where: {
          isCompleted: false,
          FourthReminder: true,
          DueTimeReminder: false,
          dueTime: null,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: { user: true },
      });

      for (const task of tasks) {
        try {
          await sendTaskOverDueEmail(task.task, today, task.user.email);
          await prisma.habit.update({
            where: { id: task.id },
            data: { DueTimeReminder: true },
          });
          logger.info(`End-of-day overdue sent for task ${task.id}`);
        } catch (error) {
          logger.error(
            `Failed to send end-of-day overdue for task ${task.id}: ${error}`
          );
        }
      }
    };

    const TasksWithDueTime = async () => {
      try {
        const tasks = await prisma.habit.findMany({
          where: {
            isCompleted: false,
            DueTimeReminder: false,
            createdAt: {
              gte: today,
              lte: tomorrow, // make sure tomorrow = start of next day
            },
          },
          include: { user: true },
        });

        const tasksWithDueTime = tasks.filter((task) => task.dueTime);

        const now = new Date();

        for (const task of tasksWithDueTime) {
          const dueTime = task.dueTime!;

          try {
            if (now >= dueTime) {
              // Task is overdue
              await sendTaskOverDueEmail(task.task, dueTime, task.user.email);
              await prisma.habit.update({
                where: { id: task.id },
                data: { DueTimeReminder: true },
              });
              logger.info(`Task is overdue: ${task.id} at ${dueTime}`);
            }
          } catch (error) {
            logger.error(
              `Failed to send reminder for task ${task.id}: ${error}`
            );
          }
        }
      } catch (error) {
        logger.error(`Error fetching tasks with dueTime: ${error}`);
      }
    };

    const TasksWithDueTimeTwoHoursToDue = async () => {
      try {
        const tasks = await prisma.habit.findMany({
          where: {
            isCompleted: false,
            DueTimeReminder: false,
            FirstReminder: false,
            SecondReminder: false,
            createdAt: {
              gte: today,
              lte: tomorrow, // make sure tomorrow = start of next day
            },
          },
          include: { user: true },
        });

        const tasksWithDueTime = tasks.filter((task) => task.dueTime);

        const now = new Date();

        for (const task of tasksWithDueTime) {
          const dueTime = task.dueTime!;
          // If duetime is 2:00PM, send a mail by 12:00PM
          const twoHoursBeforeDue = new Date(
            dueTime.getTime() - 2 * 60 * 60 * 1000
          );

          try {
            if (now >= twoHoursBeforeDue && now < dueTime) {
              // 2 hours before due
              await sendReminderEmail(
                task.task,
                "2 hours",
                task.user.email,
                task.id
              );
              await prisma.habit.update({
                where: { id: task.id },
                data: { FirstReminder: true },
              });

              logger.info(`2-hours before due reminder sent: ${task.id}`);
            }
          } catch (error) {
            logger.error(
              `Failed to send reminder for task ${task.id}: ${error}`
            );
          }
        }
      } catch (error) {
        logger.error(`Error fetching tasks with dueTime: ${error}`);
      }
    };

    const TasksWithDueTimeThirtyMinutesToDue = async () => {
      try {
        const tasks = await prisma.habit.findMany({
          where: {
            isCompleted: false,
            DueTimeReminder: false,
            FirstReminder: true,
            SecondReminder: false,
            createdAt: {
              gte: today,
              lte: tomorrow, // make sure tomorrow = start of next day
            },
          },
          include: { user: true },
        });

        const tasksWithDueTime = tasks.filter((task) => task.dueTime);

        const now = new Date();

        for (const task of tasksWithDueTime) {
          const dueTime = task.dueTime!;
          // If duetime is 2:00PM, send a mail by 1:30PM
          const thirtyMinsBeforeDue = new Date(
            dueTime.getTime() - 30 * 60 * 1000
          );

          try {
            if (now >= thirtyMinsBeforeDue && now < dueTime) {
              // 30 minutes before due
              await sendReminderEmail(
                task.task,
                "30 minutes",
                task.user.email,
                task.id
              );
              await prisma.habit.update({
                where: { id: task.id },
                data: { SecondReminder: true },
              });

              logger.info(`30 minutes before due reminder sent: ${task.id}`);
            }
          } catch (error) {
            logger.error(
              `Failed to send reminder for task ${task.id}: ${error}`
            );
          }
        }
      } catch (error) {
        logger.error(`Error fetching tasks with dueTime: ${error}`);
      }
    };

    await Promise.all([
      TwoHoursReminder(),
      SixHoursReminder(),
      TwelveHoursReminder(),
      TwentyThreeHoursReminder(),
      sendEndOfDayOverdue(),
      TasksWithDueTime(),
      TasksWithDueTimeTwoHoursToDue(),
      TasksWithDueTimeThirtyMinutesToDue(),
    ]);

    //logger.info("Reminder check completed");
  } catch (error) {
    logger.error("Error in reminder cron job:" + error);
  }
});
