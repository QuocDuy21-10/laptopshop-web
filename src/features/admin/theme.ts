import type { ThemeConfig } from "antd";

// antd derives palettes from real colours and cannot read CSS variables: keep in sync with src/styles/_tokens.scss
export const adminTheme: ThemeConfig = {
  token: {
    colorPrimary: "#166534",
    colorSuccess: "#166534",
    colorWarning: "#92400e",
    colorError: "#b91c1c",
    colorInfo: "#1d4ed8",
    colorBgLayout: "#f8faf9",
    colorText: "#10251b",
    colorBorder: "#d9e4dc",
    borderRadius: 8,
    fontFamily: "var(--font-sans)",
  },
};
