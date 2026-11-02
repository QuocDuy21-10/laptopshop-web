"use client";

import { useRef } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { sendMultipart } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { CreateServiceRequestForm } from "./schema";
import type { CreateServiceRequestInput } from "./types";

const requestKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
const invalidateCustomer = (
  client: ReturnType<typeof useQueryClient>,
  userId?: number,
  requestId?: number,
) => {
  if (!userId) return;
  void client.invalidateQueries({ queryKey: ["after-sales", userId] });
  if (requestId)
    void client.invalidateQueries({ queryKey: queryKeys.afterSalesRequest(userId, requestId) });
  void client.invalidateQueries({ queryKey: queryKeys.ordersAll });
  void client.invalidateQueries({ queryKey: queryKeys.notificationsAll(userId) });
};

export function useAfterSalesDevices(
  userId: number | undefined,
  type: "WARRANTY" | "TECHNICAL_SUPPORT",
  page = 1,
) {
  return useQuery({
    queryKey: queryKeys.afterSalesDevices(userId ?? 0, type, page),
    enabled: Boolean(userId),
    queryFn: () =>
      unwrap(
        api.GET("/api/v1/after-sales/devices", { params: { query: { type, page, pageSize: 20 } } }),
      ),
  });
}
// the request form needs every eligible device, not one page of them
// shortcut: walks all pages up front; switch to an infinite list if accounts reach hundreds of devices
export function useAllAfterSalesDevices(
  userId: number | undefined,
  type: "WARRANTY" | "TECHNICAL_SUPPORT",
) {
  return useQuery({
    queryKey: queryKeys.afterSalesDevicesAll(userId ?? 0, type),
    enabled: Boolean(userId),
    queryFn: async () => {
      const first = await unwrap(
        api.GET("/api/v1/after-sales/devices", { params: { query: { type, page: 1, pageSize: 50 } } }),
      );
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, first.meta.totalPages - 1) }, (_, index) =>
          unwrap(
            api.GET("/api/v1/after-sales/devices", {
              params: { query: { type, page: index + 2, pageSize: 50 } },
            }),
          ),
        ),
      );
      return [first, ...rest].flatMap((page) => page.data);
    },
  });
}
export function useAfterSalesAttachments(
  userId: number | undefined,
  requestId: number,
  itemId: number,
) {
  return useQuery({
    queryKey: queryKeys.afterSalesAttachments(userId ?? 0, requestId, itemId),
    enabled: Boolean(userId && requestId && itemId),
    queryFn: () =>
      unwrap(
        api.GET("/api/v1/after-sales/{id}/items/{itemId}/attachments", {
          params: { path: { id: requestId, itemId } },
        }),
      ),
  });
}

export function useAfterSalesRequests(userId: number | undefined, page = 1) {
  return useQuery({
    queryKey: queryKeys.afterSalesRequests(userId ?? 0, page),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    queryFn: () =>
      unwrap(api.GET("/api/v1/after-sales", { params: { query: { page, pageSize: 10 } } })),
  });
}

export function useAfterSalesRequest(userId: number | undefined, id: number) {
  return useQuery({
    queryKey: queryKeys.afterSalesRequest(userId ?? 0, id),
    enabled: Boolean(userId && id),
    queryFn: () => unwrap(api.GET("/api/v1/after-sales/{id}", { params: { path: { id } } })),
  });
}

export function useCreateAfterSalesRequest(userId?: number) {
  const client = useQueryClient();
  // a retry of the same body (e.g. after a timeout that committed) must reuse its key or it duplicates
  const attempt = useRef<{ body: string; key: string } | null>(null);
  return useMutation({
    mutationFn: (body: CreateServiceRequestForm) => {
      const serialized = JSON.stringify(body);
      if (attempt.current?.body !== serialized) attempt.current = { body: serialized, key: requestKey() };
      return unwrap(
        api.POST("/api/v1/after-sales", {
          params: { header: { "Idempotency-Key": attempt.current.key } },
          body: body as CreateServiceRequestInput,
        }),
      );
    },
    onSuccess: (result) => {
      attempt.current = null;
      invalidateCustomer(client, userId, result.data.id);
    },
  });
}

export function useCancelAfterSalesItem(
  userId: number | undefined,
  requestId: number,
  itemId: number,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () =>
      unwrap(
        api.POST("/api/v1/after-sales/{id}/items/{itemId}/cancel", {
          params: { path: { id: requestId, itemId } },
        }),
      ),
    onSuccess: () => invalidateCustomer(client, userId, requestId),
  });
}

export function useConfirmAfterSalesItem(
  userId: number | undefined,
  requestId: number,
  itemId: number,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () =>
      unwrap(
        api.POST("/api/v1/after-sales/{id}/items/{itemId}/confirm", {
          params: { path: { id: requestId, itemId } },
        }),
      ),
    onSuccess: () => invalidateCustomer(client, userId, requestId),
  });
}

export function useDisputeAfterSalesItem(
  userId: number | undefined,
  requestId: number,
  itemId: number,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { reason: "DEVICE_NOT_RECEIVED" | "ISSUE_PERSISTS"; note: string }) =>
      unwrap(
        api.POST("/api/v1/after-sales/{id}/items/{itemId}/dispute-completion", {
          params: { path: { id: requestId, itemId } },
          body,
        }),
      ),
    onSuccess: () => invalidateCustomer(client, userId, requestId),
  });
}

export function useAfterSalesMessage(userId: number | undefined, requestId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { itemId?: number; body: string }) =>
      unwrap(
        api.POST("/api/v1/after-sales/{id}/messages", {
          params: { path: { id: requestId } },
          body,
        }),
      ),
    onSuccess: () => invalidateCustomer(client, userId, requestId),
  });
}

export function useUploadAfterSalesAttachments(
  userId: number | undefined,
  requestId: number,
  itemId: number,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ files, uploadKey }: { files: File[]; uploadKey: string }) => {
      const form = new FormData();
      files.forEach((file) => form.append("images", file));
      return sendMultipart<{ data: unknown[] }>(
        `/api/v1/after-sales/${requestId}/items/${itemId}/attachments`,
        "POST",
        form,
        { "Upload-Key": uploadKey },
      );
    },
    onSuccess: () => {
      invalidateCustomer(client, userId, requestId);
      void client.invalidateQueries({
        queryKey: queryKeys.afterSalesAttachments(userId ?? 0, requestId, itemId),
      });
    },
  });
}

export function useDecideAfterSalesQuote(
  userId: number | undefined,
  requestId: number,
  itemId: number,
  quoteId: number,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (decision: "ACCEPT" | "DECLINE") =>
      unwrap(
        api.POST("/api/v1/after-sales/{id}/items/{itemId}/quotes/{quoteId}/decision", {
          params: { path: { id: requestId, itemId, quoteId } },
          body: { decision },
        }),
      ),
    onSuccess: () => invalidateCustomer(client, userId, requestId),
  });
}
