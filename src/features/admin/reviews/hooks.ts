"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { AdminReviewsQuery } from "@/lib/api/types";
import type { paths } from "@/lib/api/schema";
import { ADMIN_PAGE_SIZE } from "../useListParams";

export type ModerateReviewInput = NonNullable<paths["/api/v1/admin/reviews/{id}/moderation"]["patch"]["requestBody"]>["content"]["application/json"];

export function useAdminReviews(query: Omit<AdminReviewsQuery, "pageSize">) {
  return useQuery({ queryKey: queryKeys.adminReviews(query), queryFn: () => unwrap(api.GET("/api/v1/admin/reviews", { params: { query: { ...query, pageSize: ADMIN_PAGE_SIZE } } })), placeholderData: keepPreviousData });
}

export function useAdminReviewSummary() {
  return useQuery({ queryKey: queryKeys.adminReviewSummary, queryFn: async () => (await unwrap(api.GET("/api/v1/admin/reviews/summary"))).data });
}

export function useAdminReview(id: number) {
  return useQuery({ queryKey: queryKeys.adminReview(id), queryFn: async () => (await unwrap(api.GET("/api/v1/admin/reviews/{id}", { params: { path: { id } } }))).data });
}

export function useModerateReview(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ModerateReviewInput) => unwrap(api.PATCH("/api/v1/admin/reviews/{id}/moderation", { params: { path: { id } }, body })),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminAll });
      void qc.invalidateQueries({ queryKey: queryKeys.adminReview(id) });
      void qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
