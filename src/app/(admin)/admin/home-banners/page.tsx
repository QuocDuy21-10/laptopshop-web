import type { Metadata } from "next";
import { HomeBannerList } from "@/features/admin/home-banners/HomeBannerList";

export const metadata: Metadata = { title: "Banner trang chủ" };

export default function AdminHomeBannersPage() {
  return <HomeBannerList />;
}
