import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCheckoutQuote } from "@/features/checkout/useCheckoutQuote";
import { json, mockFetch, renderWithQuery } from "../utils";

function Harness({ couponCode }: { couponCode?: string }) {
  const quote = useCheckoutQuote(couponCode);
  return <output>{quote.data?.pricingFingerprint ?? "loading"}</output>;
}

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", { configurable: true, value: state });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useCheckoutQuote", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setVisibility("visible");
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("polls the quote every 12 seconds only while checkout is visible and refreshes on return", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(
      json(200, {
        data: {
          subtotal: 1,
          productDiscount: 0,
          couponEligibleSubtotal: 1,
          couponDiscount: 0,
          total: 1,
          lines: [],
          coupon: null,
          calculatedAt: "2026-10-25T00:00:00.000Z",
          pricingFingerprint: "quote-1",
        },
      }),
    );
    renderWithQuery(<Harness couponCode="SAVE10" />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText("quote-1")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(12_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      setVisibility("hidden");
      await vi.advanceTimersByTimeAsync(24_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      setVisibility("visible");
      await Promise.resolve();
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
