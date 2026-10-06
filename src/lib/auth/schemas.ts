import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  password: z.string().min(8).max(200),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  tc: z.string().trim(),
  phone: z.string().trim(),
  password: z.string().min(8).max(200),
  passwordRepeat: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
