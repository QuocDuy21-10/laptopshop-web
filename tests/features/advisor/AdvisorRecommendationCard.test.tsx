import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdvisorRecommendationCard } from "@/features/advisor/AdvisorRecommendationCard/AdvisorRecommendationCard";
import type { AdvisorRecommendation } from "@/lib/api/types";
import { renderWithQuery } from "../../utils";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => "/advisor" }));

const recommendation: AdvisorRecommendation = {
  product: {
    id: 3,
    name: "Laptop test",
    price: 23_000_000,
    salePrice: 19_000_000,
    productDiscountAmount: 4_000_000,
    promotion: { id: 1, name: "Sale", endsAt: "2026-11-01T00:00:00.000Z", kind: "AUTOMATIC", eligibility: "EXACT" },
    image: null,
    detailDesc: null,
    shortDesc: null,
    quantity: 5,
    sold: 0,
    factory: "ASUS",
    target: "GAMING",
    isActive: true,
    cpu: null,
    gpu: null,
    ramGb: 16,
    storageGb: 512,
    screenSizeInch: 15.6,
    screenResolution: "1920x1080",
    refreshRateHz: 144,
    batteryWh: 48,
    weightGrams: 2300,
    warrantyMonths: 24,
  },
  matchScore: 86,
  highlights: ["RAM 16 GB"],
  reason: "Phù hợp với nhu cầu lập trình.",
  tradeoffs: [],
};

describe("AdvisorRecommendationCard", () => {
  it("explains match score as a rule-engine reference", () => {
    renderWithQuery(<AdvisorRecommendationCard recommendation={recommendation} />);
    expect(screen.getByText(/điểm tham khảo từ tiêu chí và thông số/i)).toBeInTheDocument();
  });
});
