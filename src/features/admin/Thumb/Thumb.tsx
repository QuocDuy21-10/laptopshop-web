import { Laptop } from "lucide-react";
import Image from "next/image";
import styles from "./Thumb.module.scss";

// shortcut: unoptimized like ProductImage; API-served images are not resized
export function Thumb({ src, alt }: { src: string | null; alt: string }) {
  return src ? (
    <Image src={src} alt={alt} width={48} height={48} unoptimized className={styles.thumb} />
  ) : (
    <span className={styles.placeholder} aria-hidden="true">
      <Laptop size={20} />
    </span>
  );
}
