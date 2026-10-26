"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { sendMultipart } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { HelpfulMutation, PageMeta, ProductReviewsQuery, PublicReview, ReviewImage, ReviewImageSyncResult, ReviewImageSyncStatus } from "@/lib/api/types";
import type { ReviewEligibility } from "@/lib/api/types";
import type { ReviewInput } from "./schema";
import type { DraftImage } from "./ReviewImagesEditor/ReviewImagesEditor";

export function useReviewSummary(productId: number) {
  return useQuery({
    queryKey: queryKeys.reviewSummary(productId),
    queryFn: async () => (await unwrap(api.GET("/api/v1/products/{id}/reviews/summary", { params: { path: { id: productId } } }))).data,
  });
}

export function useProductReviews(productId: number, query: ProductReviewsQuery) {
  return useQuery<{ data: PublicReview[]; meta: PageMeta }>({
    queryKey: queryKeys.productReviews(productId, query),
    queryFn: async () => (await unwrap(api.GET("/api/v1/products/{id}/reviews", { params: { path: { id: productId }, query } }))) as { data: PublicReview[]; meta: PageMeta },
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

function invalidateReviewQueries(queryClient: ReturnType<typeof useQueryClient>, productId: number, userId?: number, reviewId?: number) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.reviews(productId) });
  if (userId) void queryClient.invalidateQueries({ queryKey: queryKeys.reviewEligibility(productId, userId) });
  if (reviewId) void queryClient.invalidateQueries({ queryKey: queryKeys.reviewImages(reviewId) });
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

export function useAddReviewImages(productId: number, reviewId: number, userId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const form = new FormData();
      for (const file of files) form.append("images", file);
      const response = await sendMultipart<{ data: ReviewImage[] }>(`/api/v1/reviews/${reviewId}/images`, "POST", form);
      return response.data;
    },
    onSuccess: () => invalidateReviewQueries(queryClient, productId, userId, reviewId),
  });
}

export function useReorderReviewImages(productId: number, reviewId: number, userId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageIds: number[]) =>
      unwrap(api.PATCH("/api/v1/reviews/{id}/images/order", { params: { path: { id: reviewId } }, body: { imageIds } })),
    onSuccess: () => invalidateReviewQueries(queryClient, productId, userId, reviewId),
  });
}

export function useDeleteReviewImage(productId: number, reviewId: number, userId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) =>
      unwrap(api.DELETE("/api/v1/reviews/{id}/images/{imageId}", { params: { path: { id: reviewId, imageId } } })),
    onSuccess: () => invalidateReviewQueries(queryClient, productId, userId, reviewId),
  });
}

export type SyncReviewImagesInput = {
  reviewId: number;
  expectedVersion: number;
  idempotencyKey: string;
  items: readonly DraftImage[];
};

const syncManifest = (items: readonly DraftImage[]) => {
  let fileIndex = 0;
  return items.map((item) => {
    if (item.kind === "existing") return { kind: "existing" as const, clientId: item.clientId, imageId: item.image.id };
    return { kind: "new" as const, clientId: item.clientId, fileIndex: fileIndex++ };
  });
};

export function useSyncReviewImages(productId: number, userId?: number) {
  const queryClient = useQueryClient();
  return useMutation<ReviewImageSyncResult, Error, SyncReviewImagesInput>({
    mutationFn: async ({ reviewId, expectedVersion, idempotencyKey, items }) => {
      const form = new FormData();
      form.set("manifest", JSON.stringify({ expectedVersion, items: syncManifest(items) }));
      for (const item of items) if (item.kind === "new") form.append("files", item.file);
      const response = await sendMultipart<{ data: ReviewImageSyncResult }>(
        `/api/v1/reviews/${reviewId}/images/sync`,
        "PUT",
        form,
        { "Idempotency-Key": idempotencyKey },
      );
      return response.data;
    },
    onSuccess: (result) => invalidateReviewQueries(queryClient, productId, userId, result.reviewId),
  });
}

export function useReviewImageSyncStatus(reviewId: number, idempotencyKey?: string, enabled = true) {
  return useQuery<ReviewImageSyncStatus>({
    queryKey: queryKeys.reviewImageSync(reviewId, idempotencyKey ?? ""),
    enabled: Boolean(idempotencyKey) && enabled,
    queryFn: async () =>
      (await unwrap(api.GET("/api/v1/reviews/{id}/images/sync", {
        params: { path: { id: reviewId }, header: { "Idempotency-Key": idempotencyKey! } },
      }))).data,
  });
}

const uniqueReviewIds = (reviewIds: number[]) => [...new Set(reviewIds.filter((id) => id > 0))].sort((a, b) => a - b);

export function useHelpfulReviewIds(reviewIds: number[], userId?: number) {
  const ids = uniqueReviewIds(reviewIds);
  return useQuery<number[]>({
    queryKey: queryKeys.reviewHelpfulState(ids, userId ?? 0),
    enabled: Boolean(userId) && ids.length > 0,
    queryFn: async () => {
      const chunks: number[][] = [];
      for (let index = 0; index < ids.length; index += 50) chunks.push(ids.slice(index, index + 50));
      const responses = await Promise.all(
        chunks.map((chunk) => unwrap(api.GET("/api/v1/reviews/helpful", { params: { query: { reviewIds: chunk.join(",") } } }))),
      );
      return uniqueReviewIds(responses.flatMap((response) => response.data.reviewIds));
    },
  });
}

export function useToggleHelpful(reviewIds: number[], userId?: number) {
  const queryClient = useQueryClient();
  const ids = uniqueReviewIds(reviewIds);
  const key = queryKeys.reviewHelpfulState(ids, userId ?? 0);
  return useMutation<HelpfulMutation, Error, { reviewId: number; helpful: boolean }, { previous?: number[] }>({
    mutationFn: ({ reviewId, helpful }) =>
      helpful
        ? unwrap(api.PUT("/api/v1/reviews/{id}/helpful", { params: { path: { id: reviewId } } })).then((result) => result.data)
        : unwrap(api.DELETE("/api/v1/reviews/{id}/helpful", { params: { path: { id: reviewId } } })).then((result) => result.data),
    onMutate: async ({ reviewId, helpful }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<number[]>(key);
      queryClient.setQueryData<number[]>(key, (current) => {
        const currentIds = current ?? [];
        const nextIds = helpful ? [...new Set([...currentIds, reviewId])] : currentIds.filter((id) => id !== reviewId);
        return nextIds;
      });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) queryClient.setQueryData(key, context.previous);
      else queryClient.removeQueries({ queryKey: key, exact: true });
    },
    onSuccess: (result, { reviewId }) => {
      queryClient.setQueryData<number[]>(key, (current) => {
        const currentIds = current ?? [];
        return result.helpful ? [...new Set([...currentIds, reviewId])] : currentIds.filter((id) => id !== reviewId);
      });
      queryClient.setQueriesData({ queryKey: ["reviews"] }, (current: unknown) => {
        if (!current || typeof current !== "object" || !("data" in current) || !Array.isArray(current.data)) return current;
        return {
          ...current,
          data: current.data.map((review: { id?: number; helpfulCount?: number }) =>
            review.id === reviewId ? { ...review, helpfulCount: result.helpfulCount } : review,
          ),
        };
      });
      void queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
