import Link from "next/link";
import { getFilterOptions } from "@/features/products/server";
import type { FilterOption } from "@/lib/api/types";
import { AccountMenu } from "../AccountMenu/AccountMenu";
import { CartLink } from "../CartLink/CartLink";
import { Container } from "../Container/Container";
import { MobileMenu } from "../MobileMenu/MobileMenu";
import { SearchForm } from "../SearchForm/SearchForm";
import styles from "./Header.module.scss";

export async function Header() {
  // the shell must render even when the API is unreachable
  const targets: FilterOption[] = await getFilterOptions()
    .then((o) => o.targetOptions)
    .catch(() => []);

  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <MobileMenu targets={targets} />
        <Link href="/" className={styles.brand}>
          LaptopShop
        </Link>
        <nav aria-label="Nhu cầu" className={styles.nav}>
          <Link href="/advisor">Tư vấn chọn laptop</Link>
          {targets.slice(0, 4).map((t) => (
            <Link key={t.value} href={`/products?target=${t.value}`}>
              {t.name}
            </Link>
          ))}
        </nav>
        <SearchForm className={styles.search} />
        <div className={styles.actions}>
          <CartLink />
          <AccountMenu />
        </div>
      </Container>
    </header>
  );
}
