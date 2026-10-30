import type { FC, ReactNode } from "react";
import Link from "next/link";
import styles from "./BrandMarquee.module.scss";

export interface PartnerBrand {
  key: string;
  name: string;
  href: string;
  logo: ReactNode;
  /** The logo already spells the name, so no text label is shown beside it. */
  wordmark?: boolean;
}

export const PARTNER_BRANDS: PartnerBrand[] = [
  {
    key: "APPLE",
    name: "Apple",
    href: "/products?factory=APPLE",
    logo: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.6.69-1.12 1.83-.98 2.93 1.07.08 2.14-.52 2.79-1.27z" />
      </svg>
    ),
  },
  {
    key: "ASUS",
    wordmark: true,
    name: "ASUS",
    href: "/products?factory=ASUS",
    logo: (
      <svg viewBox="0 0 48 24" width="36" height="18" fill="currentColor" aria-hidden="true">
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontWeight="900"
          fontSize="15"
          letterSpacing="1"
        >
          ASUS
        </text>
      </svg>
    ),
  },
  {
    key: "DELL",
    wordmark: true,
    name: "Dell",
    href: "/products?factory=DELL",
    logo: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <text
          x="12"
          y="15"
          fill="currentColor"
          stroke="none"
          textAnchor="middle"
          fontFamily="sans-serif"
          fontWeight="bold"
          fontSize="7"
          letterSpacing="0.5"
        >
          DELL
        </text>
      </svg>
    ),
  },
  {
    key: "LENOVO",
    wordmark: true,
    name: "Lenovo",
    href: "/products?factory=LENOVO",
    logo: (
      <svg viewBox="0 0 54 22" width="40" height="16" fill="currentColor" aria-hidden="true">
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontWeight="800"
          fontSize="13"
          letterSpacing="0.5"
        >
          Lenovo
        </text>
      </svg>
    ),
  },
  {
    key: "HP",
    name: "HP",
    href: "/products?factory=HP",
    logo: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9 7v10M15 7v10M9 12h6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "ACER",
    wordmark: true,
    name: "Acer",
    href: "/products?factory=ACER",
    logo: (
      <svg viewBox="0 0 46 22" width="36" height="16" fill="currentColor" aria-hidden="true">
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontWeight="800"
          fontSize="14"
          letterSpacing="1"
        >
          acer
        </text>
      </svg>
    ),
  },
  {
    key: "MSI",
    wordmark: true,
    name: "MSI",
    href: "/products?factory=MSI",
    logo: (
      <svg viewBox="0 0 44 22" width="34" height="16" fill="currentColor" aria-hidden="true">
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="sans-serif"
          fontWeight="900"
          fontSize="14"
          letterSpacing="1.5"
        >
          MSI
        </text>
      </svg>
    ),
  },
  {
    key: "LG",
    name: "LG",
    href: "/products?factory=LG",
    logo: (
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <path d="M15 8v8h-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

interface BrandMarqueeProps {
  brands?: PartnerBrand[];
}

export const BrandMarquee: FC<BrandMarqueeProps> = ({ brands = PARTNER_BRANDS }) => {
  return (
    <section className={styles.marqueeSection} aria-label="Thương hiệu đối tác chính hãng">
      <div className={styles.headerRow}>
        <span className={styles.heading}>Thương hiệu máy tính hàng đầu</span>
        <Link href="/products" className={styles.viewAllLink}>
          Tất cả thương hiệu &rarr;
        </Link>
      </div>

      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {/* First loop */}
          {brands.map((brand) => (
            <Link
              key={brand.key}
              href={brand.href}
              className={styles.brandCard}
              data-brand={brand.key}
              title={`Xem laptop ${brand.name}`}
              aria-label={brand.wordmark ? `Xem laptop ${brand.name}` : undefined}
            >
              {brand.logo}
              {!brand.wordmark && <span className={styles.brandName}>{brand.name}</span>}
            </Link>
          ))}

          {/* Duplicated loop for infinite seamless scroll */}
          {brands.map((brand) => (
            <Link
              key={`${brand.key}-dup`}
              href={brand.href}
              className={`${styles.brandCard} ${styles.duplicate}`}
              data-brand={brand.key}
              aria-hidden="true"
              tabIndex={-1}
            >
              {brand.logo}
              {!brand.wordmark && <span className={styles.brandName}>{brand.name}</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
