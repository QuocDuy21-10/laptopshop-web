import { render, screen } from "@testing-library/react";
import { Input } from "antd";
import { describe, expect, it } from "vitest";
import { AdminProviders } from "@/features/admin/AdminProviders";

describe("AdminProviders", () => {
  it("gives the icon-only search button an accessible name", () => {
    render(
      <AdminProviders>
        <Input.Search aria-label="Tìm đơn hàng" />
      </AdminProviders>,
    );
    expect(screen.getByRole("button", { name: "Tìm kiếm" })).toBeInTheDocument();
  });
});
