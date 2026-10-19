"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { sendMultipart } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { paths } from "@/lib/api/schema";
import { ADMIN_PAGE_SIZE } from "../useListParams";

export type AdminUserQuery = NonNullable<paths["/api/v1/admin/users"]["get"]["parameters"]["query"]>;

export function useAdminUsers(query: Omit<AdminUserQuery, "pageSize">) {
  return useQuery({
    queryKey: queryKeys.adminUsers(query),
    queryFn: () => unwrap(api.GET("/api/v1/admin/users", { params: { query: { ...query, pageSize: ADMIN_PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: queryKeys.adminUser(id),
    queryFn: async () => (await unwrap(api.GET("/api/v1/admin/users/{id}", { params: { path: { id } } }))).data,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.adminRoles,
    staleTime: Infinity,
    queryFn: async () => (await unwrap(api.GET("/api/v1/admin/roles"))).data,
  });
}

export function useSaveUser(id?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) =>
      id ? sendMultipart(`/api/v1/admin/users/${id}`, "PATCH", form) : sendMultipart("/api/v1/admin/users", "POST", form),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unwrap(api.DELETE("/api/v1/admin/users/{id}", { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}
