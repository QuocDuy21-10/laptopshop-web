import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewDetail } from "@/features/admin/reviews/ReviewDetail";

export const metadata: Metadata = { title: "Chi tiết đánh giá" };
export default async function AdminReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <ReviewDetail id={id} />;
}
