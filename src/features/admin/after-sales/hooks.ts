"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { sendMultipart } from "@/lib/api/multipart";
import { queryKeys } from "@/lib/api/query-keys";
import type { paths } from "@/lib/api/schema";
export type AdminAfterSalesQuery = { page?: number; pageSize?: number; type?: "WARRANTY" | "TECHNICAL_SUPPORT"; status?: "SUBMITTED" | "REVIEWING" | "IN_PROGRESS" | "AWAITING_CUSTOMER" | "PARTIALLY_COMPLETED" | "CLOSED"; itemStatus?: string; assigneeId?: number; q?: string; from?: string; to?: string };

export type AdminStatusBody = NonNullable<paths["/api/v1/admin/after-sales/{id}/items/{itemId}/status"]["patch"]["requestBody"]>["content"]["application/json"];
export type QuoteBody = NonNullable<paths["/api/v1/admin/after-sales/{id}/items/{itemId}/quotes"]["post"]["requestBody"]>["content"]["application/json"];
export type VerificationBody = NonNullable<paths["/api/v1/admin/after-sales/{id}/items/{itemId}/warranty-verifications"]["post"]["requestBody"]>["content"]["application/json"];

export function useAdminAfterSalesList(query: AdminAfterSalesQuery = {}) { return useQuery({ queryKey: queryKeys.adminAfterSales(query), placeholderData: keepPreviousData, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales", { params: { query } })) }); }
export function useAdminAfterSalesSummary() { return useQuery({ queryKey: queryKeys.adminAfterSalesSummary, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/summary")) }); }
export function useAdminAfterSalesRequest(id: number) { return useQuery({ queryKey: queryKeys.adminAfterSalesRequest(id), queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/{id}", { params: { path: { id } } })) }); }
export function useAdminAfterSalesAssignees() { return useQuery({ queryKey: queryKeys.adminAfterSalesAssignees, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/assignees")) }); }
export function useAssignAfterSalesRequest(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: { assignedToId: number | null; expectedVersion: number }) => unwrap(api.PATCH("/api/v1/admin/after-sales/{id}/assign", { params: { path: { id } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAll }) }); }
export function useAdminAfterSalesStatus(id: number, itemId: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: AdminStatusBody) => unwrap(api.PATCH("/api/v1/admin/after-sales/{id}/items/{itemId}/status", { params: { path: { id, itemId } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAll }) }); }
export function useAdminAfterSalesMessage(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: { itemId?: number; body: string }) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/messages", { params: { path: { id } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
export function useAdminAfterSalesNote(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: { itemId?: number; body: string }) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/notes", { params: { path: { id } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
export function useSendAfterSalesQuote(id: number, itemId: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: QuoteBody) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/items/{itemId}/quotes", { params: { path: { id, itemId } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
export function useCreateWarrantyVerification(id: number, itemId: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: VerificationBody) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/items/{itemId}/warranty-verifications", { params: { path: { id, itemId } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
export function useAdminAfterSalesAttachments(id: number, itemId: number) { return useQuery({ queryKey: ["admin", "after-sales", id, "items", itemId, "attachments"], queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/{id}/items/{itemId}/attachments", { params: { path: { id, itemId } } })) }); }
export function useUploadAdminAfterSalesAttachment(id: number, itemId: number) { const client = useQueryClient(); return useMutation({ mutationFn: ({ file, uploadKey }: { file: File; uploadKey: string }) => { const form = new FormData(); form.append("images", file); return sendMultipart(`/api/v1/admin/after-sales/${id}/items/${itemId}/attachments`, "POST", form, { "Upload-Key": uploadKey }); }, onSuccess: () => void client.invalidateQueries({ queryKey: ["admin", "after-sales", id, "items", itemId, "attachments"] }) }); }
