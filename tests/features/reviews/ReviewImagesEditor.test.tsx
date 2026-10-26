import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewImagesEditor } from "@/features/reviews/ReviewImagesEditor/ReviewImagesEditor";
import { renderWithQuery } from "../../utils";

describe("ReviewImagesEditor", () => {
  it("previews, counts and removes new images within the three-image limit", async () => {
    const onChange = vi.fn();
    renderWithQuery(<ReviewImagesEditor images={[]} onChange={onChange} />);

    expect(screen.getByRole("group")).toHaveTextContent("0/3 ảnh");
    const input = screen.getByLabelText("Chọn ảnh");
    await userEvent.upload(input, new File(["image"], "laptop.png", { type: "image/png" }));

    expect(screen.getByRole("group")).toHaveTextContent("1/3 ảnh");
    expect(screen.getByRole("img", { name: "Ảnh xem trước laptop.png" })).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ kind: "new", clientId: expect.any(String), file: expect.any(File) }),
    ]);

    await userEvent.click(screen.getByRole("button", { name: "Xóa ảnh laptop.png" }));
    expect(screen.getByRole("group")).toHaveTextContent("0/3 ảnh");
  });

  it("supports keyboard/button reorder and preserves existing hidden-review images", async () => {
    const onChange = vi.fn();
    renderWithQuery(
      <ReviewImagesEditor
        images={[
          { id: 21, url: "https://signed.test/21.webp", urlExpiresAt: "2026-10-21T03:15:00.000Z", mimeType: "image/webp", width: 10, height: 10, position: 0 },
          { id: 22, url: "https://signed.test/22.webp", urlExpiresAt: "2026-10-21T03:15:00.000Z", mimeType: "image/webp", width: 10, height: 10, position: 1 },
        ]}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("group")).toHaveTextContent("2/3 ảnh");
    await userEvent.click(screen.getByRole("button", { name: "Sang phải ảnh 21" }));
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ kind: "existing", clientId: "existing-22", image: expect.objectContaining({ id: 22 }) }),
      expect.objectContaining({ kind: "existing", clientId: "existing-21", image: expect.objectContaining({ id: 21 }) }),
    ]);
    expect(screen.getByRole("button", { name: "Sang trái ảnh 21" })).toHaveAttribute("aria-label");
  });
});
