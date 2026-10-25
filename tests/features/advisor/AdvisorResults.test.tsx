import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdvisorResults } from "@/features/advisor/AdvisorResults/AdvisorResults";
import type { AdvisorResult, Product } from "@/lib/api/types";
import { renderWithQuery } from "../../utils";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => "/advisor" }));

const product: Product = {
  id: 3,
  name: "Laptop Asus TUF Gaming",
  price: 17_490_000,
  image: "/images/product/a.png",
  detailDesc: "detail",
  shortDesc: "Intel Core i5 11400H",
  quantity: 5,
  sold: 0,
  factory: "ASUS",
  target: "GAMING",
  isActive: true,
  cpu: "Intel Core i5-11400H",
  gpu: "NVIDIA RTX 2050 4GB",
  ramGb: 16,
  storageGb: 512,
  screenSizeInch: 15.6,
  screenResolution: "1920x1080",
  refreshRateHz: 144,
  batteryWh: 48,
  weightGrams: 2300,
  warrantyMonths: 24,
};

const result = (mode: AdvisorResult["mode"] = "rule_based"): AdvisorResult => ({
  mode,
  recommendations: [
    {
      product,
      matchScore: 86,
      highlights: ["RAM 16 GB", "Tần số quét 144 Hz"],
      reason: "Phù hợp với nhu cầu lập trình.",
      tradeoffs: ["Máy nặng hơn laptop văn phòng."],
    },
  ],
  suggestions: [],
});

describe("AdvisorResults", () => {
  it("shows loading status without stale results", () => {
    renderWithQuery(<AdvisorResults loading result={result()} onEdit={vi.fn()} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hủy và sửa tiêu chí" })).toBeInTheDocument();
    expect(screen.queryByText("86/100")).not.toBeInTheDocument();
  });

  it("shows empty suggestions and lets the user edit criteria", async () => {
    const onEdit = vi.fn();
    renderWithQuery(<AdvisorResults loading={false} result={{ mode: "rule_based", recommendations: [], suggestions: ["Tăng ngân sách"] }} onEdit={onEdit} />);
    expect(screen.getByText("Tăng ngân sách")).toBeInTheDocument();
    await (await import("@testing-library/user-event")).default.click(screen.getByRole("button", { name: "Sửa tiêu chí" }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("shows mode notice, explanation and existing commerce actions", () => {
    renderWithQuery(<AdvisorResults loading={false} result={result()} onEdit={vi.fn()} />);
    expect(screen.getByText(/phần giải thích AI tạm thời không khả dụng/)).toBeInTheDocument();
    expect(screen.getByText(/86\/100/)).toBeInTheDocument();
    expect(screen.getByText("Phù hợp với nhu cầu lập trình.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: product.name })).toHaveAttribute("href", "/products/3");
    expect(screen.getByRole("button", { name: `So sánh ${product.name}` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Thêm ${product.name} vào giỏ` })).toBeEnabled();
  });

  it("does not show the fallback notice for AI-enhanced results", () => {
    renderWithQuery(<AdvisorResults loading={false} result={result("ai_enhanced")} onEdit={vi.fn()} />);
    expect(screen.queryByText(/phần giải thích AI tạm thời không khả dụng/)).not.toBeInTheDocument();
  });
});
