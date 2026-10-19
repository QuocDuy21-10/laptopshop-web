"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { OrderStatus } from "@/lib/api/types";
import { ADMIN_PAGE_SIZE } from "../useListParams";

export function useAdminOrders(query: { page: number; status?: OrderStatus }) {
  return useQuery({
    queryKey: queryKeys.adminOrders(query),
    queryFn: () => unwrap(api.GET("/api/v1/admin/orders", { params: { query: { ...query, pageSize: ADMIN_PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });
}

export function useAdminOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.adminOrder(id),
    queryFn: async () => (await unwrap(api.GET("/api/v1/admin/orders/{id}", { params: { path: { id } } }))).data,
  });
}

export function useChangeOrderStatus(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) =>
      unwrap(api.PATCH("/api/v1/admin/orders/{id}/status", { params: { path: { id } }, body: { status } })),
    // settled, not success: a 409 means our copy is stale, so refetch either way
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}
