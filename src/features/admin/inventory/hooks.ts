"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { paths } from "@/lib/api/schema";
import { ADMIN_PAGE_SIZE } from "../useListParams";

export type AdjustBody = NonNullable<paths["/api/v1/admin/inventory/adjustments"]["post"]["requestBody"]>["content"]["application/json"];
export type MovementQuery = NonNullable<paths["/api/v1/admin/inventory/movements"]["get"]["parameters"]["query"]>;

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdjustBody) => unwrap(api.POST("/api/v1/admin/inventory/adjustments", { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function useStockMovements(query: Omit<MovementQuery, "pageSize">) {
  return useQuery({
    queryKey: queryKeys.adminMovements(query),
    queryFn: () => unwrap(api.GET("/api/v1/admin/inventory/movements", { params: { query: { ...query, pageSize: ADMIN_PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });
}
