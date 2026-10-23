import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceRequestActions } from "@/features/admin/after-sales/ServiceRequestActions";
import { renderAdmin } from "../../../utils";

vi.mock("@/features/admin/after-sales/hooks", () => ({ useAdminAfterSalesStatus: () => ({ mutate: vi.fn(), isPending: false }), useAdminAfterSalesMessage: () => ({ mutate: vi.fn(), isPending: false }), useAdminAfterSalesNote: () => ({ mutate: vi.fn(), isPending: false }) }));

describe("Admin ServiceRequestActions", () => {
  it("renders status control and internal-note action", () => {
    renderAdmin(<ServiceRequestActions requestId={90} item={{ id: 1, deviceLabel: "Thiết bị 1", status: "DIAGNOSING", version: 2 }} />);
    expect(screen.getByRole("combobox", { name: "Trạng thái Thiết bị 1" })).toHaveValue("DIAGNOSING");
    expect(screen.getByRole("button", { name: "Ghi chú nội bộ" })).toBeEnabled();
  });
});
