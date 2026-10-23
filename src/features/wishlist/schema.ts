import { z } from "zod";

export const priceAlertFormSchema = z.object({
  mode: z.enum(["PERCENT_DROP", "TARGET_PRICE"]),
  targetPrice: z.number().int().positive().optional(),
  includeFlashSale: z.boolean().default(false),
});
export type PriceAlertForm = z.infer<typeof priceAlertFormSchema>;
