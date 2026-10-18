import { Laptop } from "lucide-react";
import Image from "next/image";
import styles from "./ProductImage.module.scss";

type Props = { src: string | null; alt: string; sizes: string; priority?: boolean };

// shortcut: unoptimized (no resize/WebP) for API-served images; switch to remotePatterns or a CDN when traffic grows
export function ProductImage({ src, alt, sizes, priority }: Props) {
  return (
    <div className={styles.frame}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized className={styles.image} />
      ) : (
        <Laptop size={48} aria-hidden="true" className={styles.placeholder} />
      )}
    </div>
  );
}
