"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { useMe } from "@/features/account/useMe";
import { useReviewEligibility } from "../hooks";
import { ReviewDialog } from "../ReviewDialog/ReviewDialog";

export function ReviewAction({ productId, productName }: { productId: number; productName: string }) {
  const [opened, setOpened] = useState(false);
  const me = useMe();
  const eligibility = useReviewEligibility(productId, me.data?.id, opened);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpened(true)}>Đánh giá sản phẩm</Button>
      {opened && eligibility.data && <ReviewDialog productId={productId} productName={productName} eligibility={eligibility.data} open={opened} onOpenChange={setOpened} />}
    </>
  );
}
