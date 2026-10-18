import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuantityStepper } from "@/components/ui/QuantityStepper/QuantityStepper";

describe("QuantityStepper", () => {
  it("steps within bounds", async () => {
    const onChange = vi.fn();
    render(<QuantityStepper value={1} max={3} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Giảm" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Tăng" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("disables increase at max", () => {
    render(<QuantityStepper value={3} max={3} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Tăng" })).toBeDisabled();
  });

  it("clamps a typed value when it is committed", () => {
    const onChange = vi.fn();
    render(<QuantityStepper value={1} max={5} onChange={onChange} />);
    const input = screen.getByRole("spinbutton", { name: "Số lượng" });
    fireEvent.change(input, { target: { value: "99" } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
