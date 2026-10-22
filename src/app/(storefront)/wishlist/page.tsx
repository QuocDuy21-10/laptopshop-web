import type { Metadata } from "next";
import { Container } from "@/components/layout/Container/Container";
import { WishlistView } from "@/features/wishlist/WishlistView/WishlistView";
import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Wishlist" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function WishlistPage({ searchParams }: Props) {
  const raw = await searchParams;
  const page = Number(raw.page ?? 1);
  return <Container className={styles.page}><h1>Wishlist</h1><WishlistView page={Number.isInteger(page) && page > 0 ? page : 1} /></Container>;
}
