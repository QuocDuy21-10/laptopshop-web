"use client";

import { useParams } from "next/navigation";
import { Container } from "@/components/layout/Container/Container";
import { useMe } from "@/features/account/useMe";
import { ServiceRequestDetail } from "@/features/after-sales/ServiceRequestDetail/ServiceRequestDetail";
import styles from "../../../account.module.scss";

export default function AfterSalesDetailPage() {
  const { data: me } = useMe();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  return <Container className={styles.page}>{me && id > 0 ? <ServiceRequestDetail userId={me.id} id={id} /> : <p>Vui lòng đăng nhập để xem yêu cầu.</p>}</Container>;
}
