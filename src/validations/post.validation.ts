import * as z from "zod";

export const createPostValidation = z.object({
  post: z
    .string()
    .max(500, {
      message: "Post is too long",
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  userId: z.string().min(1, {
    message: "userId is required!",
  }),
  challengeId: z.string().optional(),
});

export type createPostType = z.infer<typeof createPostValidation>;

export const updatePostValidation = z.object({
  post: z
    .string()
    .max(500, {
      message: "Post is too long",
    })
    .optional(),
  tags: z.array(z.string()).optional(),
});

export type updatePostType = z.infer<typeof updatePostValidation>;

export const repostValidation = z.object({
  postId: z.string().min(1, {
    message: "postId is required!",
  }),
  clerkId: z.string().min(1, {
    message: "clerkId is required!",
  }),
  post: z
    .string()
    .max(500, {
      message: "Post is too long",
    })
    .optional(),
});

export type repostType = z.infer<typeof repostValidation>;
