import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ScrollRow } from "@/features/home/ScrollRow/ScrollRow";

describe("ScrollRow", () => {
  it("renders a labelled list with keyboard-reachable scroll buttons", async () => {
    render(
      <ScrollRow label="Thương hiệu">
        <li>A</li>
        <li>B</li>
      </ScrollRow>,
    );
    const list = screen.getByRole("list", { name: "Thương hiệu" });
    const scrollBy = vi.fn();
    Object.defineProperty(list, "clientWidth", { value: 400 });
    (list as unknown as { scrollBy: typeof scrollBy }).scrollBy = scrollBy;
    await userEvent.click(screen.getByRole("button", { name: "Cuộn Thương hiệu sang phải" }));
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ left: 360 }));
    await userEvent.click(screen.getByRole("button", { name: "Cuộn Thương hiệu sang trái" }));
    expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: -360 }));
  });
});
