import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceRequestForm } from "@/features/after-sales/ServiceRequestForm/ServiceRequestForm";
import { json, mockFetch, renderWithQuery } from "../../utils";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("ServiceRequestForm", () => {
  it("creates one selectable row per available device unit", async () => {
    mockFetch().mockResolvedValue(json(200, { data: [{ orderDetailId: 1, orderId: 9, product: { id: 1, name: "Laptop", image: null }, quantity: 3, activeCount: 0, availableCount: 3, warrantyMonthsSnapshot: 12, warrantyStartAt: null, warrantyEndAt: null, warrantyPolicySource: "CHECKOUT_SNAPSHOT", coverage: "REQUIRES_VERIFICATION", allowed: true, reason: null, allowedRequestTypes: ["WARRANTY", "TECHNICAL_SUPPORT"] }], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } }));
    renderWithQuery(<ServiceRequestForm userId={7} type="WARRANTY" />);
    await screen.findAllByText("Laptop");
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(screen.queryByText("Thiết bị đã hết hạn")).not.toBeInTheDocument();
  });
});
