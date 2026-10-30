import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo/BrandLogo";
import styles from "./layout.module.scss";

// No storefront header here: login/register is a focused flow, so the only way out is the logo or the back link.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label="LaptopShop - Trang chủ">
          <BrandLogo />
        </Link>
        <Link href="/" className={styles.back}>
          <ArrowLeft size={16} aria-hidden="true" />
          Về trang chủ
        </Link>
      </header>
      <main id="main" className={styles.main}>
        {children}
      </main>
    </div>
  );
}
