import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewForm } from "@/features/reviews/ReviewForm/ReviewForm";
import { renderWithQuery } from "../../utils";

describe("ReviewForm", () => {
  it("requires rating, content and an explicit identity choice", async () => {
    const onSubmit = vi.fn();
    renderWithQuery(<ReviewForm fullName="Nguyễn Văn A" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
    expect(await screen.findByText("Hãy chọn số sao từ 1 đến 5.")).toBeInTheDocument();
    expect(screen.getByText("Hãy chọn cách hiển thị tên.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("uses keyboard-accessible star radios and disables public name without fullName", () => {
    renderWithQuery(<ReviewForm fullName={null} onSubmit={vi.fn()} />);
    expect(screen.getAllByRole("radio", { name: /sao/ })).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "Công khai tên" })).toBeDisabled();
  });

  it("prefills an edit and explains that hidden reviews stay hidden", () => {
    renderWithQuery(
      <ReviewForm
        fullName="Nguyễn Văn A"
        review={{ id: 1, productId: 12, rating: 4, title: "Cũ", content: "Nội dung cũ đủ dài.", isAnonymous: false, status: "HIDDEN", deletedAt: null, verifiedPurchase: true, createdAt: "2026-10-21T03:00:00.000Z", updatedAt: "2026-10-21T03:00:00.000Z" }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("Cũ")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nội dung cũ đủ dài.")).toBeInTheDocument();
    expect(screen.getByText(/vẫn cần admin khôi phục/i)).toBeInTheDocument();
  });
});
