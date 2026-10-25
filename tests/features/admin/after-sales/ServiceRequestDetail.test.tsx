import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceRequestDetail } from "@/features/admin/after-sales/ServiceRequestDetail";
import { renderAdmin } from "../../../utils";

vi.mock("@/features/admin/after-sales/hooks", () => ({ useAdminAfterSalesRequest: () => ({ isPending: false, data: { data: { id: 90, code: "AS-90", type: "TECHNICAL_SUPPORT", status: "IN_PROGRESS", subject: "Hỗ trợ", version: 3, customer: null, assignee: null, items: [{ id: 1, deviceLabel: "Thiết bị 1", status: "DIAGNOSING", version: 2, coverageAtCreation: "IN_WARRANTY", warrantyVerification: null, allowedTransitions: ["IN_SERVICE"], allowedActions: [], quotes: [] }, { id: 2, deviceLabel: "Thiết bị 2", status: "DIAGNOSING", version: 1, coverageAtCreation: "IN_WARRANTY", warrantyVerification: null, allowedTransitions: ["IN_SERVICE"], allowedActions: [], quotes: [] }], events: [{ id: 1, kind: "INTERNAL_NOTE", visibility: "INTERNAL", body: "Ghi chú nội bộ", createdAt: "2026-10-23T00:00:00.000Z", actor: null }] } } }), useAdminAfterSalesStatus: () => ({ mutate: vi.fn(), isPending: false }), useAdminAfterSalesMessage: () => ({ mutate: vi.fn(), isPending: false }), useAdminAfterSalesNote: () => ({ mutate: vi.fn(), isPending: false }), useSendAfterSalesQuote: () => ({ mutate: vi.fn(), isPending: false }), useAdminAfterSalesAssignees: () => ({ data: { data: [] }, isPending: false }), useAssignAfterSalesRequest: () => ({ mutate: vi.fn(), isPending: false }), useCreateWarrantyVerification: () => ({ mutate: vi.fn(), isPending: false }), useAdminAfterSalesAttachments: () => ({ data: { data: [] }, isPending: false }), useUploadAdminAfterSalesAttachment: () => ({ mutate: vi.fn(), isPending: false }) }));

describe("Admin ServiceRequestDetail", () => {
  it("shows internal notes and independent device panels", async () => {
    renderAdmin(<ServiceRequestDetail id={90} />);
    expect((await screen.findAllByText("Ghi chú nội bộ")).length).toBeGreaterThan(0);
    expect(screen.getByText("Thiết bị 1")).toBeInTheDocument();
    expect(screen.getByText("Thiết bị 2")).toBeInTheDocument();
  });
});
