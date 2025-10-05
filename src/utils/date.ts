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
  return { today, tomorrow };
};

export const countUniquePostDays = (posts: Post[]): number => {
  const daysSet = new Set<string>();
  for (const post of posts) {
    const [day] = new Date(post.createdAt).toISOString().split("T");
    daysSet.add(day);
  }
  return daysSet.size;
};
