"use client";

import { useCallback, useEffect } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { PricingQuote } from "@/lib/api/types";

const isVisible = () => typeof document === "undefined" || document.visibilityState === "visible";

export function useCheckoutQuote(couponCode?: string): UseQueryResult<PricingQuote> {
  const quote = useQuery({
    queryKey: queryKeys.checkoutQuote(couponCode),
    queryFn: async () =>
      (await unwrap(api.POST("/api/v1/orders/quote", { body: couponCode ? { couponCode } : {} }))).data,
    staleTime: 0,
    refetchInterval: () => (isVisible() ? 12_000 : false),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const { refetch } = quote;
  const refetchWhenVisible = useCallback(() => {
    if (isVisible()) void refetch();
  }, [refetch]);

  useEffect(() => {
    window.addEventListener("focus", refetchWhenVisible);
    document.addEventListener("visibilitychange", refetchWhenVisible);
    return () => {
      window.removeEventListener("focus", refetchWhenVisible);
      document.removeEventListener("visibilitychange", refetchWhenVisible);
    };
  }, [refetchWhenVisible]);

  return quote;
}
