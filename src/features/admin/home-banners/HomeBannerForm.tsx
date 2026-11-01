"use client";

import { App, Button, DatePicker, Form, Input, InputNumber, Popconfirm, Segmented, Select, Space, Switch, Tag, Upload } from "antd";
import dayjs from "dayjs";
import { ImageUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { errorMessage } from "@/lib/api/errors";
import type { AdminHomeBanner } from "@/lib/api/types";
import styles from "../admin.module.scss";
import { setServerErrors } from "../form-errors";
import { Thumb } from "../Thumb/Thumb";
import { isSafeBannerLink, toCreateBody, toPatchBody, type BannerFormValues } from "./form";
import {
  useCreateHomeBanner,
  useRemoveHomeBannerImage,
  useUpdateHomeBanner,
  useUploadHomeBannerImage,
  type HomeBannerPlacement,
} from "./hooks";
import { placementLabel } from "./labels";

const PLACEMENT_OPTIONS = (["HERO", "SIDE"] as const).map((value) => ({ value, label: placementLabel[value] }));
const LINK_ERROR = "Chỉ nhận đường dẫn bắt đầu bằng / hoặc https://";
const PAIR_ERROR = "Nhập đủ chữ nút và đường dẫn, hoặc để trống cả hai";

const linkRules = [
  {
    validator: (_: unknown, value?: string) =>
      !value?.trim() || isSafeBannerLink(value.trim()) ? Promise.resolve() : Promise.reject(new Error(LINK_ERROR)),
  },
];

// the button text and its link are either both set or both empty (same rule as the API)
const pairRule =
  (linkField: "linkUrl" | "secondaryLinkUrl") =>
  ({ getFieldValue }: { getFieldValue: (name: string) => unknown }) => ({
    validator: (_: unknown, value?: string) =>
      Boolean(value?.trim()) === Boolean((getFieldValue(linkField) as string | undefined)?.trim())
        ? Promise.resolve()
        : Promise.reject(new Error(PAIR_ERROR)),
  });

const badgeRule = {
  validator: (_: unknown, value?: string[]) =>
    (value ?? []).every((badge) => badge.trim().length <= 40)
      ? Promise.resolve()
      : Promise.reject(new Error("Mỗi nhãn tối đa 40 ký tự")),
};

export function HomeBannerForm({
  banner,
  initialPlacement = "HERO",
}: {
  banner?: AdminHomeBanner;
  initialPlacement?: HomeBannerPlacement;
}) {
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm<BannerFormValues>();
  const placement: HomeBannerPlacement = Form.useWatch("placement", form) ?? banner?.placement ?? initialPlacement;
  const pickedImage = Form.useWatch("image", form);
  const create = useCreateHomeBanner();
  const update = useUpdateHomeBanner(banner?.id ?? 0);
  const upload = useUploadHomeBannerImage();
  const removeImage = useRemoveHomeBannerImage();
  const pending = create.isPending || update.isPending || upload.isPending;
  // antd calls onFinish after async validation, so a double click reaches it twice before isPending re-renders
  const submitting = useRef(false);

  const onFinish = async (submitted: BannerFormValues) => {
    if (submitting.current) return;
    submitting.current = true;
    // editing has no placement field, so the stored placement decides which fields are sent
    const values = { ...submitted, placement };
    const file = values.image?.[0]?.originFileObj;
    const alt = values.imageAlt?.trim();
    try {
      let id: number;
      if (banner) {
        // a new file carries its own alt with the upload; otherwise an edited alt rides along with the PATCH
        const altChanged = !file && banner.imageUrl && alt && alt !== banner.imageAlt ? alt : undefined;
        id = (await update.mutateAsync(toPatchBody(values, altChanged))).id;
      } else {
        id = (await create.mutateAsync(toCreateBody(values))).id;
      }
      if (file) {
        try {
          await upload.mutateAsync({ id, file: file as File, imageAlt: alt ?? "" });
        } catch (e) {
          message.warning(`Đã lưu banner nhưng chưa tải được ảnh: ${errorMessage(e)}`);
          router.replace(`/admin/home-banners/${id}`);
          return;
        }
      }
      message.success(banner ? "Đã lưu banner" : "Đã tạo banner");
      router.push(`/admin/home-banners?placement=${values.placement}`);
    } catch (e) {
      setServerErrors(form, e);
      message.error(errorMessage(e));
    } finally {
      submitting.current = false;
    }
  };

  const needsAlt = Boolean(pickedImage?.length) || Boolean(banner?.imageUrl);

  return (
    <>
      <div className={styles.head}>
        <h1 className={styles.title}>{banner ? `Sửa: ${banner.title}` : "Thêm banner"}</h1>
      </div>
      <Form
        form={form}
        layout="vertical"
        className={styles.form}
        disabled={pending}
        onFinish={onFinish}
        initialValues={{
          placement: banner?.placement ?? initialPlacement,
          eyebrow: banner?.eyebrow ?? undefined,
          title: banner?.title ?? "",
          highlight: banner?.highlight ?? undefined,
          description: banner?.description ?? undefined,
          ctaText: banner?.ctaText ?? undefined,
          linkUrl: banner?.linkUrl ?? undefined,
          secondaryCtaText: banner?.secondaryCtaText ?? undefined,
          secondaryLinkUrl: banner?.secondaryLinkUrl ?? undefined,
          badges: banner?.badges ?? [],
          position: banner?.position ?? 0,
          isActive: banner?.isActive ?? false,
          schedule: [banner?.startsAt ? dayjs(banner.startsAt) : null, banner?.endsAt ? dayjs(banner.endsAt) : null],
          imageAlt: banner?.imageAlt ?? undefined,
        }}
      >
        {banner ? (
          <Form.Item label="Vị trí">
            <Tag>{placementLabel[banner.placement]}</Tag>
          </Form.Item>
        ) : (
          <Form.Item name="placement" label="Vị trí">
            <Segmented options={PLACEMENT_OPTIONS} />
          </Form.Item>
        )}
        <Form.Item name="eyebrow" label="Dòng giới thiệu nhỏ" rules={[{ max: 60, message: "Tối đa 60 ký tự" }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, whitespace: true, message: "Nhập tiêu đề" },
            { max: 80, message: "Tối đa 80 ký tự" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="highlight" label="Cụm nhấn trong tiêu đề" rules={[{ max: 80, message: "Tối đa 80 ký tự" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Mô tả ngắn" rules={[{ max: 200, message: "Tối đa 200 ký tự" }]}>
          <Input.TextArea rows={2} />
        </Form.Item>

        {placement === "HERO" ? (
          <>
            <Form.Item
              name="ctaText"
              label="Chữ nút chính"
              dependencies={["linkUrl"]}
              rules={[{ max: 30, message: "Tối đa 30 ký tự" }, pairRule("linkUrl")]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="linkUrl"
              label="Đường dẫn nút chính"
              dependencies={["ctaText"]}
              rules={[...linkRules, { max: 255, message: "Tối đa 255 ký tự" }]}
            >
              <Input placeholder="/products?target=GAMING" />
            </Form.Item>
            <Form.Item
              name="secondaryCtaText"
              label="Chữ nút phụ"
              dependencies={["secondaryLinkUrl"]}
              rules={[{ max: 30, message: "Tối đa 30 ký tự" }, pairRule("secondaryLinkUrl")]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="secondaryLinkUrl"
              label="Đường dẫn nút phụ"
              dependencies={["secondaryCtaText"]}
              rules={[...linkRules, { max: 255, message: "Tối đa 255 ký tự" }]}
            >
              <Input placeholder="/compare" />
            </Form.Item>
            <Form.Item name="badges" label="Nhãn nổi trên ảnh" rules={[badgeRule]} extra="Tối đa 2 nhãn, gõ rồi Enter.">
              <Select mode="tags" maxCount={2} open={false} tokenSeparators={[","]} />
            </Form.Item>
          </>
        ) : (
          <Form.Item
            name="linkUrl"
            label="Đường dẫn của thẻ"
            rules={[...linkRules, { max: 255, message: "Tối đa 255 ký tự" }]}
            extra="Để trống nếu thẻ không dẫn đi đâu."
          >
            <Input placeholder="/products?target=SINHVIEN_VANPHONG" />
          </Form.Item>
        )}

        <Form.Item name="position" label="Thứ tự (nhỏ hiển thị trước)">
          <InputNumber min={0} max={9999} precision={0} />
        </Form.Item>
        <Form.Item name="schedule" label="Lịch hiển thị" extra="Để trống nếu không hẹn giờ.">
          <DatePicker.RangePicker showTime allowEmpty={[true, true]} format="DD/MM/YYYY HH:mm" />
        </Form.Item>
        <Form.Item name="isActive" label="Hiển thị trên trang chủ" valuePropName="checked">
          <Switch />
        </Form.Item>

        {banner?.imageUrl && (
          <Form.Item label="Ảnh hiện tại">
            <Space>
              <Thumb src={banner.imageUrl} alt={banner.imageAlt ?? banner.title} />
              <Popconfirm
                title="Xoá ảnh của banner này?"
                okText="Xác nhận xoá"
                cancelText="Huỷ"
                okButtonProps={{ danger: true }}
                onConfirm={() =>
                  removeImage.mutateAsync(banner.id).then(
                    () => message.success("Đã xoá ảnh"),
                    (e) => message.error(errorMessage(e)),
                  )
                }
              >
                <Button danger size="small">
                  Xoá ảnh
                </Button>
              </Popconfirm>
            </Space>
          </Form.Item>
        )}
        <Form.Item
          name="image"
          label={banner?.imageUrl ? "Thay ảnh" : "Ảnh"}
          valuePropName="fileList"
          getValueFromEvent={(event: { fileList?: unknown[] }) => event?.fileList}
          extra="JPEG hoặc PNG, tối đa 3MB. Ảnh chỉ là hình, chữ do trang chủ tự hiển thị."
        >
          <Upload beforeUpload={() => false} maxCount={1} accept="image/jpeg,image/png" listType="picture">
            <Button icon={<ImageUp size={16} aria-hidden="true" />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="imageAlt"
          label="Mô tả ảnh"
          dependencies={["image"]}
          rules={[
            { max: 120, message: "Tối đa 120 ký tự" },
            { required: needsAlt, whitespace: true, message: "Nhập mô tả ảnh" },
          ]}
        >
          <Input />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={pending}>
            {banner ? "Lưu banner" : "Tạo banner"}
          </Button>
          <Button onClick={() => router.push(`/admin/home-banners?placement=${placement}`)}>Huỷ</Button>
        </Space>
      </Form>
    </>
  );
}
