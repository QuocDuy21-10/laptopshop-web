import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FlashSaleCountdown } from "@/features/promotions/FlashSaleCountdown/FlashSaleCountdown";

describe("FlashSaleCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-22T00:00:00.000Z"));
  });

  it("uses server offset, transitions at the boundary and never displays negative time", () => {
    const onBoundary = vi.fn();
    render(
      <FlashSaleCountdown
        startsAt="2026-10-21T23:59:55.000Z"
        endsAt="2026-10-22T00:00:05.000Z"
        serverTime="2026-10-22T00:00:00.000Z"
        observedAt={Date.now()}
        onBoundary={onBoundary}
      />,
    );
    expect(screen.getByText("Còn 00:00:05")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(6_000));
    expect(screen.getByText("Đã kết thúc")).toBeInTheDocument();
    expect(onBoundary).toHaveBeenCalledTimes(1);
  });

  it("cleans up its one-second timer on unmount", () => {
    const spy = vi.spyOn(globalThis, "setInterval");
    const { unmount } = render(
      <FlashSaleCountdown
        startsAt="2026-10-22T00:00:10.000Z"
        endsAt="2026-10-22T00:01:00.000Z"
        serverTime="2026-10-22T00:00:00.000Z"
        observedAt={Date.now()}
      />,
    );
    unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
