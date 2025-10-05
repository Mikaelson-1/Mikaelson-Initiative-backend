import * as z from "zod";

export const createUserValidation = z.object({
  username: z
    .string()
    .min(1, {
      message: "Username required!",
    })
    .max(30, {
      message: "Username is too long!",
    }),
  email: z.string().email({
    message: "Invalid email format!",
  }),
  clerkId: z.string().min(1, {
    message: "clerkId required!",
  }),
  profileImage: z.string().optional(),
  coverImage: z.string().optional(),
});

export type createUserType = z.infer<typeof createUserValidation>;

export const updateUserValidation = z.object({
  username: z.string().optional(),
  bio: z.string().optional(),
  uniqueName: z.string().optional(),
});

export type updateUserType = z.infer<typeof updateUserValidation>;

export const followUserValidation = z.object({
  clerkId: z.string().min(1, {
    message: "clerkId required!",
  }),
  userId: z.string().min(1, {
    message: "clerkId required!",
  }),
});

export type followUserType = z.infer<typeof followUserValidation>;
