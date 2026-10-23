"use client";

import { Card, Statistic } from "antd";
export function AfterSalesSummary({ data }: { data?: { total?: number; submitted?: number; reviewing?: number; inProgress?: number; awaitingCustomer?: number; closed?: number } }) { return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}><Card><Statistic title="Tổng phiếu" value={data?.total ?? 0} /></Card><Card><Statistic title="Chờ tiếp nhận" value={data?.submitted ?? 0} /></Card><Card><Statistic title="Đang xử lý" value={data?.inProgress ?? 0} /></Card><Card><Statistic title="Hoàn tất" value={data?.closed ?? 0} /></Card></div>; }
