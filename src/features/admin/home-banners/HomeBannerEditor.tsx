"use client";

import { Alert, Result, Skeleton } from "antd";
import Link from "next/link";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { useAdminHomeBanner } from "./hooks";
import { HomeBannerForm } from "./HomeBannerForm";

export function HomeBannerEditor({ id }: { id: number }) {
  const { data, isPending, error } = useAdminHomeBanner(id);
  if (isPending) return <Skeleton active />;
  if (!data) {
    return isApiError(error) && error.status === 404 ? (
      <Result status="404" title="Không tìm thấy banner" extra={<Link href="/admin/home-banners">Về danh sách</Link>} />
    ) : (
      <Alert type="error" showIcon title={errorMessage(error)} />
    );
  }
  // key: reinitialise the form when the banner changes on the server (for example after removing its image)
  return <HomeBannerForm key={data.updatedAt} banner={data} />;
}
