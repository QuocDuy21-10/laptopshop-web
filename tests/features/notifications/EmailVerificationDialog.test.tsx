import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmailVerificationDialog } from "@/features/notifications/EmailVerificationDialog/EmailVerificationDialog";
import { renderWithQuery } from "../../utils";

const request = vi.fn().mockResolvedValue({ data: { accepted: true } });
const confirm = vi.fn().mockResolvedValue({ data: { verified: true } });
vi.mock("@/features/notifications/hooks", () => ({
  useRequestEmailOtp: () => ({ mutateAsync: request, isPending: false }),
  useConfirmEmailOtp: () => ({ mutateAsync: confirm, isPending: false }),
}));

describe("EmailVerificationDialog", () => {
  it("requests and confirms a six digit code without persisting it", async () => {
    renderWithQuery(
      <EmailVerificationDialog userId={7} open onOpenChange={vi.fn()} onVerified={vi.fn()} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Gửi mã" }));
    expect(await screen.findByText(/đã được tiếp nhận/i)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Mã xác minh"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Xác minh" }));
    expect(confirm).toHaveBeenCalledWith("123456");
    expect(window.localStorage.length).toBe(0);
  });
});
