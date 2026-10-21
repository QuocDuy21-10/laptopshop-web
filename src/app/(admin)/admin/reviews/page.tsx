import type { Metadata } from "next";
import { ReviewList } from "@/features/admin/reviews/ReviewList";

export const metadata: Metadata = { title: "Đánh giá" };
export default function AdminReviewsPage() { return <ReviewList />; }
