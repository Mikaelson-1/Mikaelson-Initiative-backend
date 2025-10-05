import * as z from "zod";

export const createChallengeValidation = z.object({
  challenge: z.string().min(1, {
    message: "Challenge group name is required!",
  }),
  clerkId: z.string().min(1, {
    message: "clerkId is required!",
  }),
  days: z.number(),
});

export type createChallengeType = z.infer<typeof createChallengeValidation>;

export const updateChallengeValidation = z.object({
  challenge: z.string().min(1, {
    message: "Challenge group name is required!",
  }),
});

export type updateChallengeType = z.infer<typeof updateChallengeValidation>;
