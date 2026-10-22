"use client";

import { useState } from "react";
import { useFlashSaleAvailability } from "./hooks";
import { FlashSaleCountdown } from "./FlashSaleCountdown/FlashSaleCountdown";

export function FlashSaleAvailability({ productIds }: { productIds: number[] }) {
  const query = useFlashSaleAvailability(productIds);
  const [observedAt] = useState(() => Date.now());
  if (!query.data?.items.length) return null;
  return (
    <div aria-label="Flash Sale">
      {query.data.items.map((item) => (
        <div key={`${item.promotionId}-${item.productId}`}>
          <strong>Flash Sale</strong>
          <FlashSaleCountdown
            startsAt={item.startsAt}
            endsAt={item.endsAt}
            serverTime={query.data.serverTime}
            observedAt={observedAt}
          />
          {item.remainingQuota !== null && <span>Còn {item.remainingQuota} suất</span>}
        </div>
      ))}
    </div>
  );
}
