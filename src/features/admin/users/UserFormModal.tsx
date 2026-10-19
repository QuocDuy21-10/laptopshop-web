"use client";

import { App, Button, Form, Input, Modal, Select, Spin, Upload, type UploadFile } from "antd";
import { ImageUp } from "lucide-react";
import { useMe } from "@/features/account/useMe";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { toFormData } from "@/lib/api/multipart";
import type { User } from "@/lib/api/types";
import { setServerErrors } from "../form-errors";
import { useRoles, useSaveUser } from "./hooks";
import { roleIdOf } from "./roles";

export type UserFormValues = {
  username?: string;
  password?: string;
  fullName: string;
  phone?: string;
  address?: string;
  roleId: number;
  avatar?: UploadFile[];
};

export const toUserFormData = ({ avatar, ...fields }: UserFormValues) =>
  toFormData(fields, { avatar: avatar?.[0]?.originFileObj });

export function UserFormModal({ user, onClose }: { user?: User; onClose: () => void }) {
  const { message } = App.useApp();
  const [form] = Form.useForm<UserFormValues>();
  const { data: roles } = useRoles();
  const save = useSaveUser(user?.id);
  const { data: me } = useMe();
  // the API refuses this too; locking the field explains it before the admin tries
  const isSelf = !!user && user.id === me?.id;

  const onFinish = (values: UserFormValues) =>
    save.mutate(toUserFormData(values), {
      onSuccess: () => {
        message.success(user ? "Đã lưu người dùng" : "Đã tạo người dùng");
        onClose();
      },
      onError: (e) => {
        if (isApiError(e, "EMAIL_TAKEN")) form.setFields([{ name: "username", errors: [errorMessage(e)] }]);
        else setServerErrors(form, e);
        message.error(errorMessage(e));
      },
    });

  return (
    <Modal
      open
      title={user ? "Sửa người dùng" : "Thêm người dùng"}
      okText={user ? "Lưu" : "Tạo"}
      cancelText="Huỷ"
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={save.isPending}
    >
      {/* the form mounts after roles load so the edit form's initial roleId resolves */}
      {!roles ? (
        <Spin />
      ) : (
        <Form
          form={form}
          layout="vertical"
          disabled={save.isPending}
          onFinish={onFinish}
          initialValues={
            user && {
              fullName: user.fullName ?? "",
              phone: user.phone ?? "",
              address: user.address ?? "",
              roleId: roleIdOf(roles, user.role),
            }
          }
        >
          {!user && (
            <>
              <Form.Item
                name="username"
                label="Email"
                rules={[{ required: true, message: "Nhập email" }, { type: "email", message: "Email không hợp lệ" }]}
              >
                <Input autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Nhập mật khẩu" }, { min: 8, max: 72, message: "Mật khẩu từ 8 đến 72 ký tự" }]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, whitespace: true, message: "Nhập họ tên" }, { max: 255, message: "Tối đa 255 ký tự" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ max: 20, message: "Tối đa 20 ký tự" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ max: 255, message: "Tối đa 255 ký tự" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="roleId"
            label="Vai trò"
            rules={[{ required: true, message: "Chọn vai trò" }]}
            extra={isSelf ? "Bạn không thể đổi vai trò của chính mình." : undefined}
          >
            <Select disabled={isSelf} options={roles.map((r) => ({ value: r.id, label: r.description ?? r.name }))} />
          </Form.Item>
          <Form.Item
            name="avatar"
            label="Ảnh đại diện"
            valuePropName="fileList"
            getValueFromEvent={(e: { fileList: UploadFile[] }) => e.fileList}
            extra="JPEG hoặc PNG."
          >
            <Upload beforeUpload={() => false} maxCount={1} accept="image/jpeg,image/png" listType="picture">
              <Button icon={<ImageUp size={16} aria-hidden="true" />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
