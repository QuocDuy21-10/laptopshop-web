import { PromotionDetail } from "@/features/admin/promotions/PromotionDetail";
export default async function PromotionPage({ params }: { params: Promise<{ id: string }> }) { return <PromotionDetail id={Number((await params).id)} />; }
