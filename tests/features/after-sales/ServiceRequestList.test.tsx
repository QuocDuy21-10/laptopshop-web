import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceRequestList } from "@/features/after-sales/ServiceRequestList/ServiceRequestList";
import { json, mockFetch, renderWithQuery } from "../../utils";

describe("ServiceRequestList", () => {
  it("shows aggregate progress and request links", async () => {
    mockFetch().mockResolvedValue(json(200, { data: [{ id: 90, code: "AS-90", type: "TECHNICAL_SUPPORT", status: "PARTIALLY_COMPLETED", subject: "Hỗ trợ", createdAt: "2026-10-23T00:00:00.000Z" }], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } }));
    renderWithQuery(<ServiceRequestList userId={7} page={1} />);
    expect(await screen.findByText("Hoàn tất một phần")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /AS-90/ })).toHaveAttribute("href", "/account/after-sales/90");
  });
});
