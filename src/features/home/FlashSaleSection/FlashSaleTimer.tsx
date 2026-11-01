"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlashSaleCountdown } from "@/features/promotions/FlashSaleCountdown/FlashSaleCountdown";

// the sale is already running when the page renders, so it "started" at render time
export function FlashSaleTimer({ endsAt, renderedAt }: { endsAt: string; renderedAt: string }) {
  const router = useRouter();
  const [observedAt] = useState(() => Date.now());
  return (
    <FlashSaleCountdown
      startsAt={renderedAt}
      endsAt={endsAt}
      serverTime={renderedAt}
      observedAt={observedAt}
      onBoundary={() => router.refresh()}
    />
  );
}
