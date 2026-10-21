import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewAction } from "@/features/reviews/ReviewAction/ReviewAction";
import { json, mockFetch, renderWithQuery, urlOf } from "../../utils";

describe("ReviewAction", () => {
  beforeEach(() => mockFetch());

  it("does not fetch eligibility before the customer opens the action", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: { id: 7, fullName: "E2E Buyer" } }));
    renderWithQuery(<ReviewAction productId={12} productName="Asus Zenbook" />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls.some(([input]) => urlOf(input).includes("eligibility"))).toBe(false);
  });

  it("opens the shared dialog and fetches eligibility lazily", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockImplementation(async (input) => {
      const url = urlOf(input);
      if (url.includes("/users/me")) return json(200, { data: { id: 7, fullName: "E2E Buyer" } });
      return json(200, { data: { eligible: true, reason: null, existingReview: null, willRequireModeration: false } });
    });
    renderWithQuery(<ReviewAction productId={12} productName="Asus Zenbook" />);
    await userEvent.click(screen.getByRole("button", { name: "Đánh giá sản phẩm" }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([input]) => urlOf(input).includes("eligibility"))).toBe(true));
    expect(await screen.findByRole("button", { name: "Gửi đánh giá" })).toBeInTheDocument();
  });
});
