import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function usePricingQuote(couponCode?: string) {
  return useQuery({
    queryKey: [...queryKeys.promotionsAvailable, "quote", couponCode ?? ""],
    queryFn: () => unwrap(api.POST("/api/v1/orders/quote", { body: couponCode ? { couponCode } : {} })).then((result) => result.data),
  });
}
