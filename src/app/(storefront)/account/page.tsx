import type { Metadata } from "next";
import { Container } from "@/components/layout/Container/Container";
import { AccountProfile } from "@/features/account/AccountProfile";
import styles from "../account.module.scss";

export const metadata: Metadata = { title: "Hồ sơ" };

export default function AccountPage() {
  return (
    <Container className={styles.page}>
      <h1 className={styles.title}>Hồ sơ của tôi</h1>
      <AccountProfile />
    </Container>
  );
}
