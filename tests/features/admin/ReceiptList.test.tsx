import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { App } from "antd";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReceiptList } from "@/features/admin/inventory/ReceiptList";
import { json, mockFetch, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ search: "status=DRAFT", push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => "/admin/inventory/receipts",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  nav.push.mockClear();
  nav.replace.mockClear();
  fetchMock = mockFetch();
  fetchMock.mockResolvedValue(
    json(200, {
      data: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          code: "PN-20261020-ABCDEF12",
          supplierName: "Nhà cung cấp ABC",
          status: "DRAFT",
          note: null,
          createdAt: "2026-10-20T03:00:00Z",
          postedAt: null,
          createdBy: { id: 99, name: "Admin" },
          postedBy: null,
          itemCount: 2,
        },
        {
          id: "00000000-0000-4000-8000-000000000002",
          code: "PN-20261019-ABCDEF13",
          supplierName: "Nhà cung cấp XYZ",
          status: "POSTED",
          note: null,
          createdAt: "2026-10-19T03:00:00Z",
          postedAt: "2026-10-19T04:00:00Z",
          createdBy: { id: 99, name: "Admin" },
          postedBy: { id: 99, name: "Admin" },
          itemCount: 1,
        },
      ],
      meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
    }),
  );
});

describe("ReceiptList", () => {
  it("debounces the search and replaces history once", async () => {
    renderAdmin(<ReceiptList />);
    const input = screen.getByLabelText("Tìm phiếu nhập");
    fireEvent.change(input, { target: { value: "P" } });
    fireEvent.change(input, { target: { value: "PN" } });
    fireEvent.change(input, { target: { value: "PN-2026" } });
    expect(input).toHaveValue("PN-2026");
    await waitFor(() => expect(nav.replace).toHaveBeenCalledTimes(1));
    expect(nav.replace).toHaveBeenCalledWith(
      "/admin/inventory/receipts?status=DRAFT&q=PN-2026&page=1",
    );
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("shows the q from the URL after back/forward", async () => {
    nav.search = "q=old";
    const view = renderAdmin(<ReceiptList />);
    const input = screen.getByLabelText("Tìm phiếu nhập");
    expect(input).toHaveValue("old");
    nav.search = "q=older";
    view.rerender(
      <QueryClientProvider client={view.client}>
        <App>
          <ReceiptList />
        </App>
      </QueryClientProvider>,
    );
    try {
      await waitFor(() => expect(screen.getByLabelText("Tìm phiếu nhập")).toHaveValue("older"));
    } finally {
      nav.search = "status=DRAFT";
    }
  });

  it("renders receipt links, suppliers, item counts and statuses", async () => {
    renderAdmin(<ReceiptList />);
    expect(await screen.findByRole("link", { name: "PN-20261020-ABCDEF12" })).toHaveAttribute(
      "href",
      "/admin/inventory/receipts/00000000-0000-4000-8000-000000000001",
    );
    expect(screen.getByText("Nhà cung cấp ABC")).toBeInTheDocument();
    expect(screen.getByText("2 dòng")).toBeInTheDocument();
    expect(screen.getAllByText("Bản nháp").length).toBeGreaterThan(1);
    expect(screen.getByText("Đã nhập kho")).toBeInTheDocument();
    const url = new URL((fetchMock.mock.calls[0][0] as Request).url);
    expect(url.searchParams.get("status")).toBe("DRAFT");
  });

  it("shows Vietnamese empty state", async () => {
    fetchMock.mockResolvedValueOnce(
      json(200, { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }),
    );
    renderAdmin(<ReceiptList />);
    expect(await screen.findByText("Chưa có phiếu nhập")).toBeInTheDocument();
  });
});
