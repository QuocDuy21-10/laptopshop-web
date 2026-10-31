import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelpfulButton } from "@/features/reviews/HelpfulButton/HelpfulButton";
import { AuthPromptProvider } from "@/features/auth/AuthPrompt/AuthPromptProvider";
import { json, mockFetch, renderWithQuery } from "../../utils";

describe("HelpfulButton", () => {
  beforeEach(() => mockFetch());

  it("asks anonymous users to sign in and keeps the review anchor", async () => {
    renderWithQuery(<AuthPromptProvider><HelpfulButton productId={12} reviewId={2} reviewIds={[2]} count={3} helpful={false} /></AuthPromptProvider>);
    await userEvent.click(screen.getByRole("button", { name: /hữu ích/i }));
    expect(await screen.findByText("Đăng nhập để bình chọn hữu ích")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login?next=%2Fproducts%2F12%23reviews");
  });

  it("optimistically toggles count and aria-pressed, then rolls back on failure", async () => {
    const fetchMock = mockFetch();
    let rejectRequest: ((response: Response) => void) | undefined;
    fetchMock.mockImplementation(() => new Promise((resolve) => { rejectRequest = resolve; }));
    renderWithQuery(<HelpfulButton productId={12} reviewId={2} reviewIds={[2]} userId={7} count={3} helpful={false} />);
    const button = screen.getByRole("button", { name: /đánh dấu hữu ích/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("4");
    rejectRequest?.(json(500, { error: { code: "UNKNOWN", message: "failed" } }));
    await vi.waitFor(() => expect(button).toHaveAttribute("aria-pressed", "false"));
    expect(button).toHaveTextContent("3");
  });

  it("disables self-vote with an accessible explanation", () => {
    renderWithQuery(<HelpfulButton productId={12} reviewId={2} reviewIds={[2]} userId={7} count={3} helpful={false} selfVoteDisabled />);
    expect(screen.getByRole("button", { name: /không thể đánh dấu/i })).toBeDisabled();
    expect(screen.getByText("Bạn không thể tự đánh giá review của mình.")).toBeInTheDocument();
  });
});
