"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { paths } from "@/lib/api/schema";

export type AdminProductQuery = NonNullable<paths["/api/v1/admin/products"]["get"]["parameters"]["query"]>;

export function useAdminProducts(query: AdminProductQuery) {
  return useQuery({
    queryKey: queryKeys.adminProducts(query),
    queryFn: () => unwrap(api.GET("/api/v1/admin/products", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}

export function useProductFilterOptions() {
  return useQuery({
    queryKey: queryKeys.productFilters,
    staleTime: Infinity,
    queryFn: async () => (await unwrap(api.GET("/api/v1/products/filters"))).data,
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unwrap(api.DELETE("/api/v1/admin/products/{id}", { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}
