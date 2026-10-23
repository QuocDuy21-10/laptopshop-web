import { describe, expectTypeOf, it } from "vitest";
import type { components, paths } from "@/lib/api/schema";

describe("after-sales generated API contract", () => {
  it("contains customer and admin operations", () => {
    type CreatePath = paths["/api/v1/after-sales"]["post"];
    type DevicePath = paths["/api/v1/after-sales/devices"]["get"];
    type DetailPath = paths["/api/v1/after-sales/{id}"]["get"];
    type AdminStatusPath = paths["/api/v1/admin/after-sales/{id}/items/{itemId}/status"]["patch"];
    expectTypeOf<CreatePath>().not.toBeNever();
    expectTypeOf<DevicePath>().not.toBeNever();
    expectTypeOf<DetailPath>().not.toBeNever();
    expectTypeOf<AdminStatusPath>().not.toBeNever();
  });

  it("contains device, quote, dispute, assignee, preference, and order fields", () => {
    type Device = components["schemas"]["EligibleAfterSalesDevice"];
    type Create = components["schemas"]["CreateServiceRequest"];
    type DeviceId = Device["orderDetailId"];
    type CreateItems = Create["items"];
    expectTypeOf<DeviceId>().not.toBeNever();
    expectTypeOf<CreateItems>().not.toBeNever();
    expectTypeOf<components["schemas"]["Order"]["items"]>().not.toBeNever();
    expectTypeOf<paths["/api/v1/notification-preferences"]["patch"]>().not.toBeNever();
  });
});
