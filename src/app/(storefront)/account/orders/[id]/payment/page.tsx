import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Page } from "@/components/app/Page/Page";
import { PaymentScreen } from "@/features/payments/PaymentScreen";

export const metadata: Metadata = { title: "Thanh toán đơn hàng | LaptopShop", robots: { index: false, follow: false } };

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) notFound();
  // PaymentScreen renders its own h1 for each payment state
  return (
    <Page>
      <PaymentScreen orderId={orderId} />
    </Page>
  );
}
