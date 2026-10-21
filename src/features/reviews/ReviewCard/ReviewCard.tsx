import { Badge } from "@/components/ui/Badge/Badge";
import type { PublicReview } from "@/lib/api/types";
import { ReviewGallery } from "../ReviewGallery/ReviewGallery";
import { HelpfulButton } from "../HelpfulButton/HelpfulButton";
import styles from "./ReviewCard.module.scss";

export function ReviewCard({ review, productId, reviewIds, userId, helpful, selfVoteDisabled }: { review: PublicReview; productId: number; reviewIds: number[]; userId?: number; helpful: boolean; selfVoteDisabled?: boolean }) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div>
          <p className={styles.author}>{review.author.name}</p>
          <Badge tone="success">Đã mua hàng</Badge>
        </div>
        <span className={styles.rating} aria-label={`${review.rating} trên 5 sao`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
      </header>
      {review.title && <h3 className={styles.title}>{review.title}</h3>}
      <p className={styles.content}>{review.content}</p>
      <ReviewGallery images={review.images} />
      <HelpfulButton key={`${review.id}-${helpful}-${review.helpfulCount}`} productId={productId} reviewId={review.id} reviewIds={reviewIds} userId={userId} count={review.helpfulCount} helpful={helpful} selfVoteDisabled={selfVoteDisabled} />
    </article>
  );
}
