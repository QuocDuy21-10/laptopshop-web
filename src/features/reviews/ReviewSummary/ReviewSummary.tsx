import type { ReviewSummary as ReviewSummaryData } from "@/lib/api/types";
import styles from "./ReviewSummary.module.scss";

export function ReviewSummary({ summary }: { summary: ReviewSummaryData }) {
  const total = summary.totalReviews;
  const distribution = summary.distribution ?? {};
  return (
    <div className={styles.summary}>
      <div className={styles.average}>
        <span className={styles.score}>{summary.averageRating ?? "—"}</span>
        <span className={styles.outOf}>{summary.averageRating === null ? "Chưa có điểm trung bình" : "/ 5"}</span>
        <span className={styles.total}>{total} lượt đánh giá</span>
      </div>
      <div className={styles.distribution} aria-label="Phân bố số sao">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[String(rating) as unknown as keyof typeof distribution] ?? 0;
          return (
            <div className={styles.row} key={rating}>
              <span>{rating} sao</span>
              <progress max={Math.max(total, 1)} value={count} aria-label={`${rating} sao: ${count} lượt`} />
              <span className={styles.count}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
