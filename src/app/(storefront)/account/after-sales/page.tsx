"use client";

import { useSearchParams } from "next/navigation";
import { Page } from "@/components/app/Page/Page";
import { useMe } from "@/features/account/useMe";
import { ServiceRequestList } from "@/features/after-sales/ServiceRequestList/ServiceRequestList";

export default function AfterSalesPage() {
  const params = useSearchParams();
  const { data: me } = useMe();
  const page = Math.max(1, Number(params.get("page")) || 1);
  return (
    <Page title="Yêu cầu hậu mãi" description="Theo dõi các yêu cầu bảo hành và hỗ trợ kỹ thuật bạn đã gửi.">
      {me ? <ServiceRequestList userId={me.id} page={page} /> : <p>Vui lòng đăng nhập để xem yêu cầu.</p>}
    </Page>
  );
}
