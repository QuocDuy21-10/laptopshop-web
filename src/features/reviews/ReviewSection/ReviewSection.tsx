"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button, buttonClassName } from "@/components/ui/Button/Button";
import Link from "next/link";
import { useMe } from "@/features/account/useMe";
import { loginHref } from "@/lib/safe-next";
import { useHydrated } from "@/lib/useHydrated";
import type { ProductReviewsQuery, PublicReview, ReviewSummary as ReviewSummaryData } from "@/lib/api/types";
import { useHelpfulReviewIds, useProductReviews, useReviewEligibility, useReviewSummary } from "../hooks";
import { ReviewDialog } from "../ReviewDialog/ReviewDialog";
import { ReviewList } from "../ReviewList/ReviewList";
import { ReviewSummary } from "../ReviewSummary/ReviewSummary";
import styles from "./ReviewSection.module.scss";

type Props = {
  productId: number;
  initialSummary: ReviewSummaryData;
  initialPage: { data: PublicReview[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };
};

export function ReviewSection({ productId, initialSummary, initialPage }: Props) {
  const [rating, setRating] = useState<number | undefined>();
  const [sort, setSort] = useState<ProductReviewsQuery["sort"]>("newest");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const query: ProductReviewsQuery = { page, pageSize: 10, ...(rating ? { rating } : {}), sort };
  const summaryQuery = useReviewSummary(productId);
  const reviewsQuery = useProductReviews(productId, query);
  const me = useMe();
  const hydrated = useHydrated();
  const eligibility = useReviewEligibility(productId, me.data?.id);
  const summary = summaryQuery.data ?? initialSummary;
  const pageData = reviewsQuery.data ?? (page === 1 && !rating && sort === "newest" ? initialPage : { data: [], meta: { page, pageSize: 10, total: 0, totalPages: 0 } });
  const visibleReviewIds = pageData.data.map((review) => review.id);
  const helpfulState = useHelpfulReviewIds(visibleReviewIds, me.data?.id);
  const eligibilityMessage = eligibility.data?.reason === "NOT_PURCHASED"
    ? "Chỉ khách đã mua sản phẩm mới có thể đánh giá."
    : eligibility.data?.reason === "ORDER_NOT_COMPLETED"
      ? "Bạn có thể đánh giá sau khi đơn hàng hoàn tất."
      : eligibility.data?.reason === "PAYMENT_NOT_CONFIRMED"
        ? "Đánh giá sẽ mở sau khi thanh toán được xác nhận."
        : null;

  return (
    <section id="reviews" className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.heading}>
        <div><h2 id="reviews-title">Đánh giá từ khách hàng</h2><p>Chỉ hiển thị nhận xét từ đơn hàng đã hoàn tất.</p></div>
        <div className={styles.action}>
          {!hydrated || me.isPending ? null : !me.data ? <Link className={buttonClassName({ variant: "secondary" })} href={loginHref(`/products/${productId}#reviews`)}>Đăng nhập để đánh giá</Link> : eligibility.data?.existingReview ? <Button variant="secondary" onClick={() => setDialogOpen(true)}>Sửa đánh giá của tôi</Button> : eligibility.data?.eligible ? <Button onClick={() => setDialogOpen(true)}>Viết đánh giá</Button> : eligibilityMessage ? <p className={styles.eligibility}>{eligibilityMessage}</p> : null}
        </div>
      </div>
      {summaryQuery.isError ? <Alert tone="warning" title="Chưa thể tải thống kê đánh giá" /> : <ReviewSummary summary={summary} />}
      <div className={styles.toolbar}>
        <label> Lọc theo số sao
          <select aria-label="Lọc theo số sao" value={rating ?? ""} onChange={(event) => { setRating(event.target.value ? Number(event.target.value) : undefined); setPage(1); }}>
            <option value="">Tất cả</option><option value="5">5 sao</option><option value="4">4 sao</option><option value="3">3 sao</option><option value="2">2 sao</option><option value="1">1 sao</option>
          </select>
        </label>
        <label> Sắp xếp
          <select aria-label="Sắp xếp" value={sort} onChange={(event) => { setSort(event.target.value as ProductReviewsQuery["sort"]); setPage(1); }}>
            <option value="newest">Mới nhất</option><option value="highest">Cao nhất</option><option value="lowest">Thấp nhất</option>
          </select>
        </label>
      </div>
      <ReviewList reviews={pageData.data} productId={productId} reviewIds={visibleReviewIds} helpfulIds={helpfulState.data ?? []} userId={me.data?.id} selfReviewId={eligibility.data?.existingReview?.id} isPending={reviewsQuery.isPending && initialPage.data.length > 0} isError={reviewsQuery.isError} onRetry={() => void reviewsQuery.refetch()} onImageError={() => void reviewsQuery.refetch()} page={pageData.meta.page} totalPages={pageData.meta.totalPages} onPage={setPage} />
      {eligibility.data && <ReviewDialog productId={productId} productName="sản phẩm này" eligibility={eligibility.data} open={dialogOpen} onOpenChange={setDialogOpen} />}
    </section>
  );
}
