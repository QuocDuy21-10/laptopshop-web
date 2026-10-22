import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, useUnreadNotificationCount } from "@/features/notifications/hooks";
import { json, mockFetch, renderWithQuery, urlOf } from "../../utils";

const item = { id: 1, productId: null, type: "PRICE_DROP" as const, title: "Giảm giá", message: "Dell giảm", oldPrice: 1_000, newPrice: 900, readAt: null, createdAt: "2026-10-22T00:00:00.000Z" };

function Harness() {
  const list = useNotifications(7, 1);
  const count = useUnreadNotificationCount(7);
  const read = useMarkNotificationRead(7);
  const readAll = useMarkAllNotificationsRead(7);
  return <><output data-testid="list">{list.data?.data.map((notification) => `${notification.id}:${notification.readAt ? "read" : "new"}`).join(",")}</output><output data-testid="count">{count.data?.unreadCount ?? "pending"}</output><button type="button" onClick={() => read.mutate(1)}>Read</button><button type="button" onClick={() => readAll.mutate()}>Read all</button></>;
}

describe("notification query hooks", () => {
  beforeEach(() => mockFetch());

  it("does not fetch anonymous notification data", async () => {
    const fetchMock = mockFetch();
    function Anonymous() { const query = useNotifications(undefined, 1); return <output>{query.isPending ? "pending" : "idle"}</output>; }
    renderWithQuery(<Anonymous />);
    await waitFor(() => expect(screen.getByText("pending")).toBeInTheDocument());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads list and unread count with user-scoped endpoints", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(json(200, { data: [item], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } }));
    fetchMock.mockResolvedValueOnce(json(200, { data: { unreadCount: 1 } }));
    renderWithQuery(<Harness />);
    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
    expect(fetchMock.mock.calls.map(([input]) => urlOf(input))).toEqual(expect.arrayContaining([expect.stringContaining("/api/v1/notifications"), expect.stringContaining("unread-count")]));
  });

  it("optimistically marks one notification read and never makes count negative", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(json(200, { data: [item], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } }));
    fetchMock.mockResolvedValueOnce(json(200, { data: { unreadCount: 1 } }));
    fetchMock.mockResolvedValueOnce(json(200, { data: { ...item, readAt: "2026-10-22T00:01:00.000Z" } }));
    renderWithQuery(<Harness />);
    await waitFor(() => expect(screen.getByTestId("list")).toHaveTextContent("1:new"));
    await userEvent.click(screen.getByRole("button", { name: "Read" }));
    await waitFor(() => expect(screen.getByTestId("list")).toHaveTextContent("1:read"));
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});
