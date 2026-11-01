import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoreCommitments } from "@/features/home/StoreCommitments/StoreCommitments";

describe("StoreCommitments", () => {
  it("shows only what the store info provides", () => {
    render(
      <StoreCommitments
        info={{
          hotline: "1900 6308",
          supportHours: "8:00–21:00",
          supportEmail: null,
          vatInvoice: true,
          paymentMethods: ["COD", "BANK_TRANSFER", "UNKNOWN"],
        }}
      />,
    );
    expect(screen.getByText("1900 6308")).toBeInTheDocument();
    expect(screen.getByText("8:00–21:00")).toBeInTheDocument();
    expect(screen.getByText("Có hóa đơn VAT")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán COD, Chuyển khoản QR")).toBeInTheDocument();
    expect(screen.queryByText(/chính hãng|giao hàng|đổi trả|trả góp/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/UNKNOWN/)).not.toBeInTheDocument();
  });

  it("renders nothing without store info or without any item", () => {
    const { container, rerender } = render(<StoreCommitments info={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(
      <StoreCommitments
        info={{ hotline: null, supportHours: null, supportEmail: null, vatInvoice: false, paymentMethods: [] }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
