import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceRequestAttachments } from "@/features/after-sales/ServiceRequestAttachments/ServiceRequestAttachments";
import { renderWithQuery } from "../../utils";

describe("ServiceRequestAttachments", () => {
  it("renders the image upload affordance", () => {
    renderWithQuery(<ServiceRequestAttachments userId={7} requestId={90} itemId={1} />);
    expect(screen.getByLabelText("Thêm ảnh")).toBeInTheDocument();
  });
});
