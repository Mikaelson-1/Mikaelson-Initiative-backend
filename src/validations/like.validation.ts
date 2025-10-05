import * as z from "zod";

export const createLikeValidation = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
  clerkId: z.string().min(1, {
    message: "clerkId required!",
  }),
});

export type createLikeType = z.infer<typeof createLikeValidation>;
