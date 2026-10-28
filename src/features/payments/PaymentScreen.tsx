"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price/Price";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";
import { usePaymentStatus } from "./hooks";
import styles from "./PaymentScreen.module.scss";

const formatRemaining = (seconds: number) => {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
};

export function PaymentScreen({ orderId }: { orderId: number }) {
  const paymentQuery = usePaymentStatus(orderId);
  const [now, setNow] = useState(() => Date.now());
  const [serverOffset, setServerOffset] = useState(0);
  const [qrFailed, setQrFailed] = useState(false);
  const notified = useRef<string | null>(null);
  const payment = paymentQuery.data;
  const serverTime = payment?.serverTime;

  useEffect(() => {
    if (!serverTime) return;
    const timestamp = new Date(serverTime).getTime();
    if (!Number.isFinite(timestamp)) return;
    const sync = window.setTimeout(() => setServerOffset(timestamp - Date.now()), 0);
    return () => window.clearTimeout(sync);
  }, [serverTime]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (payment?.status === "SUCCEEDED" && notified.current !== payment.id) {
      notified.current = payment.id;
      toast.success("Thanh toán đã được xác nhận!");
    }
  }, [payment]);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Đã sao chép");
    } catch {
      toast.error("Không thể sao chép tự động");
    }
  };

  if (paymentQuery.isPending) return <Skeleton className={styles.skeleton} />;
  if (paymentQuery.isError && !payment) {
    return (
      <section className={styles.state}>
        <Alert tone="error" title={errorMessage(paymentQuery.error)} />
        <Button onClick={() => void paymentQuery.refetch()}>Thử lại</Button>
      </section>
    );
  }
  if (!payment) return null;

  if (payment.status === "SUCCEEDED") {
    return (
      <section className={styles.state} aria-live="polite">
        <h1>Thanh toán thành công</h1>
        <p>Đơn hàng #{orderId} đã được hệ thống xác nhận.</p>
        <Price value={payment.amount} size="lg" />
        <Link href={`/account/orders/${orderId}`}>Xem chi tiết đơn hàng</Link>
      </section>
    );
  }
  if (payment.status === "EXPIRED" || payment.status === "CANCELLED") {
    return (
      <section className={styles.state} aria-live="polite">
        <h1>Phiên thanh toán đã kết thúc</h1>
        <Alert tone="warning" title="Mã QR này không còn được dùng để thanh toán." />
        <p>Nếu bạn đã chuyển khoản, vui lòng liên hệ LaptopShop để được đối soát.</p>
        <Link href={`/account/orders/${orderId}`}>Xem đơn hàng</Link>
      </section>
    );
  }

  const expiresAt = new Date(payment.expiresAt).getTime();
  const cancelAfter = new Date(payment.cancelAfter).getTime();
  const seconds = Math.floor((expiresAt - (now + serverOffset)) / 1000);
  const inGrace = seconds <= 0 && now + serverOffset < cancelAfter;
  const isVerifying = payment.status === "VERIFYING" || payment.status === "REVIEW_REQUIRED";
  const instructions = payment.instructions;

  return (
    <main className={styles.screen}>
      <header>
        <h1>{isVerifying ? "Đang xác minh thanh toán" : "Thanh toán chuyển khoản"}</h1>
        <p>
          Đơn hàng #{orderId} · {isVerifying ? "Đang đối soát giao dịch" : "Đang chờ xác nhận"}
        </p>
      </header>
      {instructions && seconds > 0 && (
        <section className={styles.card} aria-label="Thông tin thanh toán">
          {qrFailed ? (
            <Alert
              tone="warning"
              title="Không tải được mã QR. Vui lòng chuyển khoản theo thông tin bên dưới."
            />
          ) : (
            <>
              <p>Quét mã QR bằng ứng dụng ngân hàng.</p>
              <Image
                className={styles.qr}
                src={instructions.qrImageUrl}
                alt={`Mã QR thanh toán đơn hàng ${orderId}`}
                width={280}
                height={280}
                unoptimized
                onError={() => setQrFailed(true)}
              />
            </>
          )}
          <div className={styles.amount}>
            <span>Số tiền cần chuyển</span>
            <Price value={payment.amount} size="lg" />
          </div>
          <dl className={styles.details}>
            <dt>Ngân hàng</dt>
            <dd>{instructions.bankCode}</dd>
            <dt>Chủ tài khoản</dt>
            <dd>{instructions.accountName}</dd>
            <dt>Số tài khoản</dt>
            <dd>
              <span>{instructions.accountNumber}</span>
              <Button variant="ghost" onClick={() => void copy(instructions.accountNumber)}>
                Sao chép
              </Button>
            </dd>
            <dt>Nội dung chuyển khoản</dt>
            <dd>
              <span>{instructions.transferCode}</span>
              <Button variant="ghost" onClick={() => void copy(instructions.transferCode)}>
                Sao chép
              </Button>
            </dd>
          </dl>
          <p className={styles.deadline}>
            {isVerifying
              ? "Đang xác minh thanh toán"
              : inGrace
                ? "Đang kiểm tra giao dịch cuối cùng"
                : `Thời gian còn lại: ${formatRemaining(seconds)}`}
          </p>
        </section>
      )}
      <section className={styles.waiting} aria-live="polite">
        {(inGrace || isVerifying) && (
          <Alert
            tone="warning"
            title={
              isVerifying
                ? "Thời hạn sử dụng mã QR đã kết thúc. Hệ thống đang kiểm tra giao dịch với ngân hàng."
                : "Đã hết thời hạn quét QR; hệ thống đang kiểm tra giao dịch đã gửi."
            }
          />
        )}
        <p>
          {paymentQuery.isError
            ? "Tạm thời chưa cập nhật được trạng thái."
            : "Đang chờ hệ thống xác nhận thanh toán…"}
        </p>
        {paymentQuery.isError && (
          <Alert tone="warning" title="Bạn vẫn có thể giữ nguyên trang này; hệ thống sẽ thử lại." />
        )}
      </section>
      <p className={styles.help}>
        Giữ nguyên số tiền và nội dung chuyển khoản. Nếu đã chuyển khoản, không thanh toán thêm lần
        nữa.
      </p>
      <Link href={`/account/orders/${orderId}`}>Xem đơn hàng</Link>
    </main>
  );
}
