"use client";

import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ApiError, unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  ConfigurePriceAlertInput,
  WishlistItem,
  WishlistPage,
  WishlistStatus,
  WishlistSummary,
} from "@/lib/api/types";

export type WishlistOptimisticContext = {
  statusEntries: Array<[readonly unknown[], WishlistStatus[] | undefined]>;
  summary: WishlistSummary | undefined;
  listEntries: Array<[readonly unknown[], WishlistPage | undefined]>;
};

const statusEntries = (client: ReturnType<typeof useQueryClient>, userId: number) =>
  client
    .getQueriesData<WishlistStatus[]>({ queryKey: queryKeys.wishlistAll(userId) })
    .filter(([key, value]) => key[2] === "status" && Array.isArray(value));

const listEntries = (client: ReturnType<typeof useQueryClient>, userId: number) =>
  client
    .getQueriesData<WishlistPage>({ queryKey: queryKeys.wishlistAll(userId) })
    .filter(([key]) => key[2] === "list");

const patchStatus = (
  client: ReturnType<typeof useQueryClient>,
  entries: Array<[readonly unknown[], WishlistStatus[] | undefined]>,
  productId: number,
  isWishlisted: boolean,
) => {
  for (const [key, value] of entries) {
    if (!value) continue;
    client.setQueryData<WishlistStatus[]>(
      key,
      value.some((item) => item.productId === productId)
        ? value.map((item) => (item.productId === productId ? { ...item, isWishlisted } : item))
        : [...value, { productId, isWishlisted }].sort((a, b) => a.productId - b.productId),
    );
  }
};

export function useWishlist(userId: number | undefined, page: number): UseQueryResult<WishlistPage> {
  return useQuery({
    queryKey: userId ? queryKeys.wishlist(userId, page) : ["wishlist", "anonymous", page],
    enabled: userId !== undefined,
    queryFn: () => unwrap(api.GET("/api/v1/wishlist", { params: { query: { page, pageSize: 10 } } })),
  });
}

export function useWishlistSummary(userId: number | undefined): UseQueryResult<WishlistSummary> {
  return useQuery({
    queryKey: userId ? queryKeys.wishlistSummary(userId) : ["wishlist", "anonymous", "summary"],
    enabled: userId !== undefined,
    queryFn: async () => (await unwrap(api.GET("/api/v1/wishlist/summary"))).data,
  });
}

export function useWishlistStatus(userId: number | undefined, productIds: number[]): UseQueryResult<WishlistStatus[]> {
  const ids = [...new Set(productIds)].filter((id) => Number.isInteger(id) && id > 0).sort((a, b) => a - b);
  return useQuery({
    queryKey: userId ? queryKeys.wishlistStatus(userId, ids) : ["wishlist", "anonymous", "status", ids],
    enabled: userId !== undefined && ids.length > 0,
    queryFn: async () => (await unwrap(api.GET("/api/v1/wishlist/status", { params: { query: { productIds: ids } } }))).data,
  });
}

export function useAddWishlistItem(userId: number | undefined): UseMutationResult<
  { data: WishlistItem },
  ApiError,
  number,
  WishlistOptimisticContext
> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => unwrap(api.PUT("/api/v1/wishlist/items/{productId}", { params: { path: { productId } } })),
    onMutate: async (productId) => {
      if (userId === undefined) return { statusEntries: [], summary: undefined, listEntries: [] };
      await client.cancelQueries({ queryKey: queryKeys.wishlistAll(userId) });
      const context: WishlistOptimisticContext = {
        statusEntries: statusEntries(client, userId),
        summary: client.getQueryData<WishlistSummary>(queryKeys.wishlistSummary(userId)),
        listEntries: listEntries(client, userId),
      };
      patchStatus(client, context.statusEntries, productId, true);
      if (context.summary) client.setQueryData(queryKeys.wishlistSummary(userId), { itemCount: context.summary.itemCount + 1 });
      return context;
    },
    onError: (_error, _productId, context) => {
      if (!context || userId === undefined) return;
      for (const [key, value] of context.statusEntries) client.setQueryData(key, value);
      client.setQueryData(queryKeys.wishlistSummary(userId), context.summary);
      for (const [key, value] of context.listEntries) client.setQueryData(key, value);
    },
    onSettled: () => {
      if (userId !== undefined) void client.invalidateQueries({ queryKey: queryKeys.wishlistAll(userId) });
    },
  });
}

export function useRemoveWishlistItem(userId: number | undefined): UseMutationResult<
  void,
  ApiError,
  number,
  WishlistOptimisticContext
> {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (productId: number) => unwrap(api.DELETE("/api/v1/wishlist/items/{productId}", { params: { path: { productId } } })),
    onMutate: async (productId) => {
      if (userId === undefined) return { statusEntries: [], summary: undefined, listEntries: [] };
      await client.cancelQueries({ queryKey: queryKeys.wishlistAll(userId) });
      const context: WishlistOptimisticContext = {
        statusEntries: statusEntries(client, userId),
        summary: client.getQueryData<WishlistSummary>(queryKeys.wishlistSummary(userId)),
        listEntries: listEntries(client, userId),
      };
      patchStatus(client, context.statusEntries, productId, false);
      if (context.summary) client.setQueryData(queryKeys.wishlistSummary(userId), { itemCount: Math.max(0, context.summary.itemCount - 1) });
      return context;
    },
    onError: (_error, _productId, context) => {
      if (!context || userId === undefined) return;
      for (const [key, value] of context.statusEntries) client.setQueryData(key, value);
      client.setQueryData(queryKeys.wishlistSummary(userId), context.summary);
      for (const [key, value] of context.listEntries) client.setQueryData(key, value);
    },
    onSettled: () => {
      if (userId !== undefined) void client.invalidateQueries({ queryKey: queryKeys.wishlistAll(userId) });
    },
  });
}

export function useConfigurePriceAlert(userId: number | undefined) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, input }: { productId: number; input: ConfigurePriceAlertInput }) =>
      unwrap(api.PATCH("/api/v1/wishlist/items/{productId}", { params: { path: { productId } }, body: input })),
    onSuccess: () => {
      if (userId !== undefined) void client.invalidateQueries({ queryKey: queryKeys.wishlistAll(userId) });
    },
  });
}
