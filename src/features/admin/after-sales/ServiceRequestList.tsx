"use client";

import { Alert } from "antd";
import { errorMessage } from "@/lib/api/errors";
import { useAdminAfterSalesList, useAdminAfterSalesSummary } from "./hooks";
import { useListParams } from "../useListParams";
import { ServiceRequestFilters } from "./ServiceRequestFilters";
import { ServiceRequestTable } from "./ServiceRequestTable";
import { AfterSalesSummary } from "./AfterSalesSummary";
import styles from "../admin.module.scss";

export function ServiceRequestList() { const { page, get } = useListParams(); const query = useAdminAfterSalesList({ page, pageSize: 20, type: get("type") || undefined, q: get("q") || undefined }); const summary = useAdminAfterSalesSummary(); if (query.isError) return <Alert type="error" message={errorMessage(query.error)} />; const rows = (query.data?.data ?? []) as Array<{ id: number; code: string; subject: string; type: string; status: string; createdAt: string }>; return <><div className={styles.head}><h1 className={styles.title}>Bảo hành & Hậu mãi</h1></div><AfterSalesSummary data={summary.data?.data as never} /><div className={styles.filters}><ServiceRequestFilters /></div><ServiceRequestTable rows={rows} loading={query.isPending} /></>; }
