import type { Metadata } from "next";
import { ProductList } from "@/features/admin/products/ProductList";

export const metadata: Metadata = { title: "Sản phẩm" };

export default function AdminProductsPage() {
  return <ProductList />;
}
