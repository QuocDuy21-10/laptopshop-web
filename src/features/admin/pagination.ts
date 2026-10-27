import type { PaginationProps } from "antd";
import { cloneElement, isValidElement } from "react";

const LABELS: Record<string, string> = {
  prev: "Trang trước",
  next: "Trang sau",
  "jump-prev": "Lùi 5 trang",
  "jump-next": "Tiến 5 trang",
};

// antd's prev/next buttons hold only an icon, so screen readers announce them as "left"/"right"
export const paginationItemRender: PaginationProps["itemRender"] = (_page, type, element) =>
  LABELS[type] && isValidElement<{ "aria-label"?: string }>(element)
    ? cloneElement(element, { "aria-label": LABELS[type] })
    : element;
