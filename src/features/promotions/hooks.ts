"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function useFlashSaleAvailability(
  productIds: number[],
  options: { enabled?: boolean; intervalMs?: number } = {},
) {
  const [visible, setVisible] = useState(() => typeof document === "undefined" || document.visibilityState === "visible");
  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  const ids = [...new Set(productIds)].filter((id) => id > 0).sort((a, b) => a - b);
  const enabled = (options.enabled ?? true) && visible && ids.length > 0;
  return useQuery({
    queryKey: queryKeys.flashSaleAvailability(ids),
    enabled,
    queryFn: async () => (await unwrap(api.GET("/api/v1/promotions/flash-sales/availability", { params: { query: { productIds: ids } } }))).data,
    refetchInterval: enabled ? (options.intervalMs ?? 12_000) : false,
  });
}
