import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import type { PublicReview } from "@/lib/api/types";
import { ReviewCard } from "../ReviewCard/ReviewCard";
import styles from "./ReviewList.module.scss";

type Props = {
  reviews: PublicReview[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  productId: number;
  reviewIds: number[];
  helpfulIds: number[];
  userId?: number;
  selfReviewId?: number;
  onImageError?: () => void;
};

export function ReviewList({ reviews, isPending, isError, onRetry, page, totalPages, onPage, productId, reviewIds, helpfulIds, userId, selfReviewId, onImageError }: Props) {
  if (isError) {
    return <Alert tone="error" title="Không thể tải đánh giá"><Button variant="secondary" onClick={onRetry}>Thử lại</Button></Alert>;
  }
  if (isPending && reviews.length === 0) return <div className={styles.loading}><Skeleton /><Skeleton /><Skeleton /></div>;
  if (reviews.length === 0) return <p className={styles.empty}>Chưa có đánh giá nào</p>;
  return (
    <div className={styles.list}>
      {reviews.map((review) => <ReviewCard key={review.id} review={review} productId={productId} reviewIds={reviewIds} userId={userId} helpful={helpfulIds.includes(review.id)} selfVoteDisabled={review.id === selfReviewId} onImageError={onImageError} />)}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Phân trang đánh giá">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Trang trước</Button>
          <span aria-current="page">Trang {page} / {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Trang sau</Button>
        </nav>
      )}
    </div>
  );
}
