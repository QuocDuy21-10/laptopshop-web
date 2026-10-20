import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ReceiptDetail } from "@/features/admin/inventory/ReceiptDetail";
import { json, mockFetch, renderAdmin } from "../../utils";

const id = "00000000-0000-4000-8000-000000000001";
const draft = {
  id,
  code: "PN-20261020-ABCDEF12",
  supplierName: "ABC",
  status: "DRAFT",
  note: "Nhập hàng",
  createdAt: "2026-10-20T03:00:00Z",
  postedAt: null,
  createdBy: { id: 99, name: "Admin" },
  postedBy: null,
  items: [
    {
      id: 1,
      productId: 1,
      productName: "ASUS TUF",
      image: null,
      isActive: true,
      quantity: 2,
      unitCost: 12_000_000,
    },
  ],
  movements: [],
};
const posted = {
  ...draft,
  status: "POSTED",
  postedAt: "2026-10-20T04:00:00Z",
  postedBy: { id: 99, name: "Admin" },
  movements: [
    {
      id: 7,
      productId: 1,
      productName: "ASUS TUF",
      delta: 2,
      balanceBefore: 0,
      balanceAfter: 2,
      orderId: null,
      receiptId: id,
      receiptCode: draft.code,
      actor: { id: 99, name: "Admin" },
      note: null,
      createdAt: "2026-10-20T04:00:00Z",
    },
  ],
};

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  fetchMock.mockImplementation(async (input) => {
    const url =
      typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();
    return url.includes("/admin/products")
      ? json(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } })
      : json(200, { data: draft });
  });
});

describe("ReceiptDetail", () => {
  it("renders draft editing and confirms post with totals", async () => {
    renderAdmin(<ReceiptDetail id={id} />);
    expect(await screen.findByDisplayValue("ABC")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Xác nhận nhập kho" }).at(-1)!);
    expect(screen.getByText(/1 dòng/)).toBeInTheDocument();
    expect(screen.getByText(/2 sản phẩm/)).toBeInTheDocument();
  });

  it("renders posted receipts read-only", async () => {
    fetchMock.mockResolvedValueOnce(json(200, { data: posted }));
    renderAdmin(<ReceiptDetail id={id} />);
    expect(await screen.findByText("Đã nhập kho")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xác nhận nhập kho" })).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("ABC")).not.toBeInTheDocument();
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(1);
  });

  it("shows unavailable item and refreshes after an invalid-status post", async () => {
    fetchMock.mockImplementationOnce(async (input) => {
      const url =
        typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();
      return url.includes("/admin/products")
        ? json(200, { data: [], meta: { page: 1, pageSize: 50, total: 0, totalPages: 0 } })
        : json(200, { data: { ...draft, items: [{ ...draft.items[0], isActive: false }] } });
    });
    renderAdmin(<ReceiptDetail id={id} />);
    expect(await screen.findByText("Sản phẩm không còn bán")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Xác nhận nhập kho" }).at(-1)!);
    fetchMock.mockResolvedValueOnce(
      json(409, { error: { code: "INVALID_RECEIPT_STATUS", message: "Receipt is not a draft" } }),
    );
    await userEvent.click(screen.getAllByRole("button", { name: "Xác nhận nhập kho" }).at(-1)!);
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(2));
  });
});
