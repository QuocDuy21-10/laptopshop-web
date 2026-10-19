"use client";

import { Alert, Result, Skeleton } from "antd";
import Link from "next/link";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { useAdminProduct } from "./hooks";
import { ProductForm } from "./ProductForm";

export function ProductEditor({ id }: { id: number }) {
  const { data, isPending, error } = useAdminProduct(id);
  if (isPending) return <Skeleton active />;
  if (!data) {
    return isApiError(error) && error.status === 404 ? (
      <Result status="404" title="Không tìm thấy sản phẩm" extra={<Link href="/admin/products">Về danh sách</Link>} />
    ) : (
      <Alert type="error" showIcon title={errorMessage(error)} />
    );
  }
  return <ProductForm product={data} />;
}
