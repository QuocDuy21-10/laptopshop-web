import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextField } from "@/components/ui/TextField/TextField";

describe("TextField", () => {
  it("links the label, hint and error to the input", () => {
    render(<TextField label="Email" hint="Dùng để đăng nhập" error="Email không hợp lệ" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Dùng để đăng nhập Email không hợp lệ");
  });

  it("is valid without an error", () => {
    render(<TextField label="Họ tên" />);
    expect(screen.getByLabelText("Họ tên")).not.toHaveAttribute("aria-invalid");
  });
});
