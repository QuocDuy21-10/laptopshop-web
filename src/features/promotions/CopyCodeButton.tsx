"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button/Button";

export function CopyCodeButton({ code }: { code: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Đã sao chép mã");
    } catch {
      toast.error("Không thể sao chép tự động");
    }
  };
  return (
    <Button variant="secondary" size="sm" aria-label={`Sao chép mã ${code}`} onClick={() => void copy()}>
      <Copy size={16} aria-hidden="true" />
      Sao chép mã
    </Button>
  );
}
