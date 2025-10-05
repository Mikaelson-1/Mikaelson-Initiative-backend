import * as z from "zod";

export const createCommentValidation = z.object({
  comment: z
    .string()
    .max(500, {
      message: "Post is too long",
    })
    .optional(),
  userId: z.string().min(1, {
    message: "userId is required!",
  }),
  postId: z.string().min(1, {
    message: "postId is required!",
  }),
});

export type createCommentType = z.infer<typeof createCommentValidation>;

export const updateCommentValidation = z.object({
  comment: z
    .string()
    .max(500, {
      message: "Post is too long",
    })
    .optional(),
});

export type updatecommentType = z.infer<typeof updateCommentValidation>;