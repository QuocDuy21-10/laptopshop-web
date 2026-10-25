import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FlashSaleAvailability } from "@/features/promotions/FlashSaleAvailability";

const hook = vi.hoisted(() => ({ useFlashSaleAvailability: vi.fn() }));
vi.mock("@/features/promotions/hooks", () => hook);

const T0 = Date.parse("2026-10-22T00:00:00.000Z");
const response = (serverTime: number) => ({
  serverTime: new Date(serverTime).toISOString(),
  items: [
    {
      promotionId: 1,
      productId: 3,
      startsAt: new Date(T0 - 60_000).toISOString(),
      endsAt: new Date(T0 + 60_000).toISOString(),
      remainingQuota: 5,
    },
  ],
});
const result = (serverTime: number, refetch = vi.fn()) => ({ data: response(serverTime), dataUpdatedAt: Date.now(), refetch });

describe("FlashSaleAvailability", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(T0);
    hook.useFlashSaleAvailability.mockReset();
  });

  it("rebases the countdown on every availability response", () => {
    hook.useFlashSaleAvailability.mockReturnValue(result(T0));
    const { rerender } = render(<FlashSaleAvailability productIds={[3]} />);
    expect(screen.getByText("Còn 00:01:00")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(12_000));
    hook.useFlashSaleAvailability.mockReturnValue(result(T0 + 12_000));
    rerender(<FlashSaleAvailability productIds={[3]} />);
    expect(screen.getByText("Còn 00:00:48")).toBeInTheDocument();
  });

  it("ends the countdown after the tab was hidden past the boundary and refetches once", () => {
    const refetch = vi.fn();
    hook.useFlashSaleAvailability.mockReturnValue(result(T0, refetch));
    render(<FlashSaleAvailability productIds={[3]} />);

    act(() => vi.advanceTimersByTime(90_000));
    expect(screen.getByText("Đã kết thúc")).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
