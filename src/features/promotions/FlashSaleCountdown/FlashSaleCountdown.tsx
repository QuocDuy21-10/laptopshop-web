"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FlashSaleCountdown.module.scss";

const pad = (value: number) => String(Math.max(0, value)).padStart(2, "0");
const secondsBetween = (from: number, to: number) => Math.max(0, Math.ceil((to - from) / 1000));

export function FlashSaleCountdown({
  startsAt,
  endsAt,
  serverTime,
  observedAt,
  onBoundary,
}: {
  startsAt: string;
  endsAt: string;
  serverTime: string;
  observedAt: number;
  onBoundary?: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  const boundaryNotified = useRef(false);
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  const serverNow = Date.parse(serverTime) + (now - observedAt);
  const running = serverNow >= start && serverNow < end;
  const expired = serverNow >= end;
  const target = running ? end : start;
  const remaining = secondsBetween(serverNow, target);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (expired && !boundaryNotified.current) {
      boundaryNotified.current = true;
      onBoundary?.();
    }
  }, [expired, onBoundary]);

  if (expired) return <span className={styles.countdown}>Đã kết thúc</span>;
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  return (
    <span className={styles.countdown} aria-label={running ? "Thời gian Flash Sale còn lại" : "Flash Sale bắt đầu sau"}>
      {running ? "Còn" : "Bắt đầu sau"} {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}
