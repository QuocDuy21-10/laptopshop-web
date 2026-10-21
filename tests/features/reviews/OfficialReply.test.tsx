import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OfficialReply } from "@/features/reviews/OfficialReply/OfficialReply";

describe("OfficialReply", () => {
  it("renders a fixed LaptopShop label, plain text and formatted timestamp", () => {
    render(<OfficialReply reply={{ content: "Nội dung <script>alert(1)</script>", createdAt: "2026-10-21T03:00:00.000Z", updatedAt: "2026-10-21T04:00:00.000Z" }} />);
    expect(screen.getByText("Phản hồi từ LaptopShop")).toBeInTheDocument();
    expect(screen.getByText("Nội dung <script>alert(1)</script>")).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
    expect(screen.getByRole("time")).toHaveAttribute("datetime", "2026-10-21T04:00:00.000Z");
    expect(screen.queryByText(/admin|username|createdById/i)).toBeNull();
  });

  it("renders nothing without a reply", () => {
    const { container } = render(<OfficialReply reply={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
