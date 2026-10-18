"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function useOrders(page: number) {
  return useQuery({
    queryKey: queryKeys.orders(page),
    queryFn: () => unwrap(api.GET("/api/v1/orders/me", { params: { query: { page, pageSize: 10 } } })),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: async () => (await unwrap(api.GET("/api/v1/orders/me/{id}", { params: { path: { id } } }))).data,
  });
}

export function useCancelOrder(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.POST("/api/v1/orders/me/{id}/cancel", { params: { path: { id } } })),
    onSuccess: (body) => qc.setQueryData(queryKeys.order(id), body.data),
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.order(id) }),
        qc.invalidateQueries({ queryKey: queryKeys.ordersAll }),
        qc.invalidateQueries({ queryKey: queryKeys.me }),
      ]),
  });
}
