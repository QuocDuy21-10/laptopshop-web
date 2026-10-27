"use client";

import { Alert, App, Button, Input, Popconfirm, Select, Space, Table, Tag, type TableProps } from "antd";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useMe } from "@/features/account/useMe";
import { errorMessage } from "@/lib/api/errors";
import type { User } from "@/lib/api/types";
import styles from "../admin.module.scss";
import { Thumb } from "../Thumb/Thumb";
import { ADMIN_PAGE_SIZE, useListParams } from "../useListParams";
import { useAdminUsers, useDeleteUser, useRoles } from "./hooks";
import { UserFormModal } from "./UserFormModal";
import { paginationItemRender } from "../pagination";

export function UserList() {
  const { message } = App.useApp();
  const { get, page, set } = useListParams();
  const { data, isFetching, error } = useAdminUsers({ page, q: get("q"), role: get("role") });
  const { data: roles } = useRoles();
  const { data: me } = useMe();
  const del = useDeleteUser();
  const [editing, setEditing] = useState<User | "new" | null>(null);

  const remove = (u: User) =>
    del.mutateAsync(u.id).then(
      () => message.success("Đã xoá người dùng"),
      (e) => message.error(errorMessage(e)),
    );

  const columns: TableProps<User>["columns"] = [
    { title: "Ảnh", dataIndex: "avatar", width: 72, render: (_, u) => <Thumb src={u.avatar} alt={u.fullName ?? u.username} /> },
    { title: "Email", dataIndex: "username", render: (_, u) => <Link href={`/admin/users/${u.id}`}>{u.username}</Link> },
    { title: "Họ tên", dataIndex: "fullName", render: (_, u) => u.fullName ?? "—" },
    { title: "Số điện thoại", dataIndex: "phone", render: (_, u) => u.phone ?? "—" },
    { title: "Vai trò", dataIndex: "role", render: (_, u) => <Tag color={u.role === "ADMIN" ? "green" : "default"}>{u.role}</Tag> },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, u) => (
        <Space>
          <Button size="small" onClick={() => setEditing(u)}>
            Sửa
          </Button>
          {/* hidden until the session loads, so the admin's own row never flashes a delete button */}
          {me && u.id !== me.id && (
            <Popconfirm
              title={`Xoá "${u.username}"?`}
              okText="Xác nhận xoá"
              cancelText="Huỷ"
              okButtonProps={{ danger: true }}
              onConfirm={() => remove(u)}
            >
              <Button danger size="small">
                Xoá
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>Người dùng</h1>
        <Button type="primary" icon={<Plus size={16} aria-hidden="true" />} onClick={() => setEditing("new")}>
          Thêm người dùng
        </Button>
      </div>
      <Space wrap className={styles.filters}>
        <Input.Search
          key={get("q")}
          placeholder="Email, họ tên hoặc SĐT"
          aria-label="Tìm người dùng"
          allowClear
          defaultValue={get("q")}
          onSearch={(q) => set({ q: q.trim() })}
        />
        <Select
          allowClear
          placeholder="Vai trò"
          aria-label="Lọc theo vai trò"
          className={styles.select}
          value={get("role")}
          options={roles?.map((r) => ({ value: r.name, label: r.description ?? r.name }))}
          onChange={(v?: string) => set({ role: v })}
        />
      </Space>
      {error && <Alert type="error" showIcon title={errorMessage(error)} className={styles.filters} />}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isFetching}
        scroll={{ x: "max-content" }}
        locale={{ emptyText: "Chưa có người dùng" }}
        pagination={{
          itemRender: paginationItemRender,
          current: page,
          pageSize: ADMIN_PAGE_SIZE,
          total: data?.meta.total,
          showSizeChanger: false,
          onChange: (p) => set({ page: p }),
        }}
      />
      {editing && <UserFormModal user={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  );
}
