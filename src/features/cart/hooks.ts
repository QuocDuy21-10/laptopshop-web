"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: number; quantity: number }) =>
      unwrap(api.POST("/api/v1/cart/items", { body: input })),
    onSuccess: (body) => {
      qc.setQueryData(queryKeys.cart, body.data);
      void qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
