"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { sendMultipart } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { CreateServiceRequestForm } from "./schema";

const requestKey = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
const invalidateCustomer = (client: ReturnType<typeof useQueryClient>, userId?: number, requestId?: number) => {
  if (!userId) return;
  void client.invalidateQueries({ queryKey: ["after-sales", userId] });
  if (requestId) void client.invalidateQueries({ queryKey: queryKeys.afterSalesRequest(userId, requestId) });
  void client.invalidateQueries({ queryKey: queryKeys.ordersAll });
  void client.invalidateQueries({ queryKey: queryKeys.notificationsAll(userId) });
};

export function useAfterSalesDevices(userId: number | undefined, type: "WARRANTY" | "TECHNICAL_SUPPORT", page = 1) {
  return useQuery({
    queryKey: queryKeys.afterSalesDevices(userId ?? 0, type, page),
    enabled: Boolean(userId),
    queryFn: () => unwrap(api.GET("/api/v1/after-sales/devices", { params: { query: { type, page, pageSize: 20 } } })),
  });
}

export function useAfterSalesRequests(userId: number | undefined, page = 1) {
  return useQuery({
    queryKey: queryKeys.afterSalesRequests(userId ?? 0, page),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
    queryFn: () => unwrap(api.GET("/api/v1/after-sales", { params: { query: { page, pageSize: 10 } } })),
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
  return useMutation({
    mutationFn: (body: CreateServiceRequestForm) => unwrap(api.POST("/api/v1/after-sales", { params: { header: { "Idempotency-Key": requestKey() } }, body })),
    onSuccess: (result) => invalidateCustomer(client, userId, (result.data as { id?: number }).id),
  });
}

export function useCancelAfterSalesItem(userId: number | undefined, requestId: number, itemId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: () => unwrap(api.POST("/api/v1/after-sales/{id}/items/{itemId}/cancel", { params: { path: { id: requestId, itemId } } })), onSuccess: () => invalidateCustomer(client, userId, requestId) });
}

export function useConfirmAfterSalesItem(userId: number | undefined, requestId: number, itemId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: () => unwrap(api.POST("/api/v1/after-sales/{id}/items/{itemId}/confirm", { params: { path: { id: requestId, itemId } } })), onSuccess: () => invalidateCustomer(client, userId, requestId) });
}

export function useDisputeAfterSalesItem(userId: number | undefined, requestId: number, itemId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body: { reason: "DEVICE_NOT_RECEIVED" | "ISSUE_PERSISTS"; note: string }) => unwrap(api.POST("/api/v1/after-sales/{id}/items/{itemId}/dispute-completion", { params: { path: { id: requestId, itemId } }, body })), onSuccess: () => invalidateCustomer(client, userId, requestId) });
}

export function useAfterSalesMessage(userId: number | undefined, requestId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (body: { itemId?: number; body: string }) => unwrap(api.POST("/api/v1/after-sales/{id}/messages", { params: { path: { id: requestId } }, body })), onSuccess: () => invalidateCustomer(client, userId, requestId) });
}

export function useUploadAfterSalesAttachments(userId: number | undefined, requestId: number, itemId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (files: File[]) => { const form = new FormData(); files.forEach((file) => form.append("images", file)); return sendMultipart<{ data: unknown[] }>(`/api/v1/after-sales/${requestId}/items/${itemId}/attachments`, "POST", form); }, onSuccess: () => invalidateCustomer(client, userId, requestId) });
}

export function useDecideAfterSalesQuote(userId: number | undefined, requestId: number, itemId: number, quoteId: number) {
  const client = useQueryClient();
  return useMutation({ mutationFn: (decision: "ACCEPT" | "DECLINE") => unwrap(api.POST("/api/v1/after-sales/{id}/items/{itemId}/quotes/{quoteId}/decision", { params: { path: { id: requestId, itemId, quoteId } }, body: { decision } })), onSuccess: () => invalidateCustomer(client, userId, requestId) });
}

export function useAdminAfterSalesRequests(query: Record<string, unknown> = {}) {
  return useQuery({ queryKey: queryKeys.adminAfterSales(query), placeholderData: keepPreviousData, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales", { params: { query } as never })) });
}
export function useAdminAfterSalesRequest(id: number) { return useQuery({ queryKey: queryKeys.adminAfterSalesRequest(id), queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/{id}", { params: { path: { id } } })) }); }
export function useAdminAfterSalesSummary() { return useQuery({ queryKey: queryKeys.adminAfterSalesSummary, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/summary")) }); }
export function useAdminAfterSalesAssignees() { return useQuery({ queryKey: queryKeys.adminAfterSalesAssignees, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/assignees")) }); }
export function useAssignAfterSalesRequest(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: { assignedToId: number | null; expectedVersion: number }) => unwrap(api.PATCH("/api/v1/admin/after-sales/{id}/assign", { params: { path: { id } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAll }) }); }
export function useAdminAfterSalesStatus(id: number, itemId: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: Record<string, unknown>) => unwrap(api.PATCH("/api/v1/admin/after-sales/{id}/items/{itemId}/status", { params: { path: { id, itemId } }, body } as never)), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAll }) }); }
export function useAdminAfterSalesMessage(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: { itemId?: number; body: string }) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/messages", { params: { path: { id } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
export function useAdminAfterSalesNote(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: { itemId?: number; body: string }) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/notes", { params: { path: { id } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
export function useSendAfterSalesQuote(id: number, itemId: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: CreateQuoteInput) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/items/{itemId}/quotes", { params: { path: { id, itemId } }, body } as never)), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
export type CreateQuoteInput = { expectedVersion: number; validDays: number; note?: string; lines: Array<{ description: string; quantity: number; unitPrice: number }> };
