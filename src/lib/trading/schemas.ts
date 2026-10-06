import { z } from "zod";

export const marketOrderSchema = z.object({
  assetId: z.string().min(1),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.coerce.number().positive().max(1_000_000_000),
});

export type MarketOrderInput = z.infer<typeof marketOrderSchema>;
