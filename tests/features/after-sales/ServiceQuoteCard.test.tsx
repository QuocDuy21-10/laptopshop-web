import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceQuoteCard } from "@/features/after-sales/ServiceQuoteCard/ServiceQuoteCard";
import { renderWithQuery } from "../../utils";

vi.mock("@/features/after-sales/hooks", () => ({ useDecideAfterSalesQuote: () => ({ mutate: vi.fn(), isPending: false }) }));

describe("ServiceQuoteCard", () => {
  it("shows independent accept and decline actions", () => {
    renderWithQuery(<ServiceQuoteCard userId={7} requestId={90} itemId={1} quote={{ id: 2, version: 1, status: "SENT", total: 100000, currency: "VND", validUntil: "2026-12-31T00:00:00.000Z", note: null, lines: [] }} deviceLabel="Thiết bị 1" />);
    expect(screen.getByRole("button", { name: "Chấp nhận báo giá Thiết bị 1" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Từ chối báo giá Thiết bị 1" })).toBeEnabled();
  });

  it("shows quote lines and version metadata", () => {
    renderWithQuery(<ServiceQuoteCard userId={7} requestId={90} itemId={1} quote={{ id: 2, version: 3, status: "ACCEPTED", total: 600000, currency: "VND", validUntil: "2026-12-31T00:00:00.000Z", respondedAt: "2026-10-23T00:00:00.000Z", note: "Đã duyệt", lines: [{ id: 1, description: "Thay linh kiện", quantity: 1, unitPrice: 600000, lineTotal: 600000 }] }} deviceLabel="Thiết bị 1" />);
    expect(screen.getByText(/Báo giá phiên bản 3/)).toBeInTheDocument();
    expect(screen.getByText("Thay linh kiện")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chấp nhận báo giá Thiết bị 1" })).not.toBeInTheDocument();
  });
});
