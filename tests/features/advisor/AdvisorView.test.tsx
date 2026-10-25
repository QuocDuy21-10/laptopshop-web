import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { AdvisorView } from "@/features/advisor/AdvisorView/AdvisorView";
import { json, mockFetch, renderWithQuery } from "../../utils";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => "/advisor" }));

const product = {
  id: 3,
  name: "Laptop Asus TUF Gaming",
  price: 17_490_000,
  image: "/images/product/a.png",
  detailDesc: "detail",
  shortDesc: "short",
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

beforeEach(() => localStorage.clear());

describe("AdvisorView", () => {
  it("cancels a pending request before editing criteria", async () => {
    const fetchMock = mockFetch();
    let resolveAdvisor!: (response: Response) => void;
    fetchMock.mockImplementation(async (input) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.includes("/api/v1/advisor/recommend")) {
        return new Promise<Response>((resolve) => {
          resolveAdvisor = resolve;
        });
      }
      return json(200, { data: null });
    });
    renderWithQuery(<AdvisorView />);
    await userEvent.type(screen.getByLabelText(/Ngân sách tối đa/), "20000000");
    await userEvent.click(screen.getByLabelText("Lập trình / CNTT"));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Nhận tư vấn" }));
    const pendingRequest = (fetchMock.mock.calls.find(([input]) => {
      const url = input instanceof Request ? input.url : String(input);
      return url.includes("/api/v1/advisor/recommend");
    })?.[0] as Request);
    await screen.findByRole("button", { name: "Hủy và sửa tiêu chí" });
    await userEvent.click(screen.getByRole("button", { name: "Hủy và sửa tiêu chí" }));
    expect(pendingRequest.signal.aborted).toBe(true);
    expect(screen.getByText("Bước 1/4")).toBeInTheDocument();
    resolveAdvisor(json(200, { data: { mode: "rule_based", recommendations: [], suggestions: [] } }));
  });

  it("submits the wizard and focuses the results heading", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(
      json(200, {
        data: {
          mode: "rule_based",
          recommendations: [{ product, matchScore: 86, highlights: ["RAM 16 GB"], reason: "Lý do", tradeoffs: [] }],
          suggestions: [],
        },
      }),
    );
    renderWithQuery(<AdvisorView />);
    await userEvent.type(screen.getByLabelText(/Ngân sách tối đa/), "20000000");
    await userEvent.click(screen.getByLabelText("Lập trình / CNTT"));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Nhận tư vấn" }));
    const heading = await screen.findByRole("heading", { name: "Laptop phù hợp với bạn" });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenCalledTimes(2); // advisor recommendation plus the shared session lookup used by wishlist controls
  });

  it("focuses the empty result and resets the wizard when editing criteria", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: { mode: "rule_based", recommendations: [], suggestions: ["Tăng ngân sách"] } }));
    renderWithQuery(<AdvisorView />);
    await userEvent.type(screen.getByLabelText(/Ngân sách tối đa/), "20000000");
    await userEvent.click(screen.getByLabelText("Lập trình / CNTT"));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Nhận tư vấn" }));
    const heading = await screen.findByRole("heading", { name: "Laptop phù hợp với bạn" });
    await waitFor(() => expect(heading).toHaveFocus());
    await userEvent.click(screen.getByRole("button", { name: "Sửa tiêu chí" }));
    expect(screen.getByText("Bước 1/4")).toBeInTheDocument();
  });

  it("offers a retry after a network failure and preserves the wizard", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch")).mockResolvedValueOnce(
      json(200, { data: { mode: "rule_based", recommendations: [{ product, matchScore: 86, highlights: [], reason: "Lý do", tradeoffs: [] }], suggestions: [] } }),
    );
    renderWithQuery(<AdvisorView />);
    await userEvent.type(screen.getByLabelText(/Ngân sách tối đa/), "20000000");
    await userEvent.click(screen.getByLabelText("Lập trình / CNTT"));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
    await userEvent.click(screen.getByRole("button", { name: "Nhận tư vấn" }));
    await screen.findByRole("button", { name: "Thử lại" });
    await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Laptop phù hợp với bạn" })).toHaveFocus());
  });
});
