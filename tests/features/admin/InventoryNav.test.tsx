import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InventoryNav } from "@/features/admin/inventory/InventoryNav";
import { renderAdmin } from "../../utils";

describe("InventoryNav", () => {
  it("links to movements and receipts with the active route", () => {
    renderAdmin(<InventoryNav active="movements" />);
    expect(screen.getByRole("link", { name: "Nhật ký kho" })).toHaveAttribute(
      "href",
      "/admin/inventory",
    );
    expect(screen.getByRole("link", { name: "Phiếu nhập" })).toHaveAttribute(
      "href",
      "/admin/inventory/receipts",
    );
    expect(screen.getByRole("link", { name: "Nhật ký kho" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
