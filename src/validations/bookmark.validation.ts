import * as z from "zod";

export const createBookmarkValidation = z.object({
  userId: z.string().min(1, {
    message: "userId is required!",
  }),
  postId: z.string().min(1, {
    message: "postId is required!",
  }),
});

export type createBookmarkType = z.infer<typeof createBookmarkValidation>;
