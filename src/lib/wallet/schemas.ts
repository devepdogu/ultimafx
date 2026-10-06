import { z } from "zod";

export const depositRequestSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000),
});

export const withdrawalRequestSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000),
  destinationIban: z.string().trim().min(10).max(34),
  destinationBankName: z.string().trim().min(2).max(120),
  destinationAccountHolder: z.string().trim().min(2).max(120),
});

export const reviewRequestSchema = z.object({
  id: z.string().min(1),
  adminNote: z.string().trim().max(500).optional(),
});
