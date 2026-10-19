"use client";

import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import type { ReactNode } from "react";
import { adminTheme } from "./theme";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={adminTheme} locale={viVN}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
