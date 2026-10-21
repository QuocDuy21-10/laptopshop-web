"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import type { ProductReviewsQuery, PublicReview, ReviewSummary as ReviewSummaryData } from "@/lib/api/types";
import { useProductReviews, useReviewSummary } from "../hooks";
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
  const query: ProductReviewsQuery = { page, pageSize: 10, ...(rating ? { rating } : {}), sort };
  const summaryQuery = useReviewSummary(productId);
  const reviewsQuery = useProductReviews(productId, query);
  const summary = summaryQuery.data ?? initialSummary;
  const pageData = reviewsQuery.data ?? (page === 1 && !rating && sort === "newest" ? initialPage : { data: [], meta: { page, pageSize: 10, total: 0, totalPages: 0 } });

  return (
    <section id="reviews" className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.heading}>
        <div><h2 id="reviews-title">Đánh giá từ khách hàng</h2><p>Chỉ hiển thị nhận xét từ đơn hàng đã hoàn tất.</p></div>
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
      <ReviewList reviews={pageData.data} isPending={reviewsQuery.isPending && initialPage.data.length > 0} isError={reviewsQuery.isError} onRetry={() => void reviewsQuery.refetch()} page={pageData.meta.page} totalPages={pageData.meta.totalPages} onPage={setPage} />
    </section>
  );
}
