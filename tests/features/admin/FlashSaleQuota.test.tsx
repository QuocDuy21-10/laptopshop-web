import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FlashSaleAllocations } from "@/features/admin/promotions/FlashSaleAllocations";
import { FlashSaleQuotaEditor, validateQuotaItems } from "@/features/admin/promotions/FlashSaleQuotaEditor";
import { FlashSaleSummary } from "@/features/admin/promotions/FlashSaleSummary";
import { renderAdmin } from "../../utils";

const products = vi.hoisted(() => ({ useAdminProducts: vi.fn() }));
vi.mock("@/features/admin/products/hooks", () => products);

beforeEach(() => {
  products.useAdminProducts.mockImplementation((query: { q?: string }) => ({
    data: { data: query.q ? [{ id: 3, name: "Laptop Dell XPS" }, { id: 4, name: "Laptop Asus TUF" }] : [] },
  }));
});

describe("Flash Sale admin components", () => {
  it("validates unique products and max user quota", () => {
    expect(validateQuotaItems([{ productId: 1, totalQuota: 2, maxUnitsPerUser: 3 }])).toBe("Giới hạn mỗi user không được vượt quota tổng.");
    expect(
      validateQuotaItems([
        { productId: 1, totalQuota: 2, maxUnitsPerUser: 1 },
        { productId: 1, totalQuota: 2, maxUnitsPerUser: 1 },
      ]),
    ).toBe("Sản phẩm Flash Sale không được trùng.");
    expect(validateQuotaItems([])).toBe("Cần ít nhất một sản phẩm Flash Sale.");
    expect(validateQuotaItems([{ productId: 0, totalQuota: 2, maxUnitsPerUser: 1 }])).toBe("Chọn sản phẩm cho mọi dòng quota.");
    expect(validateQuotaItems([{ productId: 1, totalQuota: 1, maxUnitsPerUser: 1 }], { 1: 5 })).toBe("Không được giảm quota tổng.");
    expect(validateQuotaItems([{ productId: 1, totalQuota: 5, maxUnitsPerUser: 2 }], { 1: 5 })).toBeNull();
  });

  it("shows the validation error inline", () => {
    renderAdmin(<FlashSaleQuotaEditor value={[{ productId: 1, totalQuota: 2, maxUnitsPerUser: 3 }]} onChange={vi.fn()} productNames={{ 1: "Laptop A" }} />);
    expect(screen.getByText("Giới hạn mỗi user không được vượt quota tổng.")).toBeInTheDocument();
  });

  it("searches admin products and submits the picked product id", async () => {
    const onChange = vi.fn();
    renderAdmin(<FlashSaleQuotaEditor value={[{ productId: 0, totalQuota: 5, maxUnitsPerUser: 1 }]} onChange={onChange} />);
    const select = screen.getByRole("combobox", { name: "Sản phẩm dòng 1" });
    await userEvent.click(select);
    await userEvent.type(select, "Laptop");
    await waitFor(() => expect(products.useAdminProducts).toHaveBeenCalledWith(expect.objectContaining({ q: "Laptop", isActive: true, page: 1, pageSize: 20 })));
    await userEvent.click(await screen.findByText("Laptop Dell XPS"));
    expect(onChange).toHaveBeenCalledWith([{ productId: 3, totalQuota: 5, maxUnitsPerUser: 1 }]);
  });

  it("locks product and per-user limit but lets the total quota change", () => {
    const onChange = vi.fn();
    renderAdmin(<FlashSaleQuotaEditor locked value={[{ productId: 3, totalQuota: 5, maxUnitsPerUser: 2 }]} onChange={onChange} productNames={{ 3: "Laptop Dell XPS" }} minTotals={{ 3: 5 }} />);
    expect(screen.getByRole("combobox", { name: "Sản phẩm dòng 1" })).toBeDisabled();
    expect(screen.getByLabelText("Tối đa mỗi user dòng 1")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Thêm sản phẩm" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Quota tổng dòng 1"), { target: { value: "9" } });
    expect(onChange).toHaveBeenCalledWith([{ productId: 3, totalQuota: 9, maxUnitsPerUser: 2 }]);
  });

  it("renders quota summary KPIs", () => {
    render(<FlashSaleSummary summary={{ totalQuota: 10, claimedUnits: 3, remainingUnits: 7, releasedUnits: 1, completedUnits: 2, totalDiscountAmount: 600 }} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Đã claim")).toBeInTheDocument();
    expect(screen.getByText("600 ₫")).toBeInTheDocument();
  });

  it("renders allocation history with pagination and status filter", async () => {
    const onPage = vi.fn();
    const onStatus = vi.fn();
    render(<FlashSaleAllocations allocations={[{ id: 1, promotionId: 42, productId: 3, product: { id: 3, name: "Laptop" }, user: { id: 7, username: "u@test.local", fullName: "U" }, orderId: 9, orderStatus: "PENDING", orderDetailId: 11, quantity: 1, discountAmount: 200, status: "RELEASED", createdAt: "2026-10-22T00:00:00.000Z", releasedAt: "2026-10-22T01:00:00.000Z", releaseReason: "CANCELLED" }]} meta={{ page: 1, pageSize: 10, total: 1, totalPages: 1 }} onPage={onPage} onStatus={onStatus} />);
    expect(screen.getByText("CANCELLED")).toBeInTheDocument();
    expect(screen.getByText("u@test.local")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang sau" })).toBeDisabled();
    await userEvent.selectOptions(screen.getByLabelText("Trạng thái allocation"), "RELEASED");
    expect(onStatus).toHaveBeenCalledWith("RELEASED");
  });
});
