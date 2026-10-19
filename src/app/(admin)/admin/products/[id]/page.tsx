import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/features/admin/products/ProductEditor";

export const metadata: Metadata = { title: "Sửa sản phẩm" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <ProductEditor id={id} />;
}
