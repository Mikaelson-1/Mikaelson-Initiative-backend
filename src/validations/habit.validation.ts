import * as z from "zod";

export const createTaskValidation = z.object({
  task: z.string().max(500, {
    message: "Post is too long",
  }),
  description: z
    .string()
    .max(500, {
      message: "Post is too long",
    })
    .optional(),
  clerkId: z.string().min(1, {
    message: "userId is required!",
  }),
  challengeId: z.string().optional(),
  dueTime: z.date().optional(),
});

export type createTaskType = z.infer<typeof createTaskValidation>;

export const updateTaskValidation = z.object({
  task: z
    .string()
    .max(500, {
      message: "Post is too long",
    })
    .optional(),
  description: z
    .string()
    .max(500, {
      message: "Post is too long",
    })
    .optional(),
});

export type updateTaskType = z.infer<typeof updateTaskValidation>;
