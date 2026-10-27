import type { components, paths } from "@/lib/api/schema";

export type AfterSalesDevice = components["schemas"]["EligibleAfterSalesDevice"];
export type CreateServiceRequestInput = components["schemas"]["CreateServiceRequest"];
export type AfterSalesRequest = components["schemas"]["AfterSalesRequest"];
export type AdminAfterSalesRequest = components["schemas"]["AdminAfterSalesRequest"];
export type AfterSalesItem = components["schemas"]["AfterSalesItem"];
export type AdminAfterSalesItem = components["schemas"]["AdminAfterSalesItem"];
export type ServiceQuote = components["schemas"]["ServiceQuote"];
export type ServiceAttachment = components["schemas"]["ServiceAttachment"];
export type CustomerWarrantyVerification = components["schemas"]["CustomerWarrantyVerification"];
export type AdminWarrantyVerification = components["schemas"]["AdminWarrantyVerification"];
export type AdminAfterSalesQuery = NonNullable<paths["/api/v1/admin/after-sales"]["get"]["parameters"]["query"]>;
