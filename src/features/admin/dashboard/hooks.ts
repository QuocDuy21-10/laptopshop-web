"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: async () => (await unwrap(api.GET("/api/v1/admin/dashboard"))).data,
  });
}
