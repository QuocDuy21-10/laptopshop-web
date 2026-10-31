import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewForm } from "@/features/reviews/ReviewForm/ReviewForm";
import { renderWithQuery } from "../../utils";

describe("ReviewForm", () => {
  it("requires rating, content and an explicit identity choice", async () => {
    const onSubmit = vi.fn();
    renderWithQuery(<ReviewForm fullName="Nguyễn Văn A" onSubmit={onSubmit} />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked();
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
        review={{
          id: 1,
          productId: 12,
          rating: 4,
          title: "Cũ",
          content: "Nội dung cũ đủ dài.",
          isAnonymous: false,
          status: "HIDDEN",
          deletedAt: null,
          imageVersion: 0,
          verifiedPurchase: true,
          images: [],
          createdAt: "2026-10-21T03:00:00.000Z",
          updatedAt: "2026-10-21T03:00:00.000Z",
        }}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("Cũ")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nội dung cũ đủ dài.")).toBeInTheDocument();
    expect(screen.getByText(/vẫn cần admin khôi phục/i)).toBeInTheDocument();
  });
});

describe("ReviewForm submission", () => {
  it.each([true, false])("submits a new review with isAnonymous=%s", async (isAnonymous) => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    renderWithQuery(<ReviewForm fullName="Nguyễn Văn A" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("radio", { name: "5 sao" }));
    await userEvent.click(
      screen.getByRole("radio", {
        name: isAnonymous ? "Ẩn danh — hiển thị ****" : "Công khai tên",
      }),
    );
    await userEvent.type(screen.getByRole("textbox", { name: "Nội dung" }), "Nội dung mới đủ dài.");
    await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ rating: 5, isAnonymous, content: "Nội dung mới đủ dài." }),
      ),
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it.each([true, false])(
    "prefills and submits an existing review with isAnonymous=%s",
    async (isAnonymous) => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderWithQuery(
        <ReviewForm
          fullName="Nguyễn Văn A"
          onSubmit={onSubmit}
          review={{
            id: 18,
            productId: 12,
            rating: 4,
            title: "Cũ",
            content: "Nội dung cũ đủ dài.",
            isAnonymous,
            status: "PUBLISHED",
            deletedAt: null,
            imageVersion: 7,
            verifiedPurchase: true,
            images: [],
            createdAt: "2026-10-21T00:00:00Z",
            updatedAt: "2026-10-21T00:00:00Z",
          }}
        />,
      );

      expect(screen.getByRole("radio", { name: "4 sao" })).toBeChecked();
      expect(
        screen.getByRole("radio", {
          name: isAnonymous ? "Ẩn danh — hiển thị ****" : "Công khai tên",
        }),
      ).toBeChecked();
      await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ rating: 4, isAnonymous })),
      );
    },
  );

  it.each([true, false])(
    "submits the final radio selections with isAnonymous=%s",
    async (isAnonymous) => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderWithQuery(<ReviewForm fullName="Nguyễn Văn A" onSubmit={onSubmit} />);

      await userEvent.click(screen.getByRole("radio", { name: "4 sao" }));
      await userEvent.click(screen.getByRole("radio", { name: "5 sao" }));
      for (const choice of [isAnonymous, !isAnonymous, isAnonymous]) {
        await userEvent.click(
          screen.getByRole("radio", { name: choice ? "Ẩn danh — hiển thị ****" : "Công khai tên" }),
        );
      }
      await userEvent.type(
        screen.getByRole("textbox", { name: "Nội dung" }),
        "Nội dung mới đủ dài.",
      );
      await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ rating: 5, isAnonymous })),
      );
    },
  );

  it("preserves values without a false identity error after a failed save", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Save failed"));
    renderWithQuery(<ReviewForm fullName="Nguyễn Văn A" onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("radio", { name: "5 sao" }));
    await userEvent.click(screen.getByRole("radio", { name: "Công khai tên" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "Nội dung" }),
      "Giữ nội dung sau khi lỗi.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Đã có lỗi xảy ra. Vui lòng thử lại.",
    );
    expect(screen.getByRole("textbox", { name: "Nội dung" })).toHaveValue(
      "Giữ nội dung sau khi lỗi.",
    );
    expect(screen.getByRole("radio", { name: "5 sao" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Công khai tên" })).toBeChecked();
    expect(screen.queryByText("Hãy chọn cách hiển thị tên.")).not.toBeInTheDocument();
  });
});
