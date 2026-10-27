"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
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
  productId: number;
  generation: number;
  statusSnapshots: Array<{ key: readonly unknown[]; previous: WishlistStatus | undefined }>;
  summary: WishlistSummary | undefined;
  summaryDelta: number;
};

const statusSnapshots = (client: QueryClient, userId: number, productId: number) =>
  client
    .getQueriesData<WishlistStatus[]>({ queryKey: queryKeys.wishlistAll(userId) })
    .filter(([key]) => key[2] === "status")
    .map(([key, value]) => ({
      key,
      previous: value?.find((item) => item.productId === productId),
    }));

const listContainsProduct = (client: QueryClient, userId: number, productId: number) =>
  client
    .getQueriesData<WishlistPage>({ queryKey: queryKeys.wishlistAll(userId) })
    .some(([key, value]) => key[2] === "list" && value?.data.some((item) => item.productId === productId));

const patchStatus = (
  client: QueryClient,
  snapshots: Array<{ key: readonly unknown[]; previous: WishlistStatus | undefined }>,
  productId: number,
  isWishlisted: boolean,
) => {
  for (const { key } of snapshots) {
    const value = client.getQueryData<WishlistStatus[]>(key);
    client.setQueryData<WishlistStatus[]>(
      key,
      value?.some((item) => item.productId === productId)
        ? value.map((item) => (item.productId === productId ? { ...item, isWishlisted } : item))
        : [...(value ?? []), { productId, isWishlisted }].sort((a, b) => a.productId - b.productId),
    );
  }
};

const generationRegistry = new WeakMap<QueryClient, Map<string, number>>();

const nextGeneration = (client: QueryClient, userId: number, productId: number) => {
  const generations = generationRegistry.get(client) ?? new Map<string, number>();
  const key = `${userId}:${productId}`;
  const generation = (generations.get(key) ?? 0) + 1;
  generations.set(key, generation);
  generationRegistry.set(client, generations);
  return generation;
};

const currentGeneration = (client: QueryClient, userId: number, productId: number) =>
  generationRegistry.get(client)?.get(`${userId}:${productId}`) ?? 0;

const rollbackStatus = (
  client: QueryClient,
  snapshots: Array<{ key: readonly unknown[]; previous: WishlistStatus | undefined }>,
  productId: number,
) => {
  for (const { key, previous } of snapshots) {
    const value = client.getQueryData<WishlistStatus[]>(key) ?? [];
    client.setQueryData<WishlistStatus[]>(
      key,
      previous
        ? value.map((item) => (item.productId === productId ? previous : item))
        : value.filter((item) => item.productId !== productId),
    );
  }
};

const optimisticContext = (
  client: QueryClient,
  userId: number,
  productId: number,
  adding: boolean,
): WishlistOptimisticContext => {
  const snapshots = statusSnapshots(client, userId, productId);
  const previousStatus = snapshots.find(({ previous }) => previous !== undefined)?.previous;
  const wasWishlisted = previousStatus?.isWishlisted ?? listContainsProduct(client, userId, productId);
  const summary = client.getQueryData<WishlistSummary>(queryKeys.wishlistSummary(userId));
  const summaryDelta = summary && (adding ? !wasWishlisted : wasWishlisted) ? (adding ? 1 : -1) : 0;
  return {
    productId,
    generation: nextGeneration(client, userId, productId),
    statusSnapshots: snapshots,
    summary,
    summaryDelta,
  };
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
      if (userId === undefined) return { productId, generation: 0, statusSnapshots: [], summary: undefined, summaryDelta: 0 };
      await client.cancelQueries({ queryKey: queryKeys.wishlistAll(userId) });
      const context = optimisticContext(client, userId, productId, true);
      patchStatus(client, context.statusSnapshots, productId, true);
      if (context.summaryDelta) client.setQueryData(queryKeys.wishlistSummary(userId), { itemCount: context.summary!.itemCount + context.summaryDelta });
      return context;
    },
    onError: (_error, _productId, context) => {
      if (!context || userId === undefined) return;
      const isLatest = context.generation === currentGeneration(client, userId, context.productId);
      if (isLatest) {
        rollbackStatus(client, context.statusSnapshots, context.productId);
        if (context.summaryDelta) {
          const summary = client.getQueryData<WishlistSummary>(queryKeys.wishlistSummary(userId));
          if (summary) client.setQueryData(queryKeys.wishlistSummary(userId), { itemCount: Math.max(0, summary.itemCount - context.summaryDelta) });
        }
      }
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
      if (userId === undefined) return { productId, generation: 0, statusSnapshots: [], summary: undefined, summaryDelta: 0 };
      await client.cancelQueries({ queryKey: queryKeys.wishlistAll(userId) });
      const context = optimisticContext(client, userId, productId, false);
      patchStatus(client, context.statusSnapshots, productId, false);
      if (context.summaryDelta) client.setQueryData(queryKeys.wishlistSummary(userId), { itemCount: Math.max(0, context.summary!.itemCount + context.summaryDelta) });
      return context;
    },
    onError: (_error, _productId, context) => {
      if (!context || userId === undefined) return;
      const isLatest = context.generation === currentGeneration(client, userId, context.productId);
      if (isLatest) {
        rollbackStatus(client, context.statusSnapshots, context.productId);
        if (context.summaryDelta) {
          const summary = client.getQueryData<WishlistSummary>(queryKeys.wishlistSummary(userId));
          if (summary) client.setQueryData(queryKeys.wishlistSummary(userId), { itemCount: Math.max(0, summary.itemCount - context.summaryDelta) });
        }
      }
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
