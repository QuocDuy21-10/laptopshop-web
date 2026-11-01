import type { Metadata } from "next";

import { cx } from "@/lib/cx";
import styles from "./page.module.scss";
import { getHomeData } from "@/features/home/server";
import { HomeHero } from "@/features/home/HomeHero/HomeHero";
import { TargetGrid } from "@/features/home/TargetGrid/TargetGrid";
import { Container } from "@/components/layout/Container/Container";
import { BrandMarquee } from "@/features/home/BrandMarquee/BrandMarquee";
import { AdvisorBanner } from "@/features/home/AdvisorBanner/AdvisorBanner";
import { BestsellerTabs } from "@/features/home/BestsellerTabs/BestsellerTabs";
import { FlashSaleSection } from "@/features/home/FlashSaleSection/FlashSaleSection";
import { ReviewHighlights } from "@/features/home/ReviewHighlights/ReviewHighlights";
import { StoreCommitments } from "@/features/home/StoreCommitments/StoreCommitments";
import { NewsletterSection } from "@/features/home/NewsletterSection/NewsletterSection";

export const metadata: Metadata = {
  title: "LaptopShop — Chọn đúng laptop cho công việc và giải trí",
  description:
    "Cửa hàng laptop chính hãng. So sánh cấu hình trực quan, tư vấn chọn máy theo nhu cầu và ngân sách thực tế.",
};

export default async function HomePage() {
  const data = await getHomeData();
  const tabs = (data.options?.targetOptions ?? []).map(({ value, name }) => ({ value, name }));
  const reviews = data.reviews && data.reviews.items.length > 0 ? data.reviews : null;

  return (
    <Container className={styles.page}>
      <HomeHero hero={data.banners.hero} side={data.banners.side} />
      <BrandMarquee />
      {tabs.length > 0 && <TargetGrid targets={tabs} images={data.targetImages} />}
      <FlashSaleSection
        products={data.flashSale}
        renderedAt={data.renderedAt}
        options={data.options}
      />
      <BestsellerTabs
        tabs={tabs}
        initialProducts={data.bestsellers}
        options={data.options}
        renderedAt={data.renderedAt}
      />
      <AdvisorBanner />
      <StoreCommitments info={data.storeInfo} />
      <div className={cx(styles.bottomRow, reviews && styles.withReviews)}>
        {reviews && <ReviewHighlights data={reviews} />}
        <NewsletterSection />
      </div>
    </Container>
  );
}
