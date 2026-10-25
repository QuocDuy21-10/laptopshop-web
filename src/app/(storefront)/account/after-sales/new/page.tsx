"use client";

import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container/Container";
import { useMe } from "@/features/account/useMe";
import { ServiceRequestForm } from "@/features/after-sales/ServiceRequestForm/ServiceRequestForm";
import styles from "../../../account.module.scss";

export default function NewAfterSalesPage() {
  const params = useSearchParams();
  const { data: me } = useMe();
  const type = params.get("type") === "WARRANTY" ? "WARRANTY" : "TECHNICAL_SUPPORT";
  const orderDetailId = Number(params.get("orderDetailId"));
  return <Container className={styles.page}>{me ? <ServiceRequestForm userId={me.id} type={type} preselectedOrderDetailId={orderDetailId > 0 ? orderDetailId : undefined} /> : <p>Vui lòng đăng nhập để gửi yêu cầu.</p>}</Container>;
}
