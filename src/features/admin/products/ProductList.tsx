"use client";

import { Alert, App, Button, Checkbox, Input, Popconfirm, Segmented, Select, Space, Switch, Table, Tag, type TableProps } from "antd";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { errorMessage } from "@/lib/api/errors";
import type { Product } from "@/lib/api/types";
import { formatVnd } from "@/lib/format";
import styles from "../admin.module.scss";
import { ExportCsvButton } from "../ExportCsvButton";
import { StockAdjustModal } from "../inventory/StockAdjustModal";
import { Thumb } from "../Thumb/Thumb";
import { ADMIN_PAGE_SIZE, useListParams } from "../useListParams";
import { type AdminProductQuery, useAdminProducts, useDeleteProduct, useProductFilterOptions, useSetProductActive } from "./hooks";
import { labelOf, toOptions } from "./options";

const SORT_OPTIONS = [
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
];

const VISIBILITY_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "true", label: "Đang bán" },
  { value: "false", label: "Đã ẩn" },
];

export function ProductList() {
  const { message } = App.useApp();
  const router = useRouter();
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const { get, page, set } = useListParams();
  const sort = get("sort");
  const active = get("isActive");
  const query: AdminProductQuery = {
    page,
    pageSize: ADMIN_PAGE_SIZE,
    q: get("q"),
    factory: get("factory"),
    target: get("target"),
    sort: sort === "price_asc" || sort === "price_desc" ? sort : undefined,
    isActive: active === "true" || active === "false" ? active : undefined,
    stock: get("stock") === "low" ? "low" : undefined,
  };
  const { data, isFetching, error } = useAdminProducts(query);
  const { data: options } = useProductFilterOptions();
  const del = useDeleteProduct();
  const toggle = useSetProductActive();
  const setActive = (p: Product, isActive: boolean) =>
    toggle.mutateAsync({ id: p.id, isActive }).then(
      () => message.success(isActive ? "Đã mở bán lại" : "Đã ẩn sản phẩm"),
      (e) => message.error(errorMessage(e)),
    );

  const remove = (p: Product) =>
    del.mutateAsync(p.id).then(
      () => message.success("Đã xoá sản phẩm"),
      (e) => message.error(errorMessage(e)),
    );

  const columns: TableProps<Product>["columns"] = [
    { title: "Ảnh", dataIndex: "image", width: 72, render: (_, p) => <Thumb src={p.image} alt={p.name} /> },
    { title: "Tên sản phẩm", dataIndex: "name", render: (_, p) => <Link href={`/admin/products/${p.id}`}>{p.name}</Link> },
    { title: "Giá", dataIndex: "price", align: "right", render: (_, p) => formatVnd(p.price) },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      align: "right",
      render: (_, p) => (p.quantity === 0 ? <Tag color="error">Hết hàng</Tag> : p.quantity),
    },
    { title: "Đã bán", dataIndex: "sold", align: "right", render: (_, p) => p.sold ?? 0 },
    { title: "Hãng", dataIndex: "factory", render: (_, p) => labelOf(options?.factoryOptions, p.factory) },
    { title: "Nhu cầu", dataIndex: "target", render: (_, p) => labelOf(options?.targetOptions, p.target) },
    {
      title: "Đang bán",
      dataIndex: "isActive",
      render: (_, p) => (
        <Switch
          size="small"
          checked={p.isActive}
          aria-label={`Đang bán: ${p.name}`}
          loading={toggle.isPending && toggle.variables?.id === p.id}
          onChange={(on) => setActive(p, on)}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, p) => (
        <Space>
          <Link href={`/admin/products/${p.id}`}>Sửa</Link>
          <Button size="small" onClick={() => setAdjusting(p)}>
            Kho
          </Button>
          <Popconfirm
            title={`Xoá "${p.name}"?`}
            okText="Xác nhận xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true }}
            onConfirm={() => remove(p)}
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
        <h1 className={styles.title}>Sản phẩm</h1>
        <Space>
          <ExportCsvButton
            path="/api/v1/admin/products/export.csv"
            query={{ q: query.q, factory: query.factory, target: query.target, isActive: query.isActive === undefined ? undefined : String(query.isActive), stock: query.stock }}
          />
          <Button type="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={() => router.push("/admin/products/new")}>
            Thêm sản phẩm
          </Button>
        </Space>
      </div>
      <Space wrap className={styles.filters}>
        <Segmented options={VISIBILITY_OPTIONS} value={active === "true" || active === "false" ? active : ""} onChange={(v) => set({ isActive: String(v) })} />
        <Checkbox checked={query.stock === "low"} onChange={(e) => set({ stock: e.target.checked ? "low" : undefined })}>
          Sắp hết hàng
        </Checkbox>
        <Input.Search
          key={get("q")}
          placeholder="Tìm theo tên"
          aria-label="Tìm sản phẩm"
          allowClear
          defaultValue={get("q")}
          onSearch={(q) => set({ q: q.trim() })}
        />
        <Select
          allowClear
          placeholder="Hãng"
          aria-label="Lọc theo hãng"
          className={styles.select}
          value={query.factory}
          options={toOptions(options?.factoryOptions)}
          onChange={(v?: string) => set({ factory: v })}
        />
        <Select
          allowClear
          placeholder="Nhu cầu"
          aria-label="Lọc theo nhu cầu"
          className={styles.select}
          value={query.target}
          options={toOptions(options?.targetOptions)}
          onChange={(v?: string) => set({ target: v })}
        />
        <Select
          allowClear
          placeholder="Sắp xếp"
          aria-label="Sắp xếp"
          className={styles.select}
          value={query.sort}
          options={SORT_OPTIONS}
          onChange={(v?: string) => set({ sort: v })}
        />
      </Space>
      {error && <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isFetching}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Không có sản phẩm phù hợp" }}
        pagination={{
          current: page,
          pageSize: ADMIN_PAGE_SIZE,
          total: data?.meta.total,
          showSizeChanger: false,
          onChange: (p) => set({ page: p }),
        }}
      />
      {adjusting && <StockAdjustModal product={adjusting} onClose={() => setAdjusting(null)} />}
    </>
  );
}
