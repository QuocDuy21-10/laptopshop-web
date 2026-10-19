"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { sendMultipart, toFormData } from "@/lib/api/multipart";
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

export function useAdminProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.adminProduct(id),
    queryFn: async () => (await unwrap(api.GET("/api/v1/admin/products/{id}", { params: { path: { id } } }))).data,
  });
}

export function useSaveProduct(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) =>
      id
        ? sendMultipart(`/api/v1/admin/products/${id}`, "PATCH", form)
        : sendMultipart("/api/v1/admin/products", "POST", form),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function useSetProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      sendMultipart(`/api/v1/admin/products/${id}`, "PATCH", toFormData({ isActive: String(isActive) })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}
