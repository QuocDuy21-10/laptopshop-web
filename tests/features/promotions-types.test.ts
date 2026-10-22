import { describe, expect, it } from "vitest";
import type { PricingQuote, PricedProduct, PromotionDetail, PublicPromotion } from "@/lib/api/types";
import { queryKeys } from "@/lib/api/query-keys";

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
});
