"use client";

import { Input, Select, Space } from "antd";
import { useListParams } from "../useListParams";
export function ServiceRequestFilters() { const { get, set } = useListParams(); return <Space wrap><Select aria-label="Loại yêu cầu" value={get("type") ?? ""} options={[{ value: "", label: "Tất cả loại" }, { value: "WARRANTY", label: "Bảo hành" }, { value: "TECHNICAL_SUPPORT", label: "Hỗ trợ kỹ thuật" }]} onChange={(type) => set({ type })} /><Input.Search aria-label="Tìm yêu cầu hậu mãi" placeholder="Mã, khách hàng, sản phẩm" defaultValue={get("q")} allowClear onSearch={(q) => set({ q: q.trim() })} /></Space>; }
