"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { ProductReviewsQuery } from "@/lib/api/types";

export function useReviewSummary(productId: number) {
  return useQuery({
    queryKey: queryKeys.reviewSummary(productId),
    queryFn: async () => (await unwrap(api.GET("/api/v1/products/{id}/reviews/summary", { params: { path: { id: productId } } }))).data,
  });
}

export function useProductReviews(productId: number, query: ProductReviewsQuery) {
  return useQuery({
    queryKey: queryKeys.productReviews(productId, query),
    queryFn: () => unwrap(api.GET("/api/v1/products/{id}/reviews", { params: { path: { id: productId }, query } })),
    placeholderData: keepPreviousData,
  });
}

export function useReviewEligibility(productId: number, userId?: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reviewEligibility(productId, userId ?? 0),
    enabled: Boolean(userId) && enabled,
    queryFn: async () =>
      (await unwrap(api.GET("/api/v1/products/{id}/reviews/eligibility", { params: { path: { id: productId } } }))).data,
  });
}
