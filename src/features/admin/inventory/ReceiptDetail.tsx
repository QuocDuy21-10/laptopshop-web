"use client";

import { Alert, App, Button, Descriptions, Modal, Result, Spin, Table, Tag } from "antd";
import { useState } from "react";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { ReceiptForm } from "./ReceiptForm";
import { InventoryNav } from "./InventoryNav";
import { type ReceiptCreateBody, usePostReceipt, useReceipt, useUpdateReceipt } from "./hooks";

export function ReceiptDetail({ id }: { id: string }) {
  const { message } = App.useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);
  // the version the admin started editing; a newer version from the server clears it
  const [editedVersion, setEditedVersion] = useState<number | null>(null);
  const { data, error, isLoading, refetch } = useReceipt(id);
  const update = useUpdateReceipt(id);
  const post = usePostReceipt(id);

  if (isLoading) return <Spin />;
  if (error) return <Result status="error" title={errorMessage(error)} />;
  if (!data?.data) return <Result status="404" title="Không tìm thấy phiếu nhập" />;

  const receipt = data.data;
  const posted = receipt.status === "POSTED";
  const totalQuantity = receipt.items.reduce((sum, item) => sum + item.quantity, 0);
  const initialValue = {
    supplierName: receipt.supplierName ?? undefined,
    note: receipt.note ?? undefined,
    items: receipt.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost ?? undefined,
    })),
  };

  const dirty = editedVersion === receipt.version;
  const productNames = Object.fromEntries(
    receipt.items.map((item) => [item.productId, item.productName]),
  );
  const reloadOnConflict = async (error: unknown) => {
    if (
      !isApiError(error, "RECEIPT_VERSION_CONFLICT") &&
      !isApiError(error, "INVALID_RECEIPT_STATUS")
    ) {
      return false;
    }
    await refetch();
    message.error(errorMessage(error));
    return true;
  };

  const submitUpdate = async (body: ReceiptCreateBody) => {
    try {
      await update.mutateAsync({ ...body, version: receipt.version });
    } catch (error) {
      if (await reloadOnConflict(error)) return;
      throw error;
    }
    message.success("Đã cập nhật phiếu nhập");
    await refetch();
  };

  const submitPost = async () => {
    try {
      const result = await post.mutateAsync(receipt.version);
      setConfirmOpen(false);
      message.success(result.data.created ? "Đã xác nhận nhập kho" : "Phiếu đã được nhập kho");
      await refetch();
    } catch (postError) {
      setConfirmOpen(false);
      if (!(await reloadOnConflict(postError))) message.error(errorMessage(postError));
    }
  };

  return (
    <>
      <InventoryNav active="receipts" />
      <Descriptions bordered size="small" title={receipt.code} column={1}>
        <Descriptions.Item label="Trạng thái">
          <Tag color={posted ? "green" : "gold"}>{posted ? "Đã nhập kho" : "Bản nháp"}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Người tạo">{receipt.createdBy?.name ?? "—"}</Descriptions.Item>
        {posted && (
          <Descriptions.Item label="Người xác nhận">
            {receipt.postedBy?.name ?? "—"}
          </Descriptions.Item>
        )}
        {posted && (
          <Descriptions.Item label="Thời điểm nhập">
            {receipt.postedAt ? formatDate(receipt.postedAt) : "—"}
          </Descriptions.Item>
        )}
      </Descriptions>
      {!posted && receipt.items.some((item) => !item.isActive) && (
        <Alert
          type="warning"
          showIcon
          title="Sản phẩm không còn bán"
          description="Hãy cập nhật lại dòng sản phẩm trước khi xác nhận."
        />
      )}
      {posted ? (
        <Table
          rowKey="id"
          dataSource={receipt.items}
          pagination={false}
          columns={[
            { title: "Sản phẩm", dataIndex: "productName" },
            { title: "Số lượng", dataIndex: "quantity" },
            { title: "Giá nhập", dataIndex: "unitCost" },
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>Tổng</Table.Summary.Cell>
              <Table.Summary.Cell index={1}>{totalQuantity}</Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          )}
        />
      ) : (
        <>
          <ReceiptForm
            key={`${receipt.id}:${receipt.version}`}
            initialValue={initialValue}
            productNames={productNames}
            onDirtyChange={() => setEditedVersion(receipt.version)}
            onSubmit={submitUpdate}
            submitting={update.isPending}
          />
          {dirty && <Alert type="info" showIcon title="Lưu bản nháp trước khi xác nhận" />}
          <Button
            type="primary"
            disabled={dirty}
            onClick={() => setConfirmOpen(true)}
            loading={post.isPending}
          >
            Xác nhận nhập kho
          </Button>
        </>
      )}
      <Modal
        open={confirmOpen}
        title="Xác nhận nhập kho"
        okText="Xác nhận nhập kho"
        cancelText="Hủy"
        onCancel={() => setConfirmOpen(false)}
        onOk={submitPost}
        confirmLoading={post.isPending}
      >
        <p>
          {receipt.items.length} dòng, {totalQuantity} sản phẩm sẽ được cộng vào tồn kho.
        </p>
      </Modal>
    </>
  );
}
