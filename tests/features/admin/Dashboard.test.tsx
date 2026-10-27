import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dashboard } from "@/features/admin/dashboard/Dashboard";
import { json, mockFetch, priceText, renderAdmin } from "../../utils";

describe("Dashboard", () => {
  it("shows the API totals and links each order status to the filtered list", async () => {
    mockFetch().mockResolvedValue(
      json(200, {
        data: { userCount: 12, productCount: 34, orderCount: 5, revenue: 1500000, lowStockCount: 7, ordersByStatus: { PENDING: 2, COMPLETED: 3 } },
      }),
    );
    renderAdmin(<Dashboard />);
    expect(await screen.findByText("12")).toBeInTheDocument();
    expect(screen.getByText("34")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem sản phẩm sắp hết" })).toHaveAttribute("href", "/admin/products?stock=low");
    expect(screen.getByText(priceText(1500000))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Chờ xác nhận/ })).toHaveAttribute("href", "/admin/orders?status=PENDING");
    expect(screen.getByRole("link", { name: /Hoàn thành/ })).toHaveAttribute("href", "/admin/orders?status=COMPLETED");
  });
});
