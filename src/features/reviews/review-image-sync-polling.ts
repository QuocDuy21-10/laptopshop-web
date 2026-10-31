import type { ReviewImageSyncStatus } from "@/lib/api/types";
import { ApiError } from "@/lib/api/errors";

export type ReviewImagePollingBudget = {
  startedAt: number;
  attempts: number;
  nextAllowedAt: number;
};
export class ReviewImageStatusError extends ApiError {
  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
    public retryAfterMs?: number,
  ) {
    super(status, code, message, details);
  }
}
export function parseRetryAfter(value: string | null, now: number): number | undefined {
  if (!value?.trim()) return undefined;
  if (/^\d+$/.test(value.trim())) {
    const delay = Number(value) * 1000;
    return Number.isSafeInteger(delay) ? delay : undefined;
  }
  if (!/^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/i.test(value.trim()))
    return undefined;
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, date - now) : undefined;
}
export function nextReviewImageSyncDelay(
  budget: ReviewImagePollingBudget,
  status: ReviewImageSyncStatus | undefined,
  now: number,
): number | false {
  if (status?.status !== "PROCESSING" || budget.attempts >= 10 || now - budget.startedAt >= 180_000)
    return false;
  const hint = status.retryAfterMs;
  const backoff = Math.min(30_000, 2_000 * 2 ** Math.max(0, budget.attempts - 1));
  const wait =
    typeof hint === "number" && Number.isFinite(hint) && hint >= 0
      ? Math.max(2_000, Math.min(30_000, hint))
      : backoff;
  return Math.min(Math.max(wait, budget.nextAllowedAt - now), 180_000 - (now - budget.startedAt));
}
