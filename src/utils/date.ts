import { Post } from "../generated/prisma";
import logger from "./logger";

export const getItemsCreatedToday = async <T extends { createdAt: Date }>(
  items: T[]
): Promise<T[] | any> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const filteredTodayPosts = items.filter((item) => {
    const itemDate = item.createdAt;
    logger.info(itemDate);
    return itemDate >= today && itemDate < tomorrow;
  });
  return filteredTodayPosts;
};

export const getDay = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return { today, tomorrow, yesterday };
};

export const countUniquePostDays = (posts: Post[]): number => {
  const daysSet = new Set<string>();
  for (const post of posts) {
    const [day] = new Date(post.createdAt).toISOString().split("T");
    daysSet.add(day);
  }
  return daysSet.size;
};

export const getHoursLeftToday = () => {
  const now = new Date();
  // Get the end of today (23:59:59)
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  // Calculate hours left
  const msLeft = endOfToday.getTime() - now.getTime(); // milliseconds left
  const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60)); // convert to hours
  logger.info(`${hoursLeft} hours to tomorrow`);

  return hoursLeft;
};
