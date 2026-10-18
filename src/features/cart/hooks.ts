"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: async () => (await unwrap(api.GET("/api/v1/cart"))).data,
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      unwrap(api.PATCH("/api/v1/cart/items/{id}", { params: { path: { id } }, body: { quantity } })),
    onSuccess: (body) => {
      qc.setQueryData(queryKeys.cart, body.data);
      void qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unwrap(api.DELETE("/api/v1/cart/items/{id}", { params: { path: { id } } })),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.cart }),
        qc.invalidateQueries({ queryKey: queryKeys.me }),
      ]),
  });
}
