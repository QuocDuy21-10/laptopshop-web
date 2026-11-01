import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AuthPromptProvider, useAuthPrompt, type AuthPromptReason } from "@/features/auth/AuthPrompt/AuthPromptProvider";

function Opener({ reason, returnTo }: { reason: AuthPromptReason; returnTo: string }) {
  const promptLogin = useAuthPrompt();
  return <button onClick={() => promptLogin({ reason, returnTo })}>mở</button>;
}

const setup = (reason: AuthPromptReason, returnTo = "/products/3?x=1#reviews") =>
  render(
    <AuthPromptProvider>
      <Opener reason={reason} returnTo={returnTo} />
    </AuthPromptProvider>,
  );

describe("AuthPromptProvider", () => {
  it("opens with the copy of the reason and next-aware login and register links", async () => {
    setup("wishlist");
    await userEvent.click(screen.getByRole("button", { name: "mở" }));

    expect(await screen.findByRole("dialog", { name: "Đăng nhập để lưu sản phẩm yêu thích" })).toBeInTheDocument();
    const next = encodeURIComponent("/products/3?x=1#reviews");
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", `/login?next=${next}`);
    expect(screen.getByRole("link", { name: "Tạo tài khoản" })).toHaveAttribute("href", `/register?next=${next}`);
  });

  it.each([
    ["cart", true],
    ["wishlist", true],
    ["review", false],
    ["helpful", false],
  ] as const)("%s: resume note shown = %s", async (reason, resumes) => {
    setup(reason);
    await userEvent.click(screen.getByRole("button", { name: "mở" }));
    await screen.findByRole("dialog");
    expect(!!screen.queryByText("Hành động của bạn sẽ được hoàn tất sau khi đăng nhập.")).toBe(resumes);
  });

  it("closes on Escape and when a link is followed", async () => {
    setup("cart");
    await userEvent.click(screen.getByRole("button", { name: "mở" }));
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "mở" }));
    await userEvent.click(await screen.findByRole("link", { name: "Đăng nhập" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
