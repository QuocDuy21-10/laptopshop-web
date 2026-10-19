"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.paymentMethods,
    queryFn: async () => (await unwrap(api.GET("/api/v1/payments/methods"))).data,
    staleTime: 60_000,
  });
}

export function usePaymentStatus(orderId: number) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.payment(orderId),
    queryFn: async () => {
      const payment = (await unwrap(api.GET("/api/v1/orders/me/{id}/payment", { params: { path: { id: orderId } } }))).data;
      if (payment.status === "SUCCEEDED") {
        await Promise.all([
          qc.invalidateQueries({ queryKey: queryKeys.order(orderId) }),
          qc.invalidateQueries({ queryKey: queryKeys.ordersAll }),
        ]);
      }
      return payment;
    },
    enabled: Number.isSafeInteger(orderId) && orderId > 0,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && status !== "PENDING") return false;
      if (query.state.fetchFailureCount >= 3) return 30_000;
      if (query.state.fetchFailureCount >= 1) return 15_000;
      return 5_000;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
