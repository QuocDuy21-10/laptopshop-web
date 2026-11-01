import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewsletterSubscriberList } from "@/features/admin/newsletter/NewsletterSubscriberList";
import { json, mockFetch, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.push }),
  usePathname: () => "/admin/newsletter",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const subscriber = (id: number, over: Record<string, unknown> = {}) => ({
  id,
  email: `khach${id}@example.com`,
  status: "CONFIRMED",
  confirmedAt: "2026-10-02T03:00:00.000Z",
  unsubscribedAt: null,
  createdAt: "2026-10-01T03:00:00.000Z",
  ...over,
});

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  nav.search = "";
  nav.push.mockClear();
  fetchMock = mockFetch();
  fetchMock.mockImplementation(async () =>
    json(200, {
      data: [
        subscriber(1),
        subscriber(2, { status: "PENDING", confirmedAt: null }),
        subscriber(3, { status: "UNSUBSCRIBED", unsubscribedAt: "2026-10-05T03:00:00.000Z" }),
      ],
      meta: { page: 1, pageSize: 10, total: 3, totalPages: 1 },
    }),
  );
});

const listUrl = () =>
  fetchMock.mock.calls
    .map(([i]) => new URL((i as Request).url))
    .find((u) => u.pathname === "/api/v1/admin/newsletter/subscribers");

describe("NewsletterSubscriberList", () => {
  it("lists subscribers with Vietnamese status labels and defaults to confirmed", async () => {
    renderAdmin(<NewsletterSubscriberList />);
    expect(await screen.findByText("khach1@example.com")).toBeInTheDocument();
    const table = within(screen.getByRole("table"));
    expect(table.getByText("Đã xác nhận")).toBeInTheDocument();
    expect(table.getByText("Chờ xác nhận")).toBeInTheDocument();
    expect(table.getByText("Đã hủy")).toBeInTheDocument();
    expect(screen.queryByText("CONFIRMED")).not.toBeInTheDocument();
    expect(listUrl()?.searchParams.get("status")).toBe("CONFIRMED");
    expect(screen.getByRole("button", { name: "Xuất CSV" })).toBeInTheDocument();
  });

  it("asks for every status and hides the CSV export when 'Tất cả' is selected", async () => {
    nav.search = "status=ALL";
    renderAdmin(<NewsletterSubscriberList />);
    await screen.findByText("khach1@example.com");
    expect(listUrl()?.searchParams.has("status")).toBe(false);
    expect(screen.queryByRole("button", { name: "Xuất CSV" })).not.toBeInTheDocument();
    expect(screen.getByText("Chọn một trạng thái để xuất CSV")).toBeInTheDocument();
  });

  it("sends the status and search from the URL to the API", async () => {
    nav.search = "status=PENDING&q=khach&page=2";
    renderAdmin(<NewsletterSubscriberList />);
    await screen.findByText("khach1@example.com");
    const params = listUrl()!.searchParams;
    expect(params.get("status")).toBe("PENDING");
    expect(params.get("q")).toBe("khach");
    expect(params.get("page")).toBe("2");
  });

  it("puts the status filter in the URL", async () => {
    renderAdmin(<NewsletterSubscriberList />);
    await screen.findByText("khach1@example.com");
    await userEvent.click(screen.getByText("Chờ xác nhận", { selector: ".ant-segmented-item-label" }));
    expect(nav.push).toHaveBeenCalledWith("/admin/newsletter?status=PENDING");
  });

  it("puts the search in the URL", async () => {
    renderAdmin(<NewsletterSubscriberList />);
    await userEvent.type(screen.getByPlaceholderText("Tìm theo email"), "khach{Enter}");
    expect(nav.push).toHaveBeenCalledWith("/admin/newsletter?q=khach");
  });

  it("shows an error when loading fails", async () => {
    fetchMock.mockImplementation(async () => json(500, { error: { code: "INTERNAL_ERROR", message: "x" } }));
    renderAdmin(<NewsletterSubscriberList />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows an honest empty state", async () => {
    fetchMock.mockImplementation(async () =>
      json(200, { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }),
    );
    renderAdmin(<NewsletterSubscriberList />);
    expect(await screen.findByText("Chưa có đăng ký nào")).toBeInTheDocument();
  });
});
