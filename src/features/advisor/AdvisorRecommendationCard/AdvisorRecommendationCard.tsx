import type { AdvisorRecommendation } from "@/lib/api/types";
import styles from "./AdvisorRecommendationCard.module.scss";
import { ProductCard } from "@/features/products/ProductCard/ProductCard";

export function AdvisorRecommendationCard({ recommendation }: { recommendation: AdvisorRecommendation }) {
  return (
    <section className={styles.card} aria-labelledby={`advisor-recommendation-${recommendation.product.id}`}>
      <div className={styles.heading}>
        <h3 id={`advisor-recommendation-${recommendation.product.id}`} className={styles.title}>
          Phù hợp {recommendation.matchScore}/100
        </h3>
        <p className={styles.scoreHelp}>Điểm tham khảo từ tiêu chí và thông số, không phải benchmark tuyệt đối.</p>
        <div className={styles.highlights}>
          {recommendation.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
        </div>
      </div>
      <ProductCard product={recommendation.product} />
      <p className={styles.scoreHelp}>Giá tư vấn đã gồm khuyến mãi tự động, chưa gồm Flash Sale; giá cuối cùng được xác nhận khi thanh toán.</p>
      <p className={styles.reason}>{recommendation.reason}</p>
      {recommendation.tradeoffs.length > 0 && (
        <div className={styles.tradeoffs}>
          <strong>Điểm cần cân nhắc</strong>
          <ul>
            {recommendation.tradeoffs.slice(0, 2).map((tradeoff) => <li key={tradeoff}>{tradeoff}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
