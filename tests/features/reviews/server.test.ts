import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/errors";

vi.mock("server-only", () => ({}));
const get = vi.fn();
vi.mock("@/lib/api/server", () => ({
  freshServerApi: { GET: get },
  fetchPublic: vi.fn(async (promise: Promise<unknown>) => promise),
}));

const { getInitialReviews } = await import("@/features/reviews/server");

describe("getInitialReviews", () => {
  it("returns an empty snapshot when review service is temporarily unavailable", async () => {
    get.mockReturnValue(Promise.reject(new ApiError(503, "UNKNOWN", "down")));
    await expect(getInitialReviews(12)).resolves.toEqual({
      summary: { productId: 12, averageRating: null, totalReviews: 0, distribution: {} },
      page: { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } },
    });
  });

  it("preserves not-found behavior", async () => {
    get.mockReturnValue(Promise.reject(new ApiError(404, "NOT_FOUND", "missing")));
    await expect(getInitialReviews(12)).rejects.toMatchObject({ status: 404 });
  });
});
