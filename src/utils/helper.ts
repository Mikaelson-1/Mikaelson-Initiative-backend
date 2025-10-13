import { Habit } from "../generated/prisma";

export const canSendReminder = (task: Habit, cooldownMinutes = 10) => {
  if (!task.lastReminderSentAt) return true;
  const cooldown = new Date(Date.now() - cooldownMinutes * 60 * 1000);
  return task.lastReminderSentAt < cooldown;
};