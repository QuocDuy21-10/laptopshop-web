"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function useAdminAfterSalesList(query: Record<string, unknown> = {}) { return useQuery({ queryKey: queryKeys.adminAfterSales(query), placeholderData: keepPreviousData, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales", { params: { query } as never })) }); }
export function useAdminAfterSalesSummary() { return useQuery({ queryKey: queryKeys.adminAfterSalesSummary, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/summary")) }); }
export function useAdminAfterSalesRequest(id: number) { return useQuery({ queryKey: queryKeys.adminAfterSalesRequest(id), queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/{id}", { params: { path: { id } } })) }); }
export function useAdminAfterSalesStatus(id: number, itemId: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: Record<string, unknown>) => unwrap(api.PATCH("/api/v1/admin/after-sales/{id}/items/{itemId}/status", { params: { path: { id, itemId } }, body } as never)), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAll }) }); }
export function useAdminAfterSalesMessage(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: { itemId?: number; body: string }) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/messages", { params: { path: { id } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
export function useAdminAfterSalesNote(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: { itemId?: number; body: string }) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/notes", { params: { path: { id } }, body })), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
export function useSendAfterSalesQuote(id: number, itemId: number) { const client = useQueryClient(); return useMutation({ mutationFn: (body: { expectedVersion: number; validDays: number; note?: string; lines: Array<{ description: string; quantity: number; unitPrice: number }> }) => unwrap(api.POST("/api/v1/admin/after-sales/{id}/items/{itemId}/quotes", { params: { path: { id, itemId } }, body } as never)), onSuccess: () => void client.invalidateQueries({ queryKey: queryKeys.adminAfterSalesRequest(id) }) }); }
