import { describe, expect, it } from "vitest";
import type { components } from "@/lib/api/schema";
import type { Cart } from "@/lib/api/types";
import type { PricingQuote, PricedProduct, PromotionDetail, PublicPromotion } from "@/lib/api/types";
import { queryKeys } from "@/lib/api/query-keys";
import type { FlashSaleAllocation, FlashSaleAvailability, PromotionStats } from "@/lib/api/types";
import { ApiError, errorMessage } from "@/lib/api/errors";

describe("promotion API contracts", () => {
  it("exposes generated pricing and admin/public promotion fields", () => {
    const product = {} as PricedProduct;
    const quote = {} as PricingQuote;
    const publicPromotion = {} as PublicPromotion;
    const detail = {} as PromotionDetail;
    expect(product.salePrice).toBeUndefined();
    expect(quote.pricingFingerprint).toBeUndefined();
    expect(publicPromotion.code).toBeUndefined();
    expect(detail.lockedFields).toBeUndefined();
  });

  it("keeps promotion queries centralized", () => {
    expect(queryKeys.promotionsAvailable).toEqual(["promotions", "available"]);
    expect(queryKeys.adminPromotion(4)).toEqual(["admin", "promotion", 4]);
  });

  it("exposes Flash Sale availability, allocation and quota error contracts", () => {
    const availability = {} as FlashSaleAvailability;
    const allocation = {} as FlashSaleAllocation;
    const summary = {} as Pick<PromotionStats, "totalQuota" | "claimedUnits">;
    expect(availability).toBeDefined();
    expect(allocation).toBeDefined();
    expect(summary).toBeDefined();
    expect(queryKeys.flashSaleAvailability([1, 2])).toEqual(["promotions", "flash-sale-availability", [1, 2]]);
    expect(queryKeys.adminPromotionAllocations(42, { page: 1 })).toEqual(["admin", "promotion-allocations", 42, { page: 1 }]);
    expect(errorMessage(new ApiError(409, "FLASH_SALE_QUOTA_EXCEEDED", "x"))).toContain("quota");
    expect(errorMessage(new ApiError(409, "FLASH_SALE_USER_LIMIT", "x"))).toContain("giới hạn");
  });
});

describe("promotion fallback contract", () => {
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
    expect([promotion.eligibility, promotionFallback.reason]).toEqual(["POTENTIAL", "GLOBAL_AND_USER_QUOTA"]);
  });
});
