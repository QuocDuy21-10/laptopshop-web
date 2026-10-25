"use client";

import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/Container/Container";
import { useMe } from "@/features/account/useMe";
import { ServiceRequestList } from "@/features/after-sales/ServiceRequestList/ServiceRequestList";
import styles from "../../account.module.scss";

export default function AfterSalesPage() {
  const params = useSearchParams();
  const { data: me } = useMe();
  const page = Math.max(1, Number(params.get("page")) || 1);
  return <Container className={styles.page}><h1 className={styles.title}>Bảo hành & Hậu mãi</h1>{me ? <ServiceRequestList userId={me.id} page={page} /> : <p>Vui lòng đăng nhập để xem yêu cầu.</p>}</Container>;
}
