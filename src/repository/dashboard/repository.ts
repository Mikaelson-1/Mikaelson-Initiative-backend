import { PrismaClient } from "@prisma/client";
import { IRepository } from "./repository.interface";
import prisma from "../../config/prismadb";
import { Prisma } from "../../generated/prisma";
import { getDay } from "../../utils/date";
import { logger } from "../../utils";

const { today, tomorrow } = getDay();

export class DashboardRepository<T> implements IRepository<T> {
  private readonly db: any;
  private readonly prismaClient: PrismaClient = prisma;

  constructor(db: any, prismaClient: PrismaClient = prisma) {
    this.db = db;
    this.prismaClient = prismaClient;
  }

  async create(data: any): Promise<T> {
    return this.db.create({ data });
  }

  async findById(id: string | number, type: string): Promise<T | null> {
    switch (type) {
      case "task":
        return this.prismaClient.habit.findUnique({
          where: {
            id: id as string,
          } satisfies Prisma.HabitWhereInput,
          include: {
            challenge: true,
            user: true,
          } satisfies Prisma.HabitInclude,
        } satisfies Parameters<typeof prisma.habit.findUnique>[0]) as Promise<T | null>;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async findAll(
    type: string,
    id?: string | number,
    id2?: string | number,
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      orderBy?: "asc" | "desc";
    }
  ): Promise<T[]> {
    switch (type) {
      // Get tasks created by a user
      case "userTasks":
        return this.prismaClient.habit.findMany({
          where: {
            user: {
              clerkId: id as string,
            },
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          } satisfies Prisma.HabitWhereInput,
          include: {
            challenge: true,
            user: true,
          } satisfies Prisma.HabitInclude,
        } satisfies Parameters<typeof prisma.habit.findMany>[0]) as Promise<
          T[]
        >;
      // Get every tasks created in the app
      case "tasks":
        return this.prismaClient.habit.findMany({
          include: {
            challenge: true,
            user: true,
          } satisfies Prisma.HabitInclude,
        } satisfies Parameters<typeof prisma.habit.findMany>[0]) as Promise<
          T[]
        >;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async findFirst(
    targetId: string | number,
    id: string | number,
    type?: string
  ): Promise<T | null> {
    return null;
  }

  async update(
    id: string | number,
    data?: Partial<T>,
    type?: string
  ): Promise<T | null> {
    switch (type) {
      case "task":
        return this.prismaClient.habit.update({
          where: {
            id: id as string,
          } satisfies Prisma.HabitWhereInput,
          data: data as Prisma.HabitUpdateInput,
        } satisfies Parameters<typeof prisma.habit.update>[0]) as Promise<T | null>;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async delete(id: string | number, type?: string): Promise<boolean> {
    try {
      logger.info(id);
      const result = await this.db.delete({
        where: {
          id: id as string,
        },
      });
      return result !== null;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }
}
