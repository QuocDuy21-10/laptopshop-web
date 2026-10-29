import Image from "next/image";
import styles from "./BrandLogo.module.scss";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`${styles.logo} ${compact ? styles.compact : ""}`} aria-hidden="true">
      <Image
        src="/brand/logo-horizontal.svg"
        alt=""
        width={640}
        height={150}
        className={styles.horizontal}
      />
      <Image src="/brand/icon.svg" alt="" width={100} height={100} className={styles.mark} />
    </span>
  );
}
