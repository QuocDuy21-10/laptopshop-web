import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceRequestDetail } from "@/features/after-sales/ServiceRequestDetail/ServiceRequestDetail";
import { json, mockFetch, renderWithQuery } from "../../utils";

describe("ServiceRequestDetail", () => {
  it("shows independent item status and hides internal events", async () => {
    mockFetch().mockResolvedValue(json(200, { data: { id: 90, code: "AS-90", type: "TECHNICAL_SUPPORT", status: "PARTIALLY_COMPLETED", subject: "Hỗ trợ", previousRequest: { id: 12, code: "AS-12" }, followUps: [], items: [{ id: 1, deviceLabel: "Thiết bị 1", status: "IN_SERVICE", resolution: null, quotes: [] }, { id: 2, deviceLabel: "Thiết bị 2", status: "RETURNED", resolution: null, quotes: [] }], events: [{ id: 1, kind: "PUBLIC_MESSAGE", body: "Đã tiếp nhận", visibility: "PUBLIC", createdAt: "2026-10-23T00:00:00.000Z" }] } }));
    renderWithQuery(<ServiceRequestDetail userId={7} id={90} />);
    expect(await screen.findByText("Thiết bị 1")).toBeInTheDocument();
    expect(screen.getByText("Đang xử lý")).toBeInTheDocument();
    expect(screen.getByText("Đã trả thiết bị")).toBeInTheDocument();
    expect(screen.queryByText("Ghi chú nội bộ")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AS-12/ })).toHaveAttribute("href", "/account/after-sales/12");
  });
});
