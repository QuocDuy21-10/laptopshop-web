"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { paths } from "@/lib/api/schema";

export type PromotionCreateBody = NonNullable<paths["/api/v1/admin/promotions"]["post"]["requestBody"]>["content"]["application/json"];
export type PromotionUpdateBody = NonNullable<paths["/api/v1/admin/promotions/{id}"]["patch"]["requestBody"]>["content"]["application/json"];
export type PromotionQuery = NonNullable<paths["/api/v1/admin/promotions"]["get"]["parameters"]["query"]>;

export function useAdminPromotions(query: PromotionQuery) {
  return useQuery({
    queryKey: queryKeys.adminPromotions(query),
    queryFn: () => unwrap(api.GET("/api/v1/admin/promotions", { params: { query } })),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPromotion(id: number) {
  return useQuery({
    queryKey: queryKeys.adminPromotion(id),
    queryFn: () => unwrap(api.GET("/api/v1/admin/promotions/{id}", { params: { path: { id } } })),
    enabled: id > 0,
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PromotionCreateBody) => unwrap(api.POST("/api/v1/admin/promotions", { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function useUpdatePromotion(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PromotionUpdateBody) => unwrap(api.PATCH("/api/v1/admin/promotions/{id}", { params: { path: { id } }, body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}

export function useTransitionPromotion(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: "ACTIVATE" | "PAUSE" | "RESUME" | "END") => unwrap(api.PATCH("/api/v1/admin/promotions/{id}/state", { params: { path: { id } }, body: { action } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminAll }),
  });
}
