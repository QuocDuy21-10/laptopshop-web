import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReceiptForm } from "@/features/admin/inventory/ReceiptForm";
import { json, mockFetch, renderAdmin } from "../../utils";

const products = {
  data: [
    { id: 1, name: "ASUS TUF", price: 18_500_000, quantity: 5, image: null, isActive: true },
    { id: 2, name: "Dell XPS", price: 20_000_000, quantity: 3, image: null, isActive: true },
  ],
  meta: { page: 1, pageSize: 50, total: 2, totalPages: 1 },
};

describe("ReceiptForm", () => {
  it("adds/removes rows and shows quantity/value totals", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, products));
    renderAdmin(<ReceiptForm onSubmit={vi.fn()} submitting={false} />);
    await screen.findByLabelText("Sản phẩm 1");
    await userEvent.clear(screen.getByLabelText("Số lượng 1"));
    await userEvent.type(screen.getByLabelText("Số lượng 1"), "2");
    await userEvent.clear(screen.getByLabelText("Giá nhập 1"));
    await userEvent.type(screen.getByLabelText("Giá nhập 1"), "12000000");
    expect(screen.getByText("Tổng số lượng: 2")).toBeInTheDocument();
    expect(screen.getByText(/24\.000\.000/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Thêm sản phẩm" }));
    expect(screen.getByLabelText("Số lượng 2")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xóa dòng 2" }));
    expect(screen.queryByLabelText("Số lượng 2")).not.toBeInTheDocument();
  });

  it("submits trimmed fields and item values", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, products));
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderAdmin(<ReceiptForm onSubmit={onSubmit} submitting={false} />);
    await screen.findByLabelText("Sản phẩm 1");
    await userEvent.type(screen.getByLabelText("Nhà cung cấp"), "  ABC  ");
    await userEvent.type(screen.getByLabelText("Ghi chú"), "  Tháng 10  ");
    await userEvent.click(screen.getByLabelText("Sản phẩm 1"));
    await userEvent.click(screen.getByText("ASUS TUF"));
    await userEvent.clear(screen.getByLabelText("Số lượng 1"));
    await userEvent.type(screen.getByLabelText("Số lượng 1"), "2");
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      supplierName: "ABC",
      note: "Tháng 10",
      items: [{ productId: 1, quantity: 2, unitCost: undefined }],
    });
  });
});
