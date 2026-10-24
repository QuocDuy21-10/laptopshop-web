"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { paths } from "@/lib/api/schema";
import { ADMIN_PAGE_SIZE } from "../useListParams";

export type PaymentEventQuery = NonNullable<paths["/api/v1/admin/payment-events"]["get"]["parameters"]["query"]>;
export type PaymentReviewCaseQuery = NonNullable<paths["/api/v1/admin/payment-review-cases"]["get"]["parameters"]["query"]>;

export function usePaymentEvents(query: Omit<PaymentEventQuery, "pageSize">) {
  return useQuery({
    queryKey: queryKeys.adminPaymentEvents(query),
    queryFn: () => unwrap(api.GET("/api/v1/admin/payment-events", { params: { query: { ...query, pageSize: ADMIN_PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });
}

export function useResolvePaymentEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: string) => unwrap(api.POST("/api/v1/admin/payment-events/{id}/resolve", { params: { path: { id } }, body: { note } })),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function usePaymentReviewCases(query: Omit<PaymentReviewCaseQuery, "pageSize">) {
  return useQuery({
    queryKey: queryKeys.adminPaymentReviewCases(query),
    queryFn: () => unwrap(api.GET("/api/v1/admin/payment-review-cases", { params: { query: { ...query, pageSize: ADMIN_PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });
}

export function useExtendPaymentReviewCase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { note: string; holdUntil: string; version: number }) =>
      unwrap(api.POST("/api/v1/admin/payment-review-cases/{id}/extend", { params: { path: { id } }, body: input })),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function useReleasePaymentReviewCase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { note: string; confirmation: "RELEASE_STOCK"; version: number }) =>
      unwrap(api.POST("/api/v1/admin/payment-review-cases/{id}/release", { params: { path: { id } }, body: input })),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}
