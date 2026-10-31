import { expect, it } from "vitest";
import {
  nextReviewImageSyncDelay,
  parseRetryAfter,
} from "@/features/reviews/review-image-sync-polling";
const budget = { startedAt: 0, attempts: 1, nextAllowedAt: 0 };
const processing = {
  status: "PROCESSING" as const,
  reviewId: 18,
  expectedVersion: 0,
  retryable: true,
  updatedAt: "2026-10-31T00:00:00Z",
};
it.each([
  [0, 2000],
  [500, 2000],
  [120000, 30000],
])("clamps hint %i to %i ms", (hint, expected) => {
  expect(nextReviewImageSyncDelay(budget, { ...processing, retryAfterMs: hint }, 0)).toBe(expected);
});
it("backs off and stops at either limit", () => {
  expect(
    [1, 2, 3, 4, 5].map((attempts) =>
      nextReviewImageSyncDelay({ ...budget, attempts }, processing, 0),
    ),
  ).toEqual([2000, 4000, 8000, 16000, 30000]);
  expect(nextReviewImageSyncDelay({ ...budget, attempts: 10 }, processing, 0)).toBe(false);
  expect(nextReviewImageSyncDelay(budget, processing, 180000)).toBe(false);
  expect(nextReviewImageSyncDelay(budget, { ...processing, status: "WAITING_RETRY" }, 0)).toBe(
    false,
  );
});
it("parses Retry-After seconds and HTTP dates without accepting invalid input", () => {
  expect(parseRetryAfter("30", 0)).toBe(30000);
  expect(parseRetryAfter("Thu, 01 Jan 1970 00:01:00 GMT", 30000)).toBe(30000);
  expect(parseRetryAfter("nonsense", 0)).toBeUndefined();
});

it.each(["-1", "1.5", "9".repeat(400)])("ignores malformed Retry-After %s", (value) => {
  expect(parseRetryAfter(value, 0)).toBeUndefined();
});

it("schedules the final timeout at the deadline rather than beyond it", () => {
  expect(nextReviewImageSyncDelay(budget, processing, 179999)).toBe(1);
});
