import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ServiceRequestItemActions } from "@/features/after-sales/ServiceRequestItemActions/ServiceRequestItemActions";
import { renderWithQuery } from "../../utils";

const mocks = { cancel: vi.fn(), confirm: vi.fn(), dispute: vi.fn() };
vi.mock("@/features/after-sales/hooks", () => ({
  useCancelAfterSalesItem: () => ({ mutate: mocks.cancel, isPending: false }),
  useConfirmAfterSalesItem: () => ({ mutate: mocks.confirm, isPending: false }),
  useDisputeAfterSalesItem: () => ({ mutate: mocks.dispute, isPending: false }),
}));

describe("ServiceRequestItemActions", () => {
  it("renders only actions returned by the API and validates dispute details", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ServiceRequestItemActions userId={7} requestId={90} item={{ id: 1, status: "RETURNED", version: 2, allowedActions: ["CONFIRM", "DISPUTE"] }} />);
    expect(screen.queryByRole("button", { name: "Hủy thiết bị" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Báo vấn đề" }));
    expect(screen.getByRole("button", { name: "Gửi tranh chấp" })).toBeDisabled();
    await user.type(screen.getByLabelText("Chi tiết"), "Lỗi vẫn còn");
    await user.click(screen.getByRole("button", { name: "Gửi tranh chấp" }));
    expect(mocks.dispute).toHaveBeenCalledWith({ reason: "ISSUE_PERSISTS", note: "Lỗi vẫn còn" }, expect.any(Object));
  });
});
