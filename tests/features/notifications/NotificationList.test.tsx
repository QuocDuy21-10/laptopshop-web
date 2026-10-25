import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationList } from "@/features/notifications/NotificationList/NotificationList";
import type { InAppNotification } from "@/lib/api/types";
import { renderWithQuery } from "../../utils";

const read = vi.fn();
vi.mock("@/features/notifications/hooks", () => ({ useMarkNotificationRead: () => ({ mutateAsync: read, isPending: false }), useMarkAllNotificationsRead: () => ({ mutate: vi.fn(), isPending: false }) }));
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { error: toastError } }));

const item = { id: 1, productId: 3, type: "PRICE_DROP" as const, title: "Giảm giá", message: "Dell giảm", oldPrice: 1_000, newPrice: 900, readAt: null, createdAt: "2026-10-22T00:00:00.000Z" } as InAppNotification;

describe("NotificationList", () => {
  beforeEach(() => vi.clearAllMocks());
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

  it("renders pagination for notification pages beyond the first", () => {
    renderWithQuery(<NotificationList userId={7} items={[item]} unreadCount={1} page={1} totalPages={2} />);
    expect(screen.getByRole("link", { name: "Trang 2" })).toHaveAttribute("href", "/account/notifications?page=2");
  });

  it("deep-links after-sales notifications to the request", async () => {
    renderWithQuery(<NotificationList userId={7} items={[{ ...item, productId: null, serviceRequestId: 90 } as InAppNotification & { serviceRequestId: number }]} unreadCount={1} />);
    await userEvent.click(screen.getByRole("button", { name: /Dell giảm/i }));
    expect(push).toHaveBeenCalledWith("/account/after-sales/90");
  });

  it("navigates even when marking a product notification read fails", async () => {
    read.mockRejectedValueOnce(new Error("read failed"));
    renderWithQuery(<NotificationList userId={7} items={[item]} unreadCount={1} />);
    await userEvent.click(screen.getByRole("button", { name: /Dell giảm/i }));

    expect(push).toHaveBeenCalledWith("/products/3");
    await vi.waitFor(() => expect(toastError).toHaveBeenCalled());
  });

  it("navigates after-sales notifications even when read persistence fails", async () => {
    read.mockRejectedValueOnce(new Error("read failed"));
    const serviceItem = { ...item, productId: null, serviceRequestId: 90 } as InAppNotification & { serviceRequestId: number };
    renderWithQuery(<NotificationList userId={7} items={[serviceItem]} unreadCount={1} />);
    await userEvent.click(screen.getByRole("button", { name: /Dell giảm/i }));

    expect(push).toHaveBeenCalledWith("/account/after-sales/90");
  });
});
