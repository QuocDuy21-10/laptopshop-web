import type { Metadata } from "next";
import { Page } from "@/components/app/Page/Page";
import { WishlistView } from "@/features/wishlist/WishlistView/WishlistView";

export const metadata: Metadata = { title: "Yêu thích" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function WishlistPage({ searchParams }: Props) {
  const raw = await searchParams;
  const page = Number(raw.page ?? 1);
  return (
    <Page title="Yêu thích">
      <WishlistView page={Number.isInteger(page) && page > 0 ? page : 1} />
    </Page>
  );
}
