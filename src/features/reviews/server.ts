import "server-only";
import { fetchPublic, freshServerApi } from "@/lib/api/server";
import { isApiError } from "@/lib/api/errors";
import type { PageMeta, PublicReview, ReviewSummary } from "@/lib/api/types";

export async function getInitialReviews(
  productId: number,
): Promise<{ summary: ReviewSummary; page: { data: PublicReview[]; meta: PageMeta } }> {
  try {
    const [summary, page] = await Promise.all([
      fetchPublic(freshServerApi.GET("/api/v1/products/{id}/reviews/summary", { params: { path: { id: productId } } })),
      fetchPublic(
        freshServerApi.GET("/api/v1/products/{id}/reviews", {
          params: { path: { id: productId }, query: { page: 1, pageSize: 10, sort: "newest" } },
        }),
      ),
    ]);
    return { summary: summary.data, page };
  } catch (error) {
    if (isApiError(error) && error.status === 404) throw error;
    return {
      summary: { productId, averageRating: null, totalReviews: 0, distribution: {} },
      page: { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } },
    };
  }
}
