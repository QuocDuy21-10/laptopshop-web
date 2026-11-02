import { z } from "zod";

// targetPrice only exists for TARGET_PRICE: a stale/NaN value left by a hidden field must not block PERCENT_DROP
export const priceAlertFormSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("PERCENT_DROP"), includeFlashSale: z.boolean().default(false) }),
  z.object({
    mode: z.literal("TARGET_PRICE"),
    targetPrice: z.number().int().positive(),
    includeFlashSale: z.boolean().default(false),
  }),
]);
export type PriceAlertForm = {
  mode: "PERCENT_DROP" | "TARGET_PRICE";
  targetPrice?: number;
  includeFlashSale: boolean;
};
