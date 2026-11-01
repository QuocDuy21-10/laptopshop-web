import Link from "next/link";
import type { ReviewHighlights as ReviewHighlightsData } from "@/lib/api/types";
import { HomeSection } from "../HomeSection/HomeSection";
import { ScrollRow } from "../ScrollRow/ScrollRow";
import styles from "./ReviewHighlights.module.scss";

const stars = (rating: number) => "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));

export function ReviewHighlights({ data }: { data: ReviewHighlightsData }) {
  if (data.items.length === 0) return null;
  const { averageRating, totalReviews } = data.summary;
  return (
    <HomeSection id="reviews" title="Khách hàng nói gì về LaptopShop?">
      {averageRating !== null && (
        <p className={styles.summary}>
          <span className={styles.stars} aria-hidden="true">
            {stars(Math.round(averageRating))}
          </span>
          <span className={styles.average}>{averageRating.toFixed(1)}</span>
          <span className={styles.total}>{totalReviews} đánh giá</span>
        </p>
      )}
      <ScrollRow label="Đánh giá nổi bật" className={styles.row}>
        {data.items.map((review) => (
          <li key={review.id} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.author}>{review.author.name}</span>
              <span className={styles.stars} role="img" aria-label={`${review.rating} trên 5 sao`}>
                {stars(review.rating)}
              </span>
            </div>
            {review.title && <p className={styles.reviewTitle}>{review.title}</p>}
            <p className={styles.content}>{review.content}</p>
            <Link href={`/products/${review.product.id}`} className={styles.product}>
              {review.product.name}
            </Link>
          </li>
        ))}
      </ScrollRow>
    </HomeSection>
  );
}
