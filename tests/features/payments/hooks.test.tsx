import { describe, expect, it } from "vitest";
import { paymentRefetchInterval, paymentRetry } from "@/features/payments/hooks";

const query = (over: Record<string, unknown> = {}) =>
  ({ state: { data: undefined, error: null, fetchFailureCount: 0 }, ...over }) as never;

describe("payment polling policy", () => {
  it.each([
    ["PENDING", 5_000],
    ["VERIFYING", 15_000],
    ["REVIEW_REQUIRED", 30_000],
  ] as const)("polls %s at its active interval", (status, expected) => {
    expect(paymentRefetchInterval(query({ state: { data: { status }, error: null, fetchFailureCount: 0 } }))).toBe(expected);
  });

  it("stops polling terminal payment states and terminal HTTP errors", () => {
    expect(paymentRefetchInterval(query({ state: { data: { status: "SUCCEEDED" }, error: null, fetchFailureCount: 0 } }))).toBe(false);
    expect(paymentRefetchInterval(query({ state: { data: undefined, error: { status: 404 }, fetchFailureCount: 2 } }))).toBe(false);
  });

  it("does not retry 401/403/404 but retries transient errors", () => {
    expect(paymentRetry(0, { status: 401 })).toBe(false);
    expect(paymentRetry(0, { status: 500 })).toBe(true);
    expect(paymentRetry(2, { status: 500 })).toBe(false);
  });
});
