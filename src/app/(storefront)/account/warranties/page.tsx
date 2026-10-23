"use client";

import { Container } from "@/components/layout/Container/Container";
import { useMe } from "@/features/account/useMe";
import { WarrantyList } from "@/features/after-sales/WarrantyList/WarrantyList";
import styles from "../../account.module.scss";

export default function WarrantiesPage() {
  const { data: me } = useMe();
  return <Container className={styles.page}><h1 className={styles.title}>Bảo hành & Hậu mãi</h1>{me ? <WarrantyList userId={me.id} /> : <p>Vui lòng đăng nhập để xem quyền lợi hậu mãi.</p>}</Container>;
}
