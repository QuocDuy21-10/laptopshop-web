import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FlashSaleQuotaEditor } from "@/features/admin/promotions/FlashSaleQuotaEditor";
import { FlashSaleSummary } from "@/features/admin/promotions/FlashSaleSummary";
import { FlashSaleAllocations } from "@/features/admin/promotions/FlashSaleAllocations";

describe("Flash Sale admin components", () => {
  it("validates unique products and max user quota", () => {
    const onChange = vi.fn();
    render(<FlashSaleQuotaEditor value={[{ productId: 1, totalQuota: 2, maxUnitsPerUser: 3 }]} onChange={onChange} />);
    expect(screen.getByText("Giới hạn mỗi user không được vượt quota tổng.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Sản phẩm dòng 1"), { target: { value: "2" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("renders quota summary KPIs", () => {
    render(<FlashSaleSummary summary={{ totalQuota: 10, claimedUnits: 3, remainingUnits: 7, releasedUnits: 1, completedUnits: 2, totalDiscountAmount: 600 }} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Đã claim")).toBeInTheDocument();
    expect(screen.getByText("600 ₫")).toBeInTheDocument();
  });

  it("renders allocation history with pagination and status filter", () => {
    const onPage = vi.fn();
    render(<FlashSaleAllocations allocations={[{ id: 1, promotionId: 42, productId: 3, product: { id: 3, name: "Laptop" }, user: { id: 7, username: "u@test.local", fullName: "U" }, orderId: 9, orderStatus: "PENDING", orderDetailId: 11, quantity: 1, discountAmount: 200, status: "RELEASED", createdAt: "2026-10-22T00:00:00.000Z", releasedAt: "2026-10-22T01:00:00.000Z", releaseReason: "CANCELLED" }]} meta={{ page: 1, pageSize: 10, total: 1, totalPages: 1 }} onPage={onPage} />);
    expect(screen.getByText("CANCELLED")).toBeInTheDocument();
    expect(screen.getByText("u@test.local")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang sau" })).toBeDisabled();
  });
});
