import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PublicPromotion } from "@/lib/api/types";

vi.mock("server-only", () => ({}));
const api = vi.hoisted(() => ({ homeGet: vi.fn(), freshGet: vi.fn() }));
vi.mock("@/lib/api/server", () => ({
  homeServerApi: { GET: api.homeGet },
  freshServerApi: { GET: api.freshGet },
  fetchPublic: vi.fn(),
}));
const { getPromoBarPromotion } = await import("@/features/promotions/server");
const now = Date.parse("2026-11-01T03:00:00.000Z");
const promotion = (id: number, endsAt = "2026-11-02T03:00:00.000Z"): PublicPromotion => ({
  id, endsAt, name: "Ưu đãi", description: null, code: `SAVE${id}`, scope: "ORDER",
  discountKind: "PERCENT", discountValue: 10, minOrderValue: 0, maxDiscount: null,
  startsAt: "2026-10-31T03:00:00.000Z",
});
const ok = (items: PublicPromotion[]) => ({ data: { data: items }, response: new Response(null, { status: 200 }) });

beforeEach(() => vi.resetAllMocks());

describe("getPromoBarPromotion", () => {
  it("selects the earliest active coupon without reordering API data", async () => {
    const later = promotion(1, "2026-11-03T03:00:00.000Z");
    const first = promotion(2);
    const items = [later, first, promotion(3)];
    api.homeGet.mockResolvedValue(ok(items));
    expect(await getPromoBarPromotion(now)).toEqual(first);
    expect(items.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(api.homeGet).toHaveBeenCalledWith("/api/v1/promotions/available");
    expect(api.freshGet).not.toHaveBeenCalled();
  });

  it("ignores expired, future and malformed cached coupons", async () => {
    api.homeGet.mockResolvedValue(ok([
      promotion(1, "2026-11-01T03:00:00.000Z"),
      { ...promotion(2), startsAt: "2026-11-02T00:00:00.000Z" },
      promotion(3, "invalid"),
      { ...promotion(4), startsAt: "invalid" },
      promotion(5),
    ]));
    expect((await getPromoBarPromotion(now))?.id).toBe(5);
  });

  it("returns null when no coupon remains active", async () => {
    api.homeGet.mockResolvedValue(ok([promotion(1, "2026-10-31T00:00:00Z")]));
    expect(await getPromoBarPromotion(now)).toBeNull();
    api.homeGet.mockResolvedValue(ok([]));
    expect(await getPromoBarPromotion(now)).toBeNull();
  });

  it.each([404, 503])("isolates HTTP %s instead of turning the storefront into an error page", async (status) => {
    api.homeGet.mockResolvedValue({ response: new Response(null, { status }), error: {} });
    expect(await getPromoBarPromotion(now)).toBeNull();
  });

  it("isolates network failures and missing bodies", async () => {
    api.homeGet.mockRejectedValueOnce(new Error("offline"));
    expect(await getPromoBarPromotion(now)).toBeNull();
    api.homeGet.mockResolvedValue({ response: new Response(null, { status: 200 }) });
    expect(await getPromoBarPromotion(now)).toBeNull();
  });
});
