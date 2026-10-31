import {
  createPendingImageSync,
  savePendingImageSyncFor,
  readPendingImageSyncFor,
} from "@/features/reviews/pending-image-sync";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it } from "vitest";
import { ReviewSection } from "@/features/reviews/ReviewSection/ReviewSection";
import { queryKeys } from "@/lib/api/query-keys";
import type { OwnerReview, ReviewEligibility, ReviewSummary } from "@/lib/api/types";
import { json, mockFetch, renderWithQuery } from "../../utils";
const summary: ReviewSummary = {
  productId: 12,
  averageRating: null,
  totalReviews: 0,
  distribution: {},
};
const page = { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } };
const owner: OwnerReview = {
  id: 18,
  productId: 12,
  rating: 5,
  title: null,
  content: "Nội dung mới đủ dài.",
  isAnonymous: false,
  status: "PUBLISHED",
  deletedAt: null,
  imageVersion: 0,
  verifiedPurchase: true,
  images: [],
  createdAt: "2026-10-31T00:00:00Z",
  updatedAt: "2026-10-31T00:00:00Z",
};
let eligibility: ReviewEligibility;
let afterCreate: Promise<Response> | undefined;
let saveResponse: Promise<Response> | undefined;
beforeEach(() => {
  sessionStorage.clear();
  eligibility = {
    eligible: true,
    reason: null,
    existingReview: null,
    willRequireModeration: false,
  };
  afterCreate = undefined;
  saveResponse = undefined;
  mockFetch().mockImplementation(async (input) => {
    if (!(input instanceof Request)) throw new Error("Request required");
    if (input.url.includes("/users/me")) return json(200, { data: { id: 7, fullName: "Buyer" } });
    if (input.url.includes("eligibility"))
      return afterCreate
        ? afterCreate.then((response) => response.clone())
        : json(200, { data: eligibility });
    if (input.method === "POST") {
      eligibility = {
        ...eligibility,
        eligible: false,
        reason: "ALREADY_REVIEWED",
        existingReview: owner,
      };
      return saveResponse
        ? saveResponse.then((response) => response.clone())
        : json(201, { data: owner });
    }
    if (input.url.includes("/images/sync"))
      return json(200, {
        data: {
          reviewId: 18,
          expectedVersion: 0,
          status: "PROCESSING",
          retryable: true,
          retryAfterMs: 120000,
          updatedAt: owner.updatedAt,
        },
      });
    if (input.url.includes("summary")) return json(200, { data: summary });
    return json(200, page);
  });
});
it.each(["Escape", "close"])("restores the actual opener after %s", async (method) => {
  renderWithQuery(<ReviewSection productId={12} initialSummary={summary} initialPage={page} />);
  const opener = await screen.findByRole("button", { name: "Viết đánh giá" });
  opener.focus();
  await userEvent.keyboard("{Enter}");
  expect(await screen.findByRole("dialog")).toBeInTheDocument();
  await userEvent.tab();
  if (method === "Escape") await userEvent.keyboard("{Escape}");
  else await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(opener).toHaveFocus());
});
it("follows the replacement opener after a delayed eligibility refresh", async () => {
  renderWithQuery(<ReviewSection productId={12} initialSummary={summary} initialPage={page} />);
  const opener = await screen.findByRole("button", { name: "Viết đánh giá" });
  await userEvent.click(opener);
  await userEvent.click(screen.getByRole("radio", { name: "5 sao" }));
  await userEvent.click(screen.getByRole("radio", { name: "Công khai tên" }));
  await userEvent.type(screen.getByRole("textbox", { name: "Nội dung" }), owner.content);
  let release!: (value: Response) => void;
  afterCreate = new Promise<Response>((resolve) => {
    release = resolve;
  });
  await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await act(async () =>
    release(
      json(200, {
        data: {
          ...eligibility,
          eligible: false,
          reason: "ALREADY_REVIEWED",
          existingReview: owner,
        },
      }),
    ),
  );
  const edit = await screen.findByRole("button", { name: "Sửa đánh giá của tôi" });
  await waitFor(() => expect(edit).toHaveFocus());
});
it("falls back to the section heading when eligibility removes the opener", async () => {
  const { client } = renderWithQuery(
    <ReviewSection productId={12} initialSummary={summary} initialPage={page} />,
  );
  await userEvent.click(await screen.findByRole("button", { name: "Viết đánh giá" }));
  await act(async () =>
    client.setQueryData(queryKeys.reviewEligibility(12, 7), {
      eligible: false,
      reason: "ORDER_NOT_COMPLETED",
      existingReview: null,
      willRequireModeration: false,
    }),
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: "Đánh giá từ khách hàng" })).toHaveFocus(),
  );
});

it("does not close on Escape while the review write is pending", async () => {
  let release!: (response: Response) => void;
  saveResponse = new Promise((resolve) => {
    release = resolve;
  });
  renderWithQuery(<ReviewSection productId={12} initialSummary={summary} initialPage={page} />);
  await userEvent.click(await screen.findByRole("button", { name: "Viết đánh giá" }));
  await userEvent.click(screen.getByRole("radio", { name: "5 sao" }));
  await userEvent.click(screen.getByRole("radio", { name: "Công khai tên" }));
  await userEvent.type(screen.getByRole("textbox", { name: "Nội dung" }), owner.content);
  await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Gửi đánh giá" })).toBeDisabled());
  await userEvent.keyboard("{Escape}");
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await act(async () => release(json(201, { data: owner })));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});
it("allows closing reconciliation while preserving its pending metadata", async () => {
  eligibility = {
    eligible: false,
    reason: "ALREADY_REVIEWED",
    existingReview: owner,
    willRequireModeration: false,
  };
  savePendingImageSyncFor(
    await createPendingImageSync({ userId: 7, productId: 12, reviewId: 18 }, 0, "processing", []),
  );
  renderWithQuery(<ReviewSection productId={12} initialSummary={summary} initialPage={page} />);
  const opener = await screen.findByRole("button", { name: "Sửa đánh giá của tôi" });
  await userEvent.click(opener);
  expect(await screen.findByText(/đang kiểm tra trạng thái ảnh/)).toBeInTheDocument();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(opener).toHaveFocus());
  expect(readPendingImageSyncFor({ userId: 7, productId: 12, reviewId: 18 }).kind).toBe("current");
});
it("does not steal focus when a later trigger replacement follows user navigation", async () => {
  const { client } = renderWithQuery(
    <ReviewSection productId={12} initialSummary={summary} initialPage={page} />,
  );
  await userEvent.click(await screen.findByRole("button", { name: "Viết đánh giá" }));
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.getByRole("button", { name: "Viết đánh giá" })).toHaveFocus());
  await userEvent.tab();
  const focusedBeforeUpdate = document.activeElement;
  expect(focusedBeforeUpdate).not.toBe(screen.getByRole("button", { name: "Viết đánh giá" }));
  await act(async () =>
    client.setQueryData(queryKeys.reviewEligibility(12, 7), {
      eligible: false,
      reason: "ORDER_NOT_COMPLETED",
      existingReview: null,
      willRequireModeration: false,
    }),
  );
  await act(async () =>
    client.setQueryData(queryKeys.reviewEligibility(12, 7), {
      eligible: false,
      reason: "ALREADY_REVIEWED",
      existingReview: owner,
      willRequireModeration: false,
    }),
  );
  await screen.findByRole("button", { name: "Sửa đánh giá của tôi" });
  expect(document.activeElement).toBe(focusedBeforeUpdate);
});
