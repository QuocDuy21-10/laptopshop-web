import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileForm } from "@/features/account/ProfileForm/ProfileForm";
import type { Me } from "@/lib/api/types";
import { renderWithQuery } from "../utils";

const mutateAsync = vi.hoisted(() => vi.fn());
vi.mock("@/features/account/useUpdateMe", () => ({ useUpdateMe: () => ({ mutateAsync, isPending: false }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const me: Me = {
  id: 1,
  username: "a@b.co",
  fullName: "A",
  address: null,
  phone: null,
  accountType: "SYSTEM",
  avatar: null,
  role: "USER",
  cartItemCount: 0,
};

beforeEach(() => mutateAsync.mockReset().mockResolvedValue({}));

describe("ProfileForm", () => {
  it("rejects an avatar over 3 MB without saving", async () => {
    renderWithQuery(<ProfileForm me={me} />);
    const big = new File([new Uint8Array(3 * 1024 * 1024 + 1)], "a.png", { type: "image/png" });
    await userEvent.upload(screen.getByLabelText("Ảnh đại diện"), big);
    expect(await screen.findByText("Ảnh tối đa 3 MB")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("saves the edited fields with the picked avatar", async () => {
    renderWithQuery(<ProfileForm me={me} />);
    const name = screen.getByLabelText(/Họ tên/);
    await userEvent.clear(name);
    await userEvent.type(name, "B");
    const avatar = new File(["png"], "me.png", { type: "image/png" });
    await userEvent.upload(screen.getByLabelText("Ảnh đại diện"), avatar);
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ values: { fullName: "B", phone: "", address: "" }, avatar }),
    );
  });
});
