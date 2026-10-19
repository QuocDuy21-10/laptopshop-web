"use client";

import { GitCompareArrows } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button/Button";
import type { Product } from "@/lib/api/types";
import { MAX_COMPARE, toggleCompare } from "../store";
import { useCompare } from "../useCompare";

type Props = { product: Pick<Product, "id" | "name" | "image"> };

export function CompareToggle({ product }: Props) {
  const selected = useCompare().some((i) => i.id === product.id);
  const onClick = () => {
    if (toggleCompare(product) === "full") {
      toast.error(`Chỉ so sánh tối đa ${MAX_COMPARE} sản phẩm`);
    }
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-pressed={selected}
      aria-label={`So sánh ${product.name}`}
      onClick={onClick}
    >
      <GitCompareArrows size={16} aria-hidden="true" />
      {selected ? "Đang so sánh" : "So sánh"}
    </Button>
  );
}
