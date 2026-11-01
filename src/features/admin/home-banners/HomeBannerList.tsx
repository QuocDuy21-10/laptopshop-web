"use client";

import { Alert, App, Button, Empty, Popconfirm, Space, Switch, Table, Tabs, Tag, type TableProps } from "antd";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { errorMessage } from "@/lib/api/errors";
import type { AdminHomeBanner } from "@/lib/api/types";
import styles from "../admin.module.scss";
import { Thumb } from "../Thumb/Thumb";
import { useListParams } from "../useListParams";
import { useAdminHomeBanners, useDeleteHomeBanner, useSetHomeBannerActive, type HomeBannerPlacement } from "./hooks";
import { placementLabel, statusColor, statusLabel } from "./labels";

const TABS = (["HERO", "SIDE"] as const).map((key) => ({ key, label: placementLabel[key] }));

export function HomeBannerList() {
  const { message } = App.useApp();
  const router = useRouter();
  const { get, set } = useListParams();
  const placement: HomeBannerPlacement = get("placement") === "SIDE" ? "SIDE" : "HERO";
  const { data, isPending, error } = useAdminHomeBanners(placement);
  const toggle = useSetHomeBannerActive();
  const del = useDeleteHomeBanner();

  const setActive = (banner: AdminHomeBanner, isActive: boolean) =>
    toggle.mutateAsync({ id: banner.id, isActive }).then(
      () => message.success(isActive ? "Đã bật hiển thị" : "Đã tắt hiển thị"),
      (e) => message.error(errorMessage(e)),
    );
  const remove = (banner: AdminHomeBanner) =>
    del.mutateAsync(banner.id).then(
      () => message.success("Đã xoá banner"),
      (e) => message.error(errorMessage(e)),
    );

  const columns: TableProps<AdminHomeBanner>["columns"] = [
    { title: "Ảnh", width: 72, render: (_, b) => <Thumb src={b.imageUrl} alt={b.imageAlt ?? b.title} /> },
    { title: "Tiêu đề", render: (_, b) => <Link href={`/admin/home-banners/${b.id}`}>{b.title}</Link> },
    { title: "Thứ tự", dataIndex: "position", align: "right" },
    { title: "Trạng thái", render: (_, b) => <Tag color={statusColor[b.status]}>{statusLabel[b.status] ?? "Không xác định"}</Tag> },
    {
      title: "Hiển thị",
      render: (_, b) => (
        <Switch
          size="small"
          checked={b.isActive}
          aria-label={`Hiển thị: ${b.title}`}
          loading={toggle.isPending && toggle.variables?.id === b.id}
          onChange={(on) => setActive(b, on)}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, b) => (
        <Space>
          <Link href={`/admin/home-banners/${b.id}`}>Sửa</Link>
          <Popconfirm
            title={`Xoá "${b.title}"?`}
            okText="Xác nhận xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            onConfirm={() => remove(b)}
          >
            <Button danger size="small">
              Xoá
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>Banner trang chủ</h1>
        <Button
          type="primary"
          icon={<Plus size={16} aria-hidden="true" />}
          onClick={() => router.push(`/admin/home-banners/new?placement=${placement}`)}
        >
          Thêm banner
        </Button>
      </div>
      <Tabs activeKey={placement} items={TABS} onChange={(key) => set({ placement: key })} />
      {error && <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />}
      <Table
        rowKey="id"
        loading={isPending}
        dataSource={data}
        columns={columns}
        pagination={false}
        locale={{ emptyText: <Empty description="Chưa có banner nào" /> }}
      />
    </>
  );
}
