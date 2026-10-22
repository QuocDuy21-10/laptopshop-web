import { describe, expect, it } from "vitest";
import type { FlashSaleAllocation, FlashSaleAvailability, PromotionStats } from "@/lib/api/types";
import { errorMessage, ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

describe("Flash Sale API contract foundations", () => {
  it("exposes generated availability and admin allocation types", () => {
    const availability: FlashSaleAvailability = {
      productId: 1,
      promotionId: 42,
      name: "Flash",
      state: "RUNNING",
      available: true,
      remainingQuota: 3,
      maxUnitsPerUser: 1,
      startsAt: "2026-10-22T00:00:00.000Z",
      endsAt: "2026-10-23T00:00:00.000Z",
    };
    const allocation: FlashSaleAllocation = {
      id: 1,
      promotionId: 42,
      productId: 1,
      product: { id: 1, name: "Laptop" },
      user: { id: 7, username: "u@test.local", fullName: "U" },
      orderId: 9,
      orderStatus: "PENDING",
      orderDetailId: 11,
      quantity: 1,
      discountAmount: 200,
      status: "CLAIMED",
      createdAt: "2026-10-22T00:00:00.000Z",
      releasedAt: null,
      releaseReason: null,
    };
    const summary: Pick<PromotionStats, "totalQuota" | "claimedUnits"> = { totalQuota: 10, claimedUnits: 2 };
    expect(availability.available && allocation.status === "CLAIMED" && summary.totalQuota).toBeTruthy();
  });

  it("keeps Flash Sale query keys and Vietnamese quota errors stable", () => {
    expect(queryKeys.flashSaleAvailability([1, 2])).toEqual(["promotions", "flash-sale-availability", [1, 2]]);
    expect(queryKeys.adminPromotionAllocations(42, { page: 1 })).toEqual([
      "admin",
      "promotion-allocations",
      42,
      { page: 1 },
    ]);
    expect(errorMessage(new ApiError(409, "FLASH_SALE_QUOTA_EXCEEDED", "x"))).toContain("quota");
    expect(errorMessage(new ApiError(409, "FLASH_SALE_USER_LIMIT", "x"))).toContain("giới hạn");
  });
});
