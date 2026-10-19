"use client";

import { App, Button } from "antd";
import { Download } from "lucide-react";
import { useState } from "react";
import { downloadCsv } from "@/lib/api/download";
import { errorMessage } from "@/lib/api/errors";

export function ExportCsvButton({ path, query }: { path: string; query: Record<string, string | number | undefined> }) {
  const { message } = App.useApp();
  const [busy, setBusy] = useState(false);
  const onClick = () => {
    setBusy(true);
    downloadCsv(path, query)
      .catch((e) => message.error(errorMessage(e)))
      .finally(() => setBusy(false));
  };
  return (
    <Button icon={<Download size={16} aria-hidden="true" />} loading={busy} onClick={onClick}>
      Xuất CSV
    </Button>
  );
}
