import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReceiptList } from "@/features/admin/inventory/ReceiptList";
import { json, mockFetch, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ search: "status=DRAFT" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/admin/inventory/receipts",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
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
