import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeBannerEditor } from "@/features/admin/home-banners/HomeBannerEditor";

export const metadata: Metadata = { title: "Sửa banner" };

type Props = { params: Promise<{ id: string }> };

export default async function EditHomeBannerPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <HomeBannerEditor id={id} />;
}
