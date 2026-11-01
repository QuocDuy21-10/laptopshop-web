import Image from "next/image";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button/Button";
import type { PublicHomeBanner } from "@/lib/api/types";
import { cx } from "@/lib/cx";
import { BannerLink } from "../BannerLink/BannerLink";
import { HeroSlider } from "../HeroSlider/HeroSlider";
import styles from "./HomeHero.module.scss";

function SideCard({ card }: { card: PublicHomeBanner }) {
  const body = (
    <>
      <div className={styles.cardText}>
        {card.eyebrow && <p className={styles.cardEyebrow}>{card.eyebrow}</p>}
        <p className={styles.cardTitle}>{card.title}</p>
        {card.highlight && <p className={styles.cardHighlight}>{card.highlight}</p>}
        {card.description && <p className={styles.cardDescription}>{card.description}</p>}
      </div>
      {card.imageUrl && (
        <div className={styles.cardVisual}>
          <Image src={card.imageUrl} alt={card.imageAlt ?? ""} fill sizes="160px" unoptimized className={styles.cardImage} />
        </div>
      )}
    </>
  );
  return card.linkUrl ? (
    <BannerLink href={card.linkUrl} className={cx(styles.card, styles.cardLink)}>
      {body}
    </BannerLink>
  ) : (
    <div className={styles.card}>{body}</div>
  );
}

// no banner configured yet: a neutral hero with no figures or service promises
function FallbackHero() {
  return (
    <div className={styles.fallback}>
      <h1 className={styles.fallbackTitle}>Chọn đúng laptop cho công việc và giải trí</h1>
      <p className={styles.fallbackText}>So sánh cấu hình, xem giá rõ ràng và nhận gợi ý theo nhu cầu của bạn.</p>
      <div className={styles.fallbackActions}>
        <Link href="/products" className={buttonClassName({ size: "lg" })}>
          Xem tất cả laptop
        </Link>
        <Link href="/advisor" className={buttonClassName({ variant: "secondary", size: "lg" })}>
          Tư vấn chọn laptop
        </Link>
      </div>
    </div>
  );
}

export function HomeHero({ hero, side }: { hero: PublicHomeBanner[]; side: PublicHomeBanner[] }) {
  const withSide = side.length > 0;
  return (
    <div className={cx(styles.row, withSide && styles.withSide)} data-layout={withSide ? "with-side" : "full"}>
      {hero.length > 0 ? <HeroSlider slides={hero} /> : <FallbackHero />}
      {withSide && (
        <ul role="list" aria-label="Ưu đãi nổi bật" className={styles.side}>
          {side.map((card) => (
            <li key={card.id}>
              <SideCard card={card} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
