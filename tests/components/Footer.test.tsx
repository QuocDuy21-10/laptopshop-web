import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { Footer } from "@/components/layout/Footer/Footer";

const store = vi.hoisted(() => ({ getStoreInfo: vi.fn() }));
vi.mock("@/features/store-info/server", () => store);

beforeEach(() => vi.clearAllMocks());

describe("Footer", () => {
  it("keeps support destinations available without configured store information", async () => {
    store.getStoreInfo.mockResolvedValue(null);
    render(await Footer());
    const heading = screen.getByRole("heading", { name: "Hỗ trợ", level: 2 });
    const column = heading.parentElement;
    if (!column) throw new Error("Missing support column");
    const links = within(column);
    expect(links.getByRole("link", { name: "Khuyến mãi" })).toHaveAttribute("href", "/promotions");
    expect(links.getByRole("link", { name: "Bảo hành của tôi" })).toHaveAttribute("href", "/account/warranties");
    expect(links.getByRole("link", { name: "Yêu cầu hậu mãi" })).toHaveAttribute("href", "/account/after-sales");
  });

  it("shows enabled payment labels and VAT while ignoring unknown methods", async () => {
    store.getStoreInfo.mockResolvedValue({
      hotline: null, supportEmail: null, supportHours: null, vatInvoice: true,
      paymentMethods: ["COD", "BANK_TRANSFER", "UNKNOWN"],
    });
    render(await Footer());
    expect(screen.getByText("Thanh toán COD")).toBeInTheDocument();
    expect(screen.getByText("Chuyển khoản QR")).toBeInTheDocument();
    expect(screen.getByText("Hóa đơn VAT")).toBeInTheDocument();
    expect(screen.queryByText("UNKNOWN")).toBeNull();
  });

  it("omits payment chips when no methods or VAT are enabled", async () => {
    store.getStoreInfo.mockResolvedValue({
      hotline: null, supportEmail: null, supportHours: null, vatInvoice: false, paymentMethods: [],
    });
    render(await Footer());
    expect(screen.queryByText("Thanh toán COD")).toBeNull();
    expect(screen.queryByText("Chuyển khoản QR")).toBeNull();
    expect(screen.queryByText("Hóa đơn VAT")).toBeNull();
  });
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
