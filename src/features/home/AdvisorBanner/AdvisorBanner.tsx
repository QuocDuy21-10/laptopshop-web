import { Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button/Button";
import styles from "./AdvisorBanner.module.scss";

export function AdvisorBanner() {
  return (
    <section aria-labelledby="advisor-heading" className={styles.banner}>
      <span className={styles.icon} aria-hidden="true">
        <Sparkles size={28} />
      </span>
      <div className={styles.text}>
        <h2 id="advisor-heading" className={styles.title}>
          Chưa biết chọn laptop nào?
        </h2>
        <p className={styles.description}>
          Cho biết nhu cầu và ngân sách, LaptopShop gợi ý những mẫu phù hợp để bạn so sánh.
        </p>
      </div>
      <Link href="/advisor" className={buttonClassName({ size: "lg" })}>
        Nhận gợi ý <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
