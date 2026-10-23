import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WarrantyList } from "@/features/after-sales/WarrantyList/WarrantyList";
import { renderWithQuery, json, mockFetch } from "../../utils";

vi.mock("@/features/account/useMe", () => ({ useMe: () => ({ data: { id: 7 } }) }));

describe("WarrantyList", () => {
  it("offers out-of-warranty technical support", async () => {
    mockFetch().mockResolvedValue(json(200, { data: [{ orderDetailId: 1, orderId: 9, product: { id: 1, name: "Laptop", image: null }, quantity: 1, activeCount: 0, availableCount: 1, warrantyMonthsSnapshot: 12, warrantyStartAt: "2024-01-01T00:00:00.000Z", warrantyEndAt: "2025-01-01T00:00:00.000Z", warrantyPolicySource: "CHECKOUT_SNAPSHOT", coverage: "OUT_OF_WARRANTY", allowed: true, reason: null, allowedRequestTypes: ["TECHNICAL_SUPPORT"] }], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } }));
    renderWithQuery(<WarrantyList userId={7} />);
    expect(await screen.findByText("Hỗ trợ ngoài bảo hành")).toBeInTheDocument();
  });
});
