import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { useReviewEligibility, useProductReviews } from "@/features/reviews/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import { json, mockFetch, renderWithQuery, urlOf } from "../../utils";

function EligibilityHarness({ userId, enabled = true }: { userId?: number; enabled?: boolean }) {
  const query = useReviewEligibility(12, userId, enabled);
  return <output data-testid="state">{query.isFetching ? "fetching" : query.isSuccess ? "success" : query.isError ? "error" : "idle"}</output>;
}

function PublicAndEligibilityHarness() {
  const eligibility = useReviewEligibility(12, 7);
  const reviews = useProductReviews(12, { page: 1, pageSize: 10, sort: "newest" });
  return <output data-testid="combined">{`${eligibility.isError ? "eligibility-error" : "eligibility-pending"}/${reviews.isSuccess ? "reviews-success" : "reviews-pending"}`}</output>;
}

describe("review query hooks", () => {
  beforeEach(() => mockFetch());

  it("does not fetch eligibility when userId is absent", async () => {
    const fetchMock = mockFetch();
    renderWithQuery(<EligibilityHarness userId={undefined} />);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("idle"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps eligibility keys isolated by user", () => {
    expect(queryKeys.reviewEligibility(12, 1)).not.toEqual(queryKeys.reviewEligibility(12, 2));
    expect(queryKeys.reviewSummary(12)[0]).toBe("reviews");
    expect(queryKeys.productReviews(12, { page: 1 })[0]).toBe("reviews");
  });

  it("keeps public review data usable when eligibility returns 401", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockImplementation(async (input) => {
      const url = urlOf(input);
      if (url.includes("/auth/refresh")) return json(401, { error: { code: "UNAUTHENTICATED", message: "login" } });
      if (url.includes("eligibility")) return json(401, { error: { code: "UNAUTHENTICATED", message: "login" } });
      return json(200, { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
    });
    renderWithQuery(<PublicAndEligibilityHarness />);
    await waitFor(() => expect(screen.getByTestId("combined")).toHaveTextContent("eligibility-error/reviews-success"));
    expect(screen.getByTestId("combined")).toHaveTextContent("reviews-success");
  });
});
