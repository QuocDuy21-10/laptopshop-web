import type { Metadata } from "next";
import { Page } from "@/components/app/Page/Page";
import { PublicPromotions } from "@/features/promotions/PublicPromotions";
import { getPublicPromotions } from "@/features/promotions/server";

export const metadata: Metadata = { title: "Khuyến mãi" };

export default async function PromotionsPage() {
  const promotions = await getPublicPromotions();
  return (
    <Page title="Khuyến mãi" description="Mã giảm giá và chương trình đang áp dụng cho đơn hàng.">
      <PublicPromotions promotions={promotions} />
    </Page>
  );
}
