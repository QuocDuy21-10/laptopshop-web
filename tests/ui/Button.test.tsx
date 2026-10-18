import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, buttonClassName } from "@/components/ui/Button/Button";

describe("Button", () => {
  it("is a type=button primary by default", () => {
    render(<Button>Mua ngay</Button>);
    const button = screen.getByRole("button", { name: "Mua ngay" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toMatch(/primary/);
  });

  it("is disabled and busy while loading, and ignores clicks", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Lưu
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Lưu" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes the same classes for links", () => {
    expect(buttonClassName({ variant: "secondary", size: "lg" })).toMatch(/secondary/);
  });
});
