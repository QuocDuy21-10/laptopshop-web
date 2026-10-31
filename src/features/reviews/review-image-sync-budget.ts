import type { PendingSyncScope } from "./pending-image-sync";
import type { ReviewImagePollingBudget } from "./review-image-sync-polling";

type Scope = Pick<PendingSyncScope, "userId" | "reviewId">;
// Browser-only counters survive auth's QueryClient resets. Never stores tokens, Files or DTOs.
const memory = new Map<string, ReviewImagePollingBudget>();
const storageKey = (scope: Scope, key: string) =>
  `laptopshop:review-image-sync-budget:v1:${scope.userId}:${scope.reviewId}:${encodeURIComponent(key)}`;
function parseBudget(value: unknown): ReviewImagePollingBudget | undefined {
  if (
    !value ||
    typeof value !== "object" ||
    !("startedAt" in value) ||
    !("attempts" in value) ||
    !("nextAllowedAt" in value)
  )
    return;
  if (
    typeof value.startedAt !== "number" ||
    !Number.isFinite(value.startedAt) ||
    value.startedAt < 0 ||
    typeof value.attempts !== "number" ||
    !Number.isSafeInteger(value.attempts) ||
    value.attempts < 0 ||
    typeof value.nextAllowedAt !== "number" ||
    !Number.isFinite(value.nextAllowedAt) ||
    value.nextAllowedAt < 0
  )
    return;
  return {
    startedAt: value.startedAt,
    attempts: value.attempts,
    nextAllowedAt: value.nextAllowedAt,
  };
}
function mergeBudget(
  left: ReviewImagePollingBudget,
  right?: ReviewImagePollingBudget,
): ReviewImagePollingBudget {
  if (!right) return left;
  return {
    startedAt:
      left.attempts && right.attempts
        ? Math.min(left.startedAt, right.startedAt)
        : left.attempts
          ? left.startedAt
          : right.startedAt,
    attempts: Math.max(left.attempts, right.attempts),
    nextAllowedAt: Math.max(left.nextAllowedAt, right.nextAllowedAt),
  };
}
export function readReviewImageSyncBudget(
  scope: Scope,
  key: string,
): ReviewImagePollingBudget | undefined {
  if (typeof window === "undefined") return;
  const id = storageKey(scope, key);
  let stored: ReviewImagePollingBudget | undefined;
  try {
    const raw = window.sessionStorage.getItem(id);
    if (raw) stored = parseBudget(JSON.parse(raw));
  } catch {
    /* Memory remains available when browser storage is denied. */
  }
  const cached = memory.get(id);
  const value = cached ? mergeBudget(cached, stored) : stored;
  if (value) memory.set(id, value);
  return value;
}
export function saveReviewImageSyncBudget(
  scope: Scope,
  key: string,
  value: ReviewImagePollingBudget,
): ReviewImagePollingBudget {
  if (typeof window === "undefined") return value;
  const id = storageKey(scope, key);
  const merged = mergeBudget(value, readReviewImageSyncBudget(scope, key));
  memory.set(id, merged);
  try {
    window.sessionStorage.setItem(id, JSON.stringify(merged));
  } catch {
    /* Retain the allowance in memory across QueryClient resets. */
  }
  return merged;
}
export function clearReviewImageSyncBudget(scope: Scope, key: string): void {
  if (typeof window === "undefined") return;
  const id = storageKey(scope, key);
  memory.delete(id);
  try {
    window.sessionStorage.removeItem(id);
  } catch {
    /* Terminal status is already known. */
  }
}
