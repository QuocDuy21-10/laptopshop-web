import type { Metadata } from "next";
import { HomeBannerForm } from "@/features/admin/home-banners/HomeBannerForm";

export const metadata: Metadata = { title: "Thêm banner" };

type Props = { searchParams: Promise<{ placement?: string }> };

export default async function NewHomeBannerPage({ searchParams }: Props) {
  const { placement } = await searchParams;
  return <HomeBannerForm initialPlacement={placement === "SIDE" ? "SIDE" : "HERO"} />;
}
