import "server-only";
import type { PublicPromotion } from "@/lib/api/types";
import { freshServerApi, fetchPublic, homeServerApi } from "@/lib/api/server";

export async function getPublicPromotions() {
  return (await fetchPublic(freshServerApi.GET("/api/v1/promotions/available"))).data;
}

export async function getPromoBarPromotion(nowMs = Date.now()): Promise<PublicPromotion | null> {
  try {
    const { data, error, response } = await homeServerApi.GET("/api/v1/promotions/available");
    if (!response.ok || error !== undefined || !data) return null;
    let selected: PublicPromotion | null = null;
    let earliestEnd = Infinity;
    for (const promotion of data.data) {
      const start = Date.parse(promotion.startsAt);
      const end = Date.parse(promotion.endsAt);
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > nowMs || end <= nowMs) continue;
      if (end < earliestEnd) {
        selected = promotion;
        earliestEnd = end;
      }
    }
    return selected;
  } catch {
    return null;
  }
}
