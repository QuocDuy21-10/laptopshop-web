import { describe, expect, it, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MobileMenu } from "@/components/layout/MobileMenu/MobileMenu";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));

describe("MobileMenu", () => {
  it("offers warranties and closes the sheet when the destination is chosen", async () => {
    const user = userEvent.setup();
    render(<MobileMenu targets={[]} />);
    await user.click(screen.getByRole("button", { name: "Mở menu" }));
    const dialog = screen.getByRole("dialog", { name: "Danh mục" });
    const warranty = within(dialog).getByRole("link", { name: "Bảo hành" });
    expect(warranty).toHaveAttribute("href", "/account/warranties");
    expect(warranty.previousElementSibling).toHaveTextContent("Khuyến mãi");
    await user.click(warranty);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("button", { name: "Mở menu" })).toHaveFocus();
  });
});
