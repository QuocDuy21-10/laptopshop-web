import { describe, expect, it } from "vitest";
import type { components } from "@/lib/api/schema";
import type { Cart, PricingQuote } from "@/lib/api/types";

describe("promotion contract", () => {
  it("keeps flash-sale eligibility and combined quota fallback types available", () => {
    const promotion: NonNullable<components["schemas"]["PricedProduct"]["promotion"]> = {
      id: 4,
      name: "Flash Sale",
      endsAt: "2026-10-25T00:00:00.000Z",
      kind: "FLASH_SALE",
      eligibility: "POTENTIAL",
    };
    const promotionFallback: NonNullable<Cart["items"][number]["promotionFallback"]> = {
      skippedKind: "FLASH_SALE",
      promotionId: 4,
      reason: "GLOBAL_AND_USER_QUOTA",
      requestedQuantity: 2,
      availableQuantity: 0,
      appliedPromotionKind: "AUTOMATIC",
    };
    const quote: PricingQuote = {
      subtotal: 22_000_000,
      productDiscount: 2_000_000,
      couponEligibleSubtotal: 20_000_000,
      couponDiscount: 0,
      total: 20_000_000,
      lines: [{ promotionFallback }],
      coupon: null,
      calculatedAt: "2026-10-25T00:00:00.000Z",
      pricingFingerprint: "quote-1",
    };

    expect([promotion.eligibility, quote.lines[0].promotionFallback?.reason]).toEqual([
      "POTENTIAL",
      "GLOBAL_AND_USER_QUOTA",
    ]);
  });
});
