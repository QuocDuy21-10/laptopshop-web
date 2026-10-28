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
  version: 2,
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

const postRequest = () =>
  fetchMock.mock.calls
    .map(([input]) => input)
    .find((input): input is Request => input instanceof Request && input.method === "POST");

describe("ReceiptDetail", () => {
  it("keeps unsaved edits across re-renders and blocks posting until saved", async () => {
    renderAdmin(<ReceiptDetail id={id} />);
    await userEvent.type(await screen.findByDisplayValue("ABC"), "XYZ");
    expect(screen.getByDisplayValue("ABCXYZ")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xác nhận nhập kho" })).toBeDisabled();
    expect(screen.getByText("Lưu bản nháp trước khi xác nhận")).toBeInTheDocument();
  });

  it("posts the version that was loaded", async () => {
    renderAdmin(<ReceiptDetail id={id} />);
    await screen.findByDisplayValue("ABC");
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận nhập kho" }));
    fetchMock.mockResolvedValueOnce(
      json(200, { data: { receipt: posted, movements: posted.movements, created: true } }),
    );
    await userEvent.click(screen.getAllByRole("button", { name: "Xác nhận nhập kho" }).at(-1)!);
    await waitFor(() => expect(postRequest()).toBeDefined());
    expect(await postRequest()!.json()).toEqual({ version: 2 });
  });

  it("reloads the receipt on a version conflict", async () => {
    renderAdmin(<ReceiptDetail id={id} />);
    await screen.findByDisplayValue("ABC");
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận nhập kho" }));
    fetchMock.mockResolvedValueOnce(
      json(409, {
        error: { code: "RECEIPT_VERSION_CONFLICT", message: "Stock receipt was modified" },
      }),
    );
    const before = fetchMock.mock.calls.length;
    await userEvent.click(screen.getAllByRole("button", { name: "Xác nhận nhập kho" }).at(-1)!);
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(before + 1));
    expect(
      await screen.findByText("Phiếu đã được người khác cập nhật. Đã tải lại bản mới nhất."),
    ).toBeInTheDocument();
  });

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
