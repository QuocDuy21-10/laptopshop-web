import { Briefcase, Feather, Gamepad2, Laptop, Palette, ShieldCheck, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/features/products/ProductImage/ProductImage";
import { HomeSection } from "../HomeSection/HomeSection";
import styles from "./TargetGrid.module.scss";

const TARGET_META: Record<string, { icon: LucideIcon; description: string }> = {
  GAMING: { icon: Gamepad2, description: "Máy cấu hình mạnh cho chơi game" },
  SINHVIEN_VANPHONG: { icon: Briefcase, description: "Máy cho học tập và văn phòng" },
  THIET_KE_DO_HOA: { icon: Palette, description: "Máy cho dựng hình và thiết kế" },
  MONG_NHE: { icon: Feather, description: "Máy gọn nhẹ, dễ mang theo" },
  DOANH_NHAN: { icon: ShieldCheck, description: "Máy cho công việc doanh nghiệp" },
};

type Props = { targets: { value: string; name: string }[]; images: Record<string, string | null> };

export function TargetGrid({ targets, images }: Props) {
  return (
    <HomeSection id="targets" title="Mua laptop theo nhu cầu" subtitle="Chọn đúng dòng máy cho công việc và phong cách của bạn">
      <ul role="list" className={styles.grid}>
        {targets.map((target) => {
          const meta = TARGET_META[target.value];
          const Icon = meta?.icon ?? Laptop;
          const image = images[target.value];
          return (
            <li key={target.value}>
              <Link href={`/products?target=${encodeURIComponent(target.value)}`} className={styles.card}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={22} />
                </span>
                <span className={styles.name}>{target.name}</span>
                {meta && <span className={styles.description}>{meta.description}</span>}
                {image && (
                  <span className={styles.visual}>
                    <ProductImage src={image} alt="" sizes="(min-width: 1024px) 18vw, 50vw" />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </HomeSection>
  );
}
