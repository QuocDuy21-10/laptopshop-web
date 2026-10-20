"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { paths } from "@/lib/api/schema";
import { ADMIN_PAGE_SIZE } from "../useListParams";

export type AdjustBody = NonNullable<
  paths["/api/v1/admin/inventory/adjustments"]["post"]["requestBody"]
>["content"]["application/json"];
export type MovementQuery = NonNullable<
  paths["/api/v1/admin/inventory/movements"]["get"]["parameters"]["query"]
>;
export type ReceiptQuery = NonNullable<
  paths["/api/v1/admin/inventory/receipts"]["get"]["parameters"]["query"]
>;
export type ReceiptCreateBody = NonNullable<
  paths["/api/v1/admin/inventory/receipts"]["post"]["requestBody"]
>["content"]["application/json"];
export type ReceiptUpdateBody = NonNullable<
  paths["/api/v1/admin/inventory/receipts/{id}"]["patch"]["requestBody"]
>["content"]["application/json"];
export type AdjustInput = { body: AdjustBody; idempotencyKey: string };

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: AdjustInput) => {
      return unwrap(
        api.POST("/api/v1/admin/inventory/adjustments", {
          body,
          params: { header: { "Idempotency-Key": idempotencyKey } },
        }),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function useStockMovements(query: Omit<MovementQuery, "pageSize">) {
  return useQuery({
    queryKey: queryKeys.adminMovements(query),
    queryFn: () =>
      unwrap(
        api.GET("/api/v1/admin/inventory/movements", {
          params: { query: { ...query, pageSize: ADMIN_PAGE_SIZE } },
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function useReceipts(query: Omit<ReceiptQuery, "pageSize">) {
  return useQuery({
    queryKey: queryKeys.adminReceipts(query),
    queryFn: () =>
      unwrap(
        api.GET("/api/v1/admin/inventory/receipts", {
          params: { query: { ...query, pageSize: ADMIN_PAGE_SIZE } },
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

export function useReceipt(id: string) {
  return useQuery({
    queryKey: queryKeys.adminReceipt(id),
    queryFn: () =>
      unwrap(api.GET("/api/v1/admin/inventory/receipts/{id}", { params: { path: { id } } })),
    enabled: Boolean(id),
  });
}

export function useCreateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReceiptCreateBody) =>
      unwrap(api.POST("/api/v1/admin/inventory/receipts", { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function useUpdateReceipt(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReceiptUpdateBody) =>
      unwrap(
        api.PATCH("/api/v1/admin/inventory/receipts/{id}", { params: { path: { id } }, body }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function usePostReceipt(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      unwrap(api.POST("/api/v1/admin/inventory/receipts/{id}/post", { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}
