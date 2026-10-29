import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Footer } from "@/components/layout/Footer/Footer";

const store = vi.hoisted(() => ({ getStoreInfo: vi.fn() }));
vi.mock("@/features/store-info/server", () => store);

beforeEach(() => vi.clearAllMocks());

describe("Footer", () => {
  it("shows no contact details or payment/VAT badges when the API has none", async () => {
    store.getStoreInfo.mockResolvedValue(null);
    render(await Footer());
    expect(screen.queryByText(/Hotline/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Email hỗ trợ/)).not.toBeInTheDocument();
    expect(screen.queryByText("Hóa đơn VAT")).not.toBeInTheDocument();
    expect(screen.queryByText("Thanh toán COD")).not.toBeInTheDocument();
  });

  it("renders exactly what the API configured", async () => {
    store.getStoreInfo.mockResolvedValue({
      hotline: "1900 0000",
      supportEmail: "help@shop.test",
      supportHours: "08:00 – 21:00",
      vatInvoice: false,
      paymentMethods: ["COD"],
    });
    render(await Footer());
    expect(screen.getByText("1900 0000 · 08:00 – 21:00")).toBeInTheDocument();
    expect(screen.getByText("help@shop.test")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán COD")).toBeInTheDocument();
    expect(screen.queryByText("Chuyển khoản QR")).not.toBeInTheDocument();
    expect(screen.queryByText("Hóa đơn VAT")).not.toBeInTheDocument();
  });
});
