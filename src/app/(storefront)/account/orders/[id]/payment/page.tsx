import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container/Container";
import { PaymentScreen } from "@/features/payments/PaymentScreen";

export const metadata: Metadata = { title: "Thanh toán đơn hàng | LaptopShop", robots: { index: false, follow: false } };

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) notFound();
  return <Container><PaymentScreen orderId={orderId} /></Container>;
}
