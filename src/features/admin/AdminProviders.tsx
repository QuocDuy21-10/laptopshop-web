"use client";

import { App, ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./admin.module.scss";
import { adminTheme } from "./theme";

// Input.Search renders an icon-only button; the hidden text gives it an accessible name
const searchIcon = (
  <>
    <Search size={16} aria-hidden="true" />
    <span className={styles.srOnly}>Tìm kiếm</span>
  </>
);

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={adminTheme} locale={viVN} inputSearch={{ searchIcon }}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
