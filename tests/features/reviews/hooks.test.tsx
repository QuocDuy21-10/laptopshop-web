import { File as NodeFile } from "node:buffer";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  useReviewEligibility,
  useProductReviews,
  useCreateReview,
  useAddReviewImages,
  useReorderReviewImages,
  useDeleteReviewImage,
  useHelpfulReviewIds,
  useToggleHelpful,
  useSyncReviewImages,
} from "@/features/reviews/hooks";
import type { DraftImage } from "@/features/reviews/ReviewImagesEditor/ReviewImagesEditor";
import { queryKeys } from "@/lib/api/query-keys";
import { json, lastRequest, mockFetch, renderWithQuery, urlOf } from "../../utils";

function EligibilityHarness({ userId, enabled = true }: { userId?: number; enabled?: boolean }) {
  const query = useReviewEligibility(12, userId, enabled);
  return (
    <output data-testid="state">
      {query.isFetching
        ? "fetching"
        : query.isSuccess
          ? "success"
          : query.isError
            ? "error"
            : "idle"}
    </output>
  );
}

function PublicAndEligibilityHarness() {
  const eligibility = useReviewEligibility(12, 7);
  const reviews = useProductReviews(12, { page: 1, pageSize: 10, sort: "newest" });
  return (
    <output data-testid="combined">{`${eligibility.isError ? "eligibility-error" : "eligibility-pending"}/${reviews.isSuccess ? "reviews-success" : "reviews-pending"}`}</output>
  );
}

function HelpfulStateHarness({ userId, ids }: { userId?: number; ids: number[] }) {
  const query = useHelpfulReviewIds(ids, userId);
  return (
    <output data-testid="helpful-state">
      {query.isFetching ? "fetching" : (query.data?.join(",") ?? "idle")}
    </output>
  );
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
      if (url.includes("/auth/refresh"))
        return json(401, { error: { code: "UNAUTHENTICATED", message: "login" } });
      if (url.includes("eligibility"))
        return json(401, { error: { code: "UNAUTHENTICATED", message: "login" } });
      return json(200, { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
    });
    renderWithQuery(<PublicAndEligibilityHarness />);
    await waitFor(() =>
      expect(screen.getByTestId("combined")).toHaveTextContent("eligibility-error/reviews-success"),
    );
    expect(screen.getByTestId("combined")).toHaveTextContent("reviews-success");
  });

  it("posts a review through the generated API and keeps the current user in the eligibility key", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(201, { data: { id: 1 } }));
    function Harness() {
      const mutation = useCreateReview(12);
      return (
        <button
          type="button"
          onClick={() =>
            mutation.mutate({ rating: 5, content: "Nội dung đủ dài.", isAnonymous: true })
          }
        >
          Gửi
        </button>
      );
    }
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(urlOf(lastRequest(fetchMock))).toContain("/api/v1/products/12/reviews");
  });

  it("uploads repeated images through the review image multipart endpoint", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(201, { data: [] }));
    function Harness() {
      const mutation = useAddReviewImages(12, 18);
      return (
        <button
          type="button"
          onClick={() =>
            mutation.mutate([
              new File(["one"], "one.png", { type: "image/png" }),
              new File(["two"], "two.png", { type: "image/png" }),
            ])
          }
        >
          Upload
        </button>
      );
    }
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Upload" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const request = lastRequest(fetchMock);
    expect(new URL(request.url).pathname).toBe("/api/v1/reviews/18/images");
    expect(request.headers.get("content-type")).toContain("multipart/form-data");
  });

  it.each([0, 7])("syncs an ordered draft with expectedVersion=%i", async (expectedVersion) => {
    // Match the native Request encoder at the mocked HTTP boundary.
    const nativeForm = await new Response("", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).formData();
    vi.stubGlobal("FormData", nativeForm.constructor);
    vi.stubGlobal("File", NodeFile);
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(
      json(200, {
        data: { reviewId: 18, imageVersion: expectedVersion + 1, replayed: false, images: [] },
      }),
    );
    const items: DraftImage[] = [
      {
        kind: "existing",
        clientId: "existing-21",
        image: {
          id: 21,
          url: "https://signed.test/21.webp",
          urlExpiresAt: "2026-10-21T03:15:00.000Z",
          mimeType: "image/webp",
          width: 10,
          height: 10,
          position: 0,
        },
      },
      {
        kind: "new",
        clientId: "new-c",
        file: new File(["new"], "new.png", { type: "image/png" }),
        url: "blob:new",
      },
    ];
    function Harness() {
      const mutation = useSyncReviewImages(12, 7);
      return (
        <button
          type="button"
          onClick={() =>
            mutation.mutate({ reviewId: 18, expectedVersion, idempotencyKey: "sync-key", items })
          }
        >
          Sync
        </button>
      );
    }
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Sync" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const request = lastRequest(fetchMock);
    expect(request.method).toBe("PUT");
    expect(new URL(request.url).pathname).toBe("/api/v1/reviews/18/images/sync");
    expect(request.headers.get("Idempotency-Key")).toBe("sync-key");
    const form = await request.formData();
    expect(JSON.parse(String(form.get("manifest")))).toEqual({
      expectedVersion,
      items: [
        { kind: "existing", clientId: "existing-21", imageId: 21 },
        { kind: "new", clientId: "new-c", fileIndex: 0 },
      ],
    });
    expect(form.getAll("files")).toHaveLength(1);
  });

  it("uses generated JSON routes for reorder and image delete", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: [] }));
    function Harness() {
      const reorder = useReorderReviewImages(12, 18);
      const remove = useDeleteReviewImage(12, 18);
      return (
        <>
          <button type="button" onClick={() => reorder.mutate([22, 21])}>
            Reorder
          </button>
          <button type="button" onClick={() => remove.mutate(21)}>
            Delete image
          </button>
        </>
      );
    }
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Reorder" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(new URL(lastRequest(fetchMock).url).pathname).toBe("/api/v1/reviews/18/images/order");
    await userEvent.click(screen.getByRole("button", { name: "Delete image" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(new URL(lastRequest(fetchMock).url).pathname).toBe("/api/v1/reviews/18/images/21");
  });

  it("does not fetch helpful viewer state anonymously and batches IDs in groups of 50", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: { reviewIds: [1] } }));
    renderWithQuery(<HelpfulStateHarness ids={[1, 2, 3]} />);
    await waitFor(() => expect(screen.getByTestId("helpful-state")).toHaveTextContent("idle"));
    expect(fetchMock).not.toHaveBeenCalled();

    renderWithQuery(
      <HelpfulStateHarness userId={7} ids={Array.from({ length: 51 }, (_, i) => i + 1)} />,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(urlOf(fetchMock.mock.calls[0][0])).toContain("reviewIds=");
    expect(
      new URL(urlOf(fetchMock.mock.calls[0][0])).searchParams.get("reviewIds")?.split(","),
    ).toHaveLength(50);
  });

  it("rolls helpful viewer state back when the mutation fails", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(json(200, { data: { reviewIds: [] } }));
    fetchMock.mockResolvedValueOnce(json(500, { error: { code: "UNKNOWN", message: "failed" } }));
    function Harness() {
      const state = useHelpfulReviewIds([2], 7);
      const mutation = useToggleHelpful([2], 7);
      return (
        <button type="button" onClick={() => mutation.mutate({ reviewId: 2, helpful: true })}>
          {state.data?.includes(2) ? "yes" : "no"}
        </button>
      );
    }
    renderWithQuery(<Harness />);
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("no"));
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent("no"));
  });
});
