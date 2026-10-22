import type { Metadata } from "next";
import { Container } from "@/components/layout/Container/Container";
import { PublicPromotions } from "@/features/promotions/PublicPromotions";
import { getPublicPromotions } from "@/features/promotions/server";

export const metadata: Metadata = { title: "Khuyến mãi" };

export default async function PromotionsPage() {
  const promotions = await getPublicPromotions();
  return <Container><h1>Khuyến mãi</h1><PublicPromotions promotions={promotions} /></Container>;
}
