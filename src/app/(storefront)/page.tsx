import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container/Container";
import { Alert } from "@/components/ui/Alert/Alert";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { BrandMarquee, HeroSlider, QuickFilterBar } from "@/features/home";
import { optionName, targetName } from "@/features/products/labels";
import { ProductGrid } from "@/features/products/ProductGrid/ProductGrid";
import { getFilterOptions, listProducts } from "@/features/products/server";
import type { CatalogProduct, FilterOptions } from "@/lib/api/types";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "LaptopShop — Chọn đúng laptop cho công việc và giải trí",
  description:
    "Cửa hàng laptop chính hãng. So sánh cấu hình trực quan, tư vấn chọn máy theo nhu cầu và ngân sách thực tế.",
};

const TARGET_CARDS = [
  {
    key: "GAMING",
    desc: "Máy cấu hình mạnh cho chơi game",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <rect x="2" y="6" width="20" height="12" rx="2" />
      </svg>
    ),
  },
  {
    key: "SINHVIEN_VANPHONG",
    desc: "Máy cho học tập và văn phòng",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    key: "THIET_KE_DO_HOA",
    desc: "Máy cho dựng hình và thiết kế",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
  {
    key: "MONG_NHE",
    desc: "Máy gọn nhẹ, dễ mang theo",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
      </svg>
    ),
  },
  {
    key: "DOANH_NHAN",
    desc: "Máy cho công việc doanh nghiệp",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
] as const;

const POPULAR_BRANDS = ["APPLE", "ASUS", "DELL", "LENOVO", "LG", "ACER"] as const;

export default async function HomePage() {
  let products: CatalogProduct[] = [];
  let options: FilterOptions | null = null;
  let loadError: string | null = null;

  try {
    const [loadedOptions, result] = await Promise.all([
      getFilterOptions(),
      listProducts({ page: 1, pageSize: 8 }),
    ]);
    options = loadedOptions;
    products = result.data;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Không tải được danh sách sản phẩm.";
  }

  return (
    <Container className={styles.page}>
      {/* HERO SECTION: Slider 100% + Quick Filter Bar + Brand Marquee */}
      <div className={styles.heroGroup}>
        <HeroSlider />
        <QuickFilterBar />
        <BrandMarquee />
      </div>

      {/* THEO NHU CẦU */}
      <section className={styles.section} aria-labelledby="targets-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="targets-heading" className={styles.sectionTitle}>
              Theo nhu cầu
            </h2>
            <p className={styles.sectionSubtitle}>
              Lọc nhanh các dòng máy được tối ưu sẵn cho từng mục đích sử dụng
            </p>
          </div>
        </div>
        <div className={styles.targetGrid}>
          {TARGET_CARDS.map(({ key, desc, icon }) => (
            <Link key={key} href={`/products?target=${key}`} className={styles.targetCard}>
              <div className={styles.targetIconWrap} aria-hidden>
                {icon}
              </div>
              <div className={styles.targetContent}>
                <span className={styles.targetName}>{targetName(options?.targetOptions ?? [], key)}</span>
                <span className={styles.targetDesc}>{desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DANH SÁCH SẢN PHẨM */}
      <section className={styles.section} aria-labelledby="featured-heading">
        <div className={styles.sectionHeader}>
          <div>
            <h2 id="featured-heading" className={styles.sectionTitle}>
              Laptop đang bán
            </h2>
            <p className={styles.sectionSubtitle}>
              Giá niêm yết rõ ràng, cập nhật tồn kho thời gian thực
            </p>
          </div>
          <Link href="/products" className={styles.sectionLink}>
            Xem toàn bộ danh mục <span aria-hidden>→</span>
          </Link>
        </div>

        {/* LỐI TẮT THƯƠNG HIỆU */}
        <div className={styles.brandStrip} aria-label="Lọc nhanh theo thương hiệu">
          <Link href="/products" className={`${styles.brandPill} ${styles.brandPillActive}`}>
            Tất cả hãng
          </Link>
          {POPULAR_BRANDS.map((brandKey) => (
            <Link
              key={brandKey}
              href={`/products?factory=${brandKey}`}
              className={styles.brandPill}
            >
              {optionName(options?.factoryOptions ?? [], brandKey) || brandKey}
            </Link>
          ))}
        </div>

        {loadError ? (
          <Alert tone="error" title="Không tải được sản phẩm">
            {loadError}
          </Alert>
        ) : products.length === 0 ? (
          <EmptyState
            title="Chưa có sản phẩm hiển thị"
            description="Danh mục đang được cập nhật."
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </Container>
  );
}
