import "server-only";
import { fetchPublic, freshServerApi } from "@/lib/api/server";
import type { PageMeta, PublicReview, ReviewSummary } from "@/lib/api/types";

export async function getInitialReviews(
  productId: number,
): Promise<{ summary: ReviewSummary; page: { data: PublicReview[]; meta: PageMeta } }> {
  const [summary, page] = await Promise.all([
    fetchPublic(freshServerApi.GET("/api/v1/products/{id}/reviews/summary", { params: { path: { id: productId } } })),
    fetchPublic(
      freshServerApi.GET("/api/v1/products/{id}/reviews", {
        params: { path: { id: productId }, query: { page: 1, pageSize: 10, sort: "newest" } },
      }),
    ),
  ]);
  return { summary: summary.data, page };
}
