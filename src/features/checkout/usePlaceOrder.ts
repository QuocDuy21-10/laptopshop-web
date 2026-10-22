"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { ReceiverInput } from "./schema";

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, receiver, couponCode, pricingFingerprint }: { key: string; receiver: ReceiverInput; couponCode?: string; pricingFingerprint: string }) => {
      const fingerprint = pricingFingerprint || (await unwrap(api.POST("/api/v1/orders/quote", { body: couponCode ? { couponCode } : {} }))).data.pricingFingerprint;
      return unwrap(api.POST("/api/v1/orders", { params: { header: { "Idempotency-Key": key } }, body: { ...receiver, couponCode, pricingFingerprint: fingerprint } }));
    },
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.cart }),
        qc.invalidateQueries({ queryKey: queryKeys.me }),
        qc.invalidateQueries({ queryKey: queryKeys.ordersAll }),
      ]),
  });
}
