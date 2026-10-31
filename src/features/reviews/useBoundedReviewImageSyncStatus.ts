"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { ApiError, toApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { ReviewImageSyncStatus } from "@/lib/api/types";
import type { PendingSyncScope } from "./pending-image-sync";
import {
  readReviewImageSyncBudget,
  saveReviewImageSyncBudget,
  clearReviewImageSyncBudget,
} from "./review-image-sync-budget";
import {
  nextReviewImageSyncDelay,
  parseRetryAfter,
  ReviewImageStatusError,
  type ReviewImagePollingBudget,
} from "./review-image-sync-polling";

const subscribeVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};
const isVisible = () => !document.hidden;
const hiddenOnServer = () => false;
class PollingStopped extends Error {}

export function useBoundedReviewImageSyncStatus({
  scope,
  idempotencyKey,
  enabled,
}: {
  scope: PendingSyncScope;
  idempotencyKey?: string;
  enabled: boolean;
}) {
  const client = useQueryClient();
  const visible = useSyncExternalStore(subscribeVisibility, isVisible, hiddenOnServer);
  const manual = useRef(false);
  const key = idempotencyKey ?? "";
  const queryKey = useMemo(
    () => queryKeys.reviewImageSyncForUser(scope.userId, scope.reviewId, key),
    [scope.userId, scope.reviewId, key],
  );
  const budgetKey = useMemo(
    () => queryKeys.reviewImageSyncBudget(scope.userId, scope.reviewId, key),
    [scope.userId, scope.reviewId, key],
  );
  const readBudget = (): ReviewImagePollingBudget =>
    client.getQueryData(budgetKey) ?? { startedAt: 0, attempts: 0, nextAllowedAt: 0 };
  const active = enabled && visible && Boolean(key) && scope.userId > 0 && scope.reviewId > 0;
  const query = useQuery<ReviewImageSyncStatus>({
    queryKey,
    enabled: active,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
    queryFn: async ({ signal }) => {
      const previous = readReviewImageSyncBudget(scope, key) ?? readBudget();
      const budget = previous.attempts ? previous : { ...previous, startedAt: Date.now() };
      const permit = manual.current;
      manual.current = false;
      client.setQueryDefaults(budgetKey, { gcTime: Infinity });
      client.setQueryData(budgetKey, budget);
      if (
        Date.now() < budget.nextAllowedAt ||
        (!permit && (budget.attempts >= 10 || Date.now() - budget.startedAt >= 180_000))
      )
        throw new PollingStopped("Đang tạm dừng kiểm tra ảnh.");
      const next = saveReviewImageSyncBudget(scope, key, {
        ...budget,
        attempts: budget.attempts + 1,
      });
      client.setQueryData(budgetKey, next);
      try {
        const result = await api.GET("/api/v1/reviews/{id}/images/sync", {
          params: { path: { id: scope.reviewId }, header: { "Idempotency-Key": key } },
          signal,
        });
        if (!result.response.ok) {
          const error = toApiError(result.response.status, result.error);
          const retryAfterMs = parseRetryAfter(
            result.response.headers.get("Retry-After"),
            Date.now(),
          );
          if (error.status === 429) {
            const blocked = saveReviewImageSyncBudget(scope, key, {
              ...next,
              nextAllowedAt: Date.now() + (retryAfterMs ?? 30_000),
            });
            client.setQueryData(budgetKey, blocked);
          }
          throw new ReviewImageStatusError(
            error.status,
            error.code,
            error.message,
            error.details,
            retryAfterMs,
          );
        }
        if (!result.data?.data)
          throw new ApiError(0, "INVALID_RESPONSE", "Không đọc được trạng thái ảnh.");
        return result.data.data;
      } catch (error) {
        if (error instanceof ApiError || signal.aborted) throw error;
        throw new ApiError(0, "NETWORK_ERROR", "Không thể kiểm tra trạng thái ảnh.");
      }
    },
    refetchInterval: (state) =>
      !active || state.state.error
        ? false
        : nextReviewImageSyncDelay(readBudget(), state.state.data, state.state.dataUpdatedAt),
  });
  useEffect(() => {
    if (!active) void client.cancelQueries({ queryKey, exact: true });
  }, [active, client, queryKey]);
  useEffect(() => {
    if (query.data?.status === "SUCCEEDED" || query.data?.status === "FAILED") {
      client.removeQueries({ queryKey: budgetKey, exact: true });
      clearReviewImageSyncBudget({ userId: scope.userId, reviewId: scope.reviewId }, key);
    }
  }, [query.data?.status, client, budgetKey, scope.userId, scope.reviewId, key]);
  const budget = readBudget();
  const timedOut =
    budget.attempts >= 10 ||
    query.error instanceof PollingStopped ||
    (budget.attempts > 0 && query.dataUpdatedAt - budget.startedAt >= 180_000);
  const checkAgain = async () => {
    if (
      !active ||
      Date.now() < readBudget().nextAllowedAt ||
      client.isFetching({ queryKey, exact: true })
    )
      return;
    manual.current = true;
    await query.refetch({ cancelRefetch: false });
  };
  return { ...query, timedOut, checkAgain };
}
