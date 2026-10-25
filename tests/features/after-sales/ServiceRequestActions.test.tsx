import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ServiceRequestMessages } from "@/features/after-sales/ServiceRequestMessages/ServiceRequestMessages";
import { renderWithQuery } from "../../utils";

describe("ServiceRequestActions", () => {
  it("renders a public message composer", () => {
    renderWithQuery(<ServiceRequestMessages userId={7} requestId={90} />);
    expect(screen.getByRole("textbox", { name: "Tin nhắn" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gửi tin nhắn" })).toBeEnabled();
  });
});
