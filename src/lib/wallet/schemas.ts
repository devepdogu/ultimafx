import { z } from "zod";

export const reviewRequestSchema = z.object({
  id: z.string().min(1),
  adminNote: z.string().trim().max(500).optional(),
});
