import type { Metadata } from "next";
import { Page } from "@/components/app/Page/Page";
import { OrderList } from "@/features/orders/OrderList/OrderList";

export const metadata: Metadata = { title: "Đơn hàng của tôi" };

type Props = { searchParams: Promise<{ page?: string | string[] }> };

export default async function OrdersPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const n = Math.trunc(Number(page));
  return (
    <Page title="Đơn hàng của tôi">
      <OrderList page={n > 0 ? n : 1} />
    </Page>
  );
}
