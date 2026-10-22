import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NotificationList } from "@/features/notifications/NotificationList/NotificationList";
import type { InAppNotification } from "@/lib/api/types";
import { renderWithQuery } from "../../utils";

const read = vi.fn();
vi.mock("@/features/notifications/hooks", () => ({ useMarkNotificationRead: () => ({ mutateAsync: read, isPending: false }), useMarkAllNotificationsRead: () => ({ mutate: vi.fn(), isPending: false }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const item = { id: 1, productId: 3, type: "PRICE_DROP" as const, title: "Giảm giá", message: "Dell giảm", oldPrice: 1_000, newPrice: 900, readAt: null, createdAt: "2026-10-22T00:00:00.000Z" } as InAppNotification;

describe("NotificationList", () => {
  it("marks a linked notification read and exposes unread semantics", async () => {
    renderWithQuery(<NotificationList userId={7} items={[item]} unreadCount={1} />);
    const notification = screen.getByRole("button", { name: /Dell giảm/i });
    expect(notification).toHaveAttribute("aria-label", expect.stringContaining("chưa đọc"));
    await userEvent.click(notification);
    expect(read).toHaveBeenCalledWith(1);
  });

  it("renders product-independent snapshots without a link", () => {
    renderWithQuery(<NotificationList userId={7} items={[{ ...item, productId: null }]} unreadCount={1} />);
    expect(screen.getByText("Dell giảm")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
