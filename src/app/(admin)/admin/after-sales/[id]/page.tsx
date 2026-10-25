import { ServiceRequestDetail } from "@/features/admin/after-sales/ServiceRequestDetail";
export default async function AdminAfterSalesDetailPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ServiceRequestDetail id={Number(id)} />; }
