import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderAdmin } from "../../../utils";
import { WarrantyVerificationForm } from "@/features/admin/after-sales/WarrantyVerificationForm";

const mutate = vi.fn();
vi.mock("@/features/admin/after-sales/hooks", () => ({ useCreateWarrantyVerification: () => ({ mutate, isPending: false }) }));

const choose = async (label: string) => {
  await userEvent.click(screen.getByRole("combobox", { name: "Kết quả xác minh" }));
  await userEvent.click(await screen.findByTitle(label));
};

describe("WarrantyVerificationForm", () => {
  it("only asks for warranty dates when the decision needs them", async () => {
    renderAdmin(<WarrantyVerificationForm requestId={1} itemId={2} expectedVersion={3} current={null} />);
    expect(screen.queryByLabelText("Bắt đầu bảo hành")).not.toBeInTheDocument();
    await choose("Còn bảo hành");
    expect(screen.getByLabelText("Bắt đầu bảo hành")).toBeInTheDocument();
    await choose("Không có bảo hành");
    expect(screen.queryByLabelText("Bắt đầu bảo hành")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Lưu xác minh/ }));
    await waitFor(() => expect(mutate).toHaveBeenCalled());
    expect(mutate.mock.calls[0][0]).toMatchObject({ decision: "NO_WARRANTY", warrantyStartAt: undefined, warrantyEndAt: undefined });
  });

  it("stays available to correct a saved verification", () => {
    renderAdmin(<WarrantyVerificationForm requestId={1} itemId={2} expectedVersion={3} current={{ decision: "NO_WARRANTY", warrantyStartAt: null, warrantyEndAt: null }} />);
    expect(screen.getByText(/Đã xác minh: Không có bảo hành/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cập nhật xác minh/ })).toBeInTheDocument();
  });
});
