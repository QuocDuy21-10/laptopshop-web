import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  readReviewImageSyncBudget,
  saveReviewImageSyncBudget,
  clearReviewImageSyncBudget,
} from "@/features/reviews/review-image-sync-budget";
const scope = { userId: 7, reviewId: 18 };
beforeEach(() => {
  clearReviewImageSyncBudget(scope, "key");
  clearReviewImageSyncBudget({ ...scope, userId: 8 }, "key");
  sessionStorage.clear();
});
afterEach(() => vi.restoreAllMocks());
it("does not regress an allowance or cooldown when an older request finishes late", () => {
  saveReviewImageSyncBudget(scope, "key", { startedAt: 100, attempts: 7, nextAllowedAt: 60000 });
  saveReviewImageSyncBudget(scope, "key", { startedAt: 200, attempts: 5, nextAllowedAt: 30000 });
  expect(readReviewImageSyncBudget(scope, "key")).toEqual({
    startedAt: 100,
    attempts: 7,
    nextAllowedAt: 60000,
  });
});
it("restores the same allowance from sessionStorage after module reload", async () => {
  saveReviewImageSyncBudget(scope, "key", { startedAt: 100, attempts: 10, nextAllowedAt: 60000 });
  vi.resetModules();
  const fresh = await import("@/features/reviews/review-image-sync-budget");
  try {
    expect(fresh.readReviewImageSyncBudget(scope, "key")).toEqual({
      startedAt: 100,
      attempts: 10,
      nextAllowedAt: 60000,
    });
  } finally {
    fresh.clearReviewImageSyncBudget(scope, "key");
  }
});
it("retains counters in memory if browser storage rejects a write", () => {
  const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("quota");
  });
  saveReviewImageSyncBudget(scope, "key", { startedAt: 100, attempts: 10, nextAllowedAt: 60000 });
  spy.mockRestore();
  expect(readReviewImageSyncBudget(scope, "key")?.attempts).toBe(10);
});
it("keeps account budgets isolated when one terminal operation is cleared", () => {
  saveReviewImageSyncBudget(scope, "key", { startedAt: 100, attempts: 7, nextAllowedAt: 0 });
  saveReviewImageSyncBudget({ ...scope, userId: 8 }, "key", {
    startedAt: 200,
    attempts: 2,
    nextAllowedAt: 5000,
  });
  clearReviewImageSyncBudget(scope, "key");
  expect(readReviewImageSyncBudget(scope, "key")).toBeUndefined();
  expect(readReviewImageSyncBudget({ ...scope, userId: 8 }, "key")).toEqual({
    startedAt: 200,
    attempts: 2,
    nextAllowedAt: 5000,
  });
});
