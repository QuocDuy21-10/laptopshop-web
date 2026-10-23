"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function useAdminAfterSalesList(query: Record<string, unknown> = {}) { return useQuery({ queryKey: queryKeys.adminAfterSales(query), placeholderData: keepPreviousData, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales", { params: { query } as never })) }); }
export function useAdminAfterSalesSummary() { return useQuery({ queryKey: queryKeys.adminAfterSalesSummary, queryFn: () => unwrap(api.GET("/api/v1/admin/after-sales/summary")) }); }
