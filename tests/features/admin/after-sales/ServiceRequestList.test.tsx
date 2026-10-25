import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceRequestList } from "@/features/admin/after-sales/ServiceRequestList";
import { json, mockFetch, renderAdmin } from "../../../utils";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => "/admin/after-sales", useSearchParams: () => new URLSearchParams() }));

describe("admin after-sales list", () => {
  it("shows filterable request rows", async () => {
    mockFetch().mockResolvedValue(json(200, { data: [{ id: 90, code: "AS-90", type: "WARRANTY", status: "REVIEWING", subject: "Lỗi màn hình", createdAt: "2026-10-23T00:00:00.000Z" }], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } }));
    renderAdmin(<ServiceRequestList />);
    expect(await screen.findByText("AS-90")).toBeInTheDocument();
    expect(screen.getByLabelText("Loại yêu cầu")).toBeInTheDocument();
  });
});
