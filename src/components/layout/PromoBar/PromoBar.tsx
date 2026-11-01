import { PromoBarClient } from "./PromoBarClient";
import { getPromoBarPromotion } from "@/features/promotions/server";

export async function PromoBar() {
  const promotion = await getPromoBarPromotion();
  return promotion ? <PromoBarClient key={promotion.id} promotion={promotion} /> : null;
}
