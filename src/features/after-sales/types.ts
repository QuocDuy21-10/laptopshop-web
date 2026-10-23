import type { components, paths } from "@/lib/api/schema";

export type AfterSalesDevice = components["schemas"]["EligibleAfterSalesDevice"];
export type CreateServiceRequestInput = components["schemas"]["CreateServiceRequest"];
export type AfterSalesRequest = unknown;
export type AdminAfterSalesQuery = NonNullable<paths["/api/v1/admin/after-sales"]["get"]["parameters"]["query"]>;
