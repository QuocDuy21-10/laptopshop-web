"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { sendMultipart, toFormData } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { paths } from "@/lib/api/schema";
import type { AdminHomeBanner } from "@/lib/api/types";

export type HomeBannerPlacement = "HERO" | "SIDE";
export type HomeBannerCreateBody = NonNullable<paths["/api/v1/admin/home-banners"]["post"]["requestBody"]>["content"]["application/json"];
export type HomeBannerPatchBody = NonNullable<paths["/api/v1/admin/home-banners/{id}"]["patch"]["requestBody"]>["content"]["application/json"];

export function useAdminHomeBanners(placement: HomeBannerPlacement) {
  return useQuery({
    queryKey: queryKeys.adminHomeBanners({ placement }),
    queryFn: async () =>
      (await unwrap(api.GET("/api/v1/admin/home-banners", { params: { query: { placement } } }))).data,
  });
}

export function useAdminHomeBanner(id: number) {
  return useQuery({
    queryKey: queryKeys.adminHomeBanner(id),
    queryFn: async () =>
      (await unwrap(api.GET("/api/v1/admin/home-banners/{id}", { params: { path: { id } } }))).data,
    enabled: id > 0,
  });
}

// admin mutations invalidate adminAll: every admin list and detail
function useInvalidateAdmin() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: queryKeys.adminAll });
}

export function useCreateHomeBanner() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: async (body: HomeBannerCreateBody) =>
      (await unwrap(api.POST("/api/v1/admin/home-banners", { body }))).data,
    onSuccess: invalidate,
  });
}

export function useUpdateHomeBanner(id: number) {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: async (body: HomeBannerPatchBody) =>
      (await unwrap(api.PATCH("/api/v1/admin/home-banners/{id}", { params: { path: { id } }, body }))).data,
    onSuccess: invalidate,
  });
}

export function useSetHomeBannerActive() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      unwrap(api.PATCH("/api/v1/admin/home-banners/{id}", { params: { path: { id } }, body: { isActive } })),
    onSuccess: invalidate,
  });
}

export function useDeleteHomeBanner() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: number) => unwrap(api.DELETE("/api/v1/admin/home-banners/{id}", { params: { path: { id } } })),
    onSuccess: invalidate,
  });
}

export function useUploadHomeBannerImage() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, file, imageAlt }: { id: number; file: File; imageAlt: string }) =>
      sendMultipart<{ data: AdminHomeBanner }>(`/api/v1/admin/home-banners/${id}/image`, "POST", toFormData({ imageAlt }, { image: file })),
    onSuccess: invalidate,
  });
}

export function useRemoveHomeBannerImage() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: (id: number) =>
      unwrap(api.DELETE("/api/v1/admin/home-banners/{id}/image", { params: { path: { id } } })),
    onSuccess: invalidate,
  });
}
