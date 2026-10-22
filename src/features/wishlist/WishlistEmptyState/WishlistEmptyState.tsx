import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";

export function WishlistEmptyState() {
  return <EmptyState title="Wishlist đang trống" description="Lưu laptop bạn quan tâm để xem lại và theo dõi giá." action={<Link href="/products">Khám phá laptop</Link>} />;
}
