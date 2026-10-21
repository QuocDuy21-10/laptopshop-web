"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { ProductReviewsQuery } from "@/lib/api/types";
import type { ReviewEligibility } from "@/lib/api/types";
import type { ReviewInput } from "./schema";

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
  return useQuery<ReviewEligibility>({
    queryKey: queryKeys.reviewEligibility(productId, userId ?? 0),
    enabled: Boolean(userId) && enabled,
    queryFn: async () =>
      (await unwrap(api.GET("/api/v1/products/{id}/reviews/eligibility", { params: { path: { id: productId } } }))).data as ReviewEligibility,
  });
}

function invalidateReviewQueries(queryClient: ReturnType<typeof useQueryClient>, productId: number, userId?: number) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.reviews(productId) });
  if (userId) void queryClient.invalidateQueries({ queryKey: queryKeys.reviewEligibility(productId, userId) });
}

export function useCreateReview(productId: number, userId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewInput) => unwrap(api.POST("/api/v1/products/{id}/reviews", { params: { path: { id: productId } }, body })),
    onSuccess: () => invalidateReviewQueries(queryClient, productId, userId),
  });
}

export function useUpdateReview(productId: number, reviewId: number, userId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ReviewInput>) => unwrap(api.PATCH("/api/v1/reviews/{id}", { params: { path: { id: reviewId } }, body })),
    onSuccess: () => invalidateReviewQueries(queryClient, productId, userId),
  });
}

export function useDeleteReview(productId: number, reviewId: number, userId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.DELETE("/api/v1/reviews/{id}", { params: { path: { id: reviewId } } })),
    onSuccess: () => invalidateReviewQueries(queryClient, productId, userId),
  });
}
