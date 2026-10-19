"use client";

import { App, Button, Divider, Form, Input, InputNumber, Select, Space, Upload, type UploadFile } from "antd";
import { ImageUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SPEC_ROWS } from "@/features/compare/specs";
import { errorMessage } from "@/lib/api/errors";
import { toFormData } from "@/lib/api/multipart";
import type { Product } from "@/lib/api/types";
import styles from "../admin.module.scss";
import { StockAdjustModal } from "../inventory/StockAdjustModal";
import { setServerErrors } from "../form-errors";
import { Thumb } from "../Thumb/Thumb";
import { useProductFilterOptions, useSaveProduct } from "./hooks";
import { toOptions } from "./options";

export type ProductFormValues = {
  name: string;
  price: number;
  quantity?: number;
  factory: string;
  target: string;
  shortDesc: string;
  detailDesc: string;
  image?: UploadFile[];
  cpu?: string | null;
  gpu?: string | null;
  ramGb?: number | null;
  storageGb?: number | null;
  screenSizeInch?: number | null;
  screenResolution?: string | null;
  refreshRateHz?: number | null;
  batteryWh?: number | null;
  weightGrams?: number | null;
  warrantyMonths?: number | null;
};

const SPEC_KEYS = SPEC_ROWS.map((r) => r.key);

// toFormData drops null, which would leave a stored spec untouched; "" makes the API clear it
export const toProductFormData = ({ image, ...fields }: ProductFormValues) => {
  const specs = Object.fromEntries(
    SPEC_KEYS.map((key) => {
      const value = fields[key];
      return [key, typeof value === "string" ? value.trim() : (value ?? "")];
    }),
  );
  return toFormData({ ...fields, ...specs }, { image: image?.[0]?.originFileObj });
};

export function ProductForm({ product }: { product?: Product }) {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm<ProductFormValues>();
  const { data: options } = useProductFilterOptions();
  const save = useSaveProduct(product?.id);
  const [adjusting, setAdjusting] = useState(false);

  const onFinish = (values: ProductFormValues) =>
    save.mutate(toProductFormData(values), {
      onSuccess: () => {
        message.success(product ? "Đã lưu sản phẩm" : "Đã thêm sản phẩm");
        router.push("/admin/products");
      },
      onError: (e) => {
        setServerErrors(form, e);
        message.error(errorMessage(e));
      },
    });

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>{product ? `Sửa: ${product.name}` : "Thêm sản phẩm"}</h1>
      </div>
      <Form
        form={form}
        layout="vertical"
        className={styles.form}
        disabled={save.isPending}
        onFinish={onFinish}
        initialValues={
          product && {
            name: product.name,
            price: product.price,
            factory: product.factory ?? undefined,
            target: product.target ?? undefined,
            shortDesc: product.shortDesc ?? "",
            detailDesc: product.detailDesc ?? "",
            cpu: product.cpu ?? undefined,
            gpu: product.gpu ?? undefined,
            ramGb: product.ramGb ?? undefined,
            storageGb: product.storageGb ?? undefined,
            screenSizeInch: product.screenSizeInch ?? undefined,
            screenResolution: product.screenResolution ?? undefined,
            refreshRateHz: product.refreshRateHz ?? undefined,
            batteryWh: product.batteryWh ?? undefined,
            weightGrams: product.weightGrams ?? undefined,
            warrantyMonths: product.warrantyMonths ?? undefined,
          }
        }
      >
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, whitespace: true, message: "Nhập tên sản phẩm" }, { max: 255, message: "Tối đa 255 ký tự" }]}
        >
          <Input />
        </Form.Item>
        <div className={styles.row}>
          <Form.Item
            name="price"
            label="Giá (₫)"
            rules={[{ required: true, message: "Nhập giá" }, { type: "integer", min: 1, message: "Giá phải là số nguyên lớn hơn 0" }]}
          >
            <InputNumber min={1} precision={0} className={styles.full} />
          </Form.Item>
          {product ? (
            <Form.Item label="Số lượng" extra="Thay đổi tồn kho qua điều chỉnh để có nhật ký.">
              <Space wrap>
                <strong>{product.quantity}</strong>
                <Button onClick={() => setAdjusting(true)}>Điều chỉnh kho</Button>
                <Link href={`/admin/inventory?productId=${product.id}`}>Xem nhật ký kho</Link>
              </Space>
            </Form.Item>
          ) : (
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: "Nhập số lượng" }, { type: "integer", min: 0, message: "Số lượng phải là số nguyên từ 0" }]}
            >
              <InputNumber min={0} precision={0} className={styles.full} />
            </Form.Item>
          )}
          <Form.Item name="factory" label="Hãng" rules={[{ required: true, message: "Chọn hãng" }]}>
            <Select options={toOptions(options?.factoryOptions)} />
          </Form.Item>
          <Form.Item name="target" label="Nhu cầu" rules={[{ required: true, message: "Chọn nhu cầu" }]}>
            <Select options={toOptions(options?.targetOptions)} />
          </Form.Item>
        </div>
        <Form.Item
          name="shortDesc"
          label="Mô tả ngắn"
          rules={[{ required: true, whitespace: true, message: "Nhập mô tả ngắn" }, { max: 255, message: "Tối đa 255 ký tự" }]}
        >
          <Input.TextArea rows={2} showCount maxLength={255} />
        </Form.Item>
        <Form.Item
          name="detailDesc"
          label="Mô tả chi tiết"
          rules={[{ required: true, whitespace: true, message: "Nhập mô tả chi tiết" }]}
        >
          <Input.TextArea rows={6} />
        </Form.Item>
        <Divider>Thông số kỹ thuật</Divider>
        <div className={styles.row}>
          <Form.Item name="cpu" label="CPU" rules={[{ max: 255, message: "Tối đa 255 ký tự" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gpu" label="Card đồ hoạ" rules={[{ max: 255, message: "Tối đa 255 ký tự" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ramGb" label="RAM (GB)">
            <InputNumber min={1} max={256} precision={0} className={styles.full} />
          </Form.Item>
          <Form.Item name="storageGb" label="Ổ cứng (GB)">
            <InputNumber min={1} max={16384} precision={0} className={styles.full} />
          </Form.Item>
          <Form.Item name="screenSizeInch" label="Màn hình (inch)">
            <InputNumber min={10} max={20} precision={1} step={0.1} className={styles.full} />
          </Form.Item>
          <Form.Item
            name="screenResolution"
            label="Độ phân giải"
            rules={[{ max: 50, message: "Tối đa 50 ký tự" }]}
          >
            <Input placeholder="1920x1080" />
          </Form.Item>
          <Form.Item name="refreshRateHz" label="Tần số quét (Hz)">
            <InputNumber min={30} max={500} precision={0} className={styles.full} />
          </Form.Item>
          <Form.Item name="batteryWh" label="Pin (Wh)">
            <InputNumber min={1} max={200} precision={0} className={styles.full} />
          </Form.Item>
          <Form.Item name="weightGrams" label="Trọng lượng (gram)">
            <InputNumber min={300} max={10000} precision={0} className={styles.full} />
          </Form.Item>
          <Form.Item name="warrantyMonths" label="Bảo hành (tháng)">
            <InputNumber min={0} max={120} precision={0} className={styles.full} />
          </Form.Item>
        </div>
        {product?.image && (
          <Form.Item label="Ảnh hiện tại">
            <Thumb src={product.image} alt={product.name} />
          </Form.Item>
        )}
        <Form.Item
          name="image"
          label="Ảnh sản phẩm"
          valuePropName="fileList"
          getValueFromEvent={(e: { fileList: UploadFile[] }) => e.fileList}
          extra={product?.image ? "JPEG hoặc PNG. Để trống để giữ ảnh hiện tại." : "JPEG hoặc PNG."}
        >
          <Upload beforeUpload={() => false} maxCount={1} accept="image/jpeg,image/png" listType="picture">
            <Button icon={<ImageUp size={16} aria-hidden="true" />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={save.isPending}>
            {product ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </Button>
          <Button onClick={() => router.push("/admin/products")}>Huỷ</Button>
        </Space>
      </Form>
      {adjusting && product && <StockAdjustModal product={product} onClose={() => setAdjusting(false)} />}
    </>
  );
}
