import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextField } from "@/components/ui/TextField/TextField";

describe("TextField", () => {
  it("shows the hint when there is no error", () => {
    render(<TextField label="Email" hint="Dùng để đăng nhập" />);
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("Dùng để đăng nhập");
  });

  it("replaces the hint with the error", () => {
    render(<TextField label="Email" hint="Dùng để đăng nhập" error="Email không hợp lệ" />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Email không hợp lệ");
    expect(screen.queryByText("Dùng để đăng nhập")).not.toBeInTheDocument();
  });

  it("is valid without an error", () => {
    render(<TextField label="Họ tên" />);
    expect(screen.getByLabelText("Họ tên")).not.toHaveAttribute("aria-invalid");
  });

  it("toggles password visibility", () => {
    render(<TextField label="Mật khẩu" type="password" revealable />);
    const input = screen.getByLabelText("Mật khẩu");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Hiện mật khẩu" }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ẩn mật khẩu" })).toHaveAttribute("aria-pressed", "true");
  });
});
