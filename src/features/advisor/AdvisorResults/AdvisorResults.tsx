import type { Ref } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import type { AdvisorResult } from "@/lib/api/types";
import { AdvisorRecommendationCard } from "../AdvisorRecommendationCard/AdvisorRecommendationCard";
import styles from "./AdvisorResults.module.scss";

type Props = { result: AdvisorResult | null; loading: boolean; onEdit: () => void; headingRef?: Ref<HTMLHeadingElement> };

export function AdvisorResults({ result, loading, onEdit, headingRef }: Props) {
  if (loading) {
    return <div className={styles.loading} role="status" aria-live="polite"><Skeleton /><Skeleton /><Skeleton /></div>;
  }
  if (!result || result.recommendations.length === 0) {
    return <EmptyState title="Chưa tìm thấy laptop phù hợp" description={result?.suggestions.join(" ")} action={<Button onClick={onEdit}>Sửa tiêu chí</Button>} />;
  }
  return (
    <section className={styles.results} aria-labelledby="advisor-results-title">
      <h2 id="advisor-results-title" ref={headingRef} tabIndex={-1} className={styles.title}>Laptop phù hợp với bạn</h2>
      {result.mode === "rule_based" && <Alert tone="info" title="Đề xuất đang dùng chế độ dự phòng">Đề xuất đang được tạo từ tiêu chí và thông số sản phẩm; phần giải thích AI tạm thời không khả dụng.</Alert>}
      <div className={styles.grid}>
        {result.recommendations.map((recommendation) => <AdvisorRecommendationCard key={recommendation.product.id} recommendation={recommendation} />)}
      </div>
    </section>
  );
}
