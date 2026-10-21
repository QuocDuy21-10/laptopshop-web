import { Badge } from "@/components/ui/Badge/Badge";
import type { PublicReview } from "@/lib/api/types";
import styles from "./ReviewCard.module.scss";

export function ReviewCard({ review }: { review: PublicReview }) {
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
    </article>
  );
}
