"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: async () => (await unwrap(api.GET("/api/v1/admin/dashboard"))).data,
  });
}

export function useSales(range: { from: string; to: string }) {
  return useQuery({
    queryKey: queryKeys.adminSales(range),
    queryFn: async () => (await unwrap(api.GET("/api/v1/admin/dashboard/sales", { params: { query: range } }))).data,
    placeholderData: keepPreviousData,
  });
}
