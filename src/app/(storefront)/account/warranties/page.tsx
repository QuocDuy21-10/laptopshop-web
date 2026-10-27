"use client";

import { Page } from "@/components/app/Page/Page";
import { useMe } from "@/features/account/useMe";
import { WarrantyList } from "@/features/after-sales/WarrantyList/WarrantyList";

export default function WarrantiesPage() {
  const { data: me } = useMe();
  return (
    <Page title="Quyền lợi bảo hành" description="Thiết bị đã mua và các yêu cầu bạn có thể gửi cho từng thiết bị.">
      {me ? <WarrantyList userId={me.id} /> : <p>Vui lòng đăng nhập để xem quyền lợi hậu mãi.</p>}
    </Page>
  );
}
