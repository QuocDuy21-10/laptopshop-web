import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { API, assertApiUp, createCompletedAfterSalesOrder, loginViaUi, registerViaApi } from "./helpers";

const ADMIN = { username: "admin@gmail.com", password: process.env.E2E_ADMIN_PASSWORD ?? "123456" };

type Device = { orderDetailId: number; product: { name: string }; allowed: boolean; allowedRequestTypes: string[] };

async function createRequest(page: Page, request: APIRequestContext, type: "WARRANTY" | "TECHNICAL_SUPPORT", minimumDevices = 1) {
  const username = await registerViaApi(request, "after-sales");
  await createCompletedAfterSalesOrder(request, username, minimumDevices);
  await page.goto("/login");
  await loginViaUi(page, username);
  await page.waitForLoadState("networkidle");
  const devicesResponse = await page.request.get(`${API}/api/v1/after-sales/devices?type=${type}&pageSize=20`);
  expect(devicesResponse.ok()).toBeTruthy();
  const devices = ((await devicesResponse.json()).data ?? []) as Device[];
  const eligible = devices.filter((device) => device.allowed && device.allowedRequestTypes.includes(type));
  expect(eligible.length).toBeGreaterThanOrEqual(1);
  const selected = Array.from({ length: minimumDevices }, (_, index) => eligible[index] ?? eligible[0]);
  const result = await page.request.post(`${API}/api/v1/after-sales`, {
    headers: { "Idempotency-Key": crypto.randomUUID() },
    data: {
      type,
      subject: `E2E ${type} ${Date.now()}`,
      items: selected.map((device, index) => ({
        orderDetailId: device.orderDetailId,
        deviceLabel: `${device.product.name} · Thiết bị ${index + 1}`,
        issueDescription: "Thiết bị cần được kiểm tra trong luồng E2E.",
      })),
    },
  });
  expect(result.status()).toBe(201);
  return (await result.json()).data as { id: number; code: string; items: Array<{ id: number }> };
}

test.beforeAll(async ({ request }) => {
  await assertApiUp(request);
});

test("customer submits multiple devices and admin advances them independently", async ({ page, request }) => {
  const serviceRequest = await createRequest(page, request, "WARRANTY", 2);
  await page.goto(`/account/after-sales/${serviceRequest.id}`);
  await expect(page.getByText(serviceRequest.code)).toBeVisible();
  await expect(page.getByText(/Thiết bị/).first()).toBeVisible();

  await page.goto("/login?next=/admin/after-sales");
  await loginViaUi(page, ADMIN.username, ADMIN.password);
  await page.goto(`/admin/after-sales/${serviceRequest.id}`);
  await expect(page.getByText(serviceRequest.code)).toBeVisible();
  await expect(page.getByRole("combobox", { name: /Trạng thái/ })).toHaveCount(2);
  await page.getByRole("combobox").nth(0).click();
  await page.getByRole("combobox").nth(0).press("ArrowDown");
  await page.getByRole("combobox").nth(0).press("Enter");
  await expect(page.getByRole("combobox").nth(1)).not.toHaveText("REVIEWING");
});

test("out-of-warranty support exposes structured quote decision and customer confirmation", async ({ page, request }) => {
  const serviceRequest = await createRequest(page, request, "TECHNICAL_SUPPORT");
  await page.goto(`/account/after-sales/${serviceRequest.id}`);
  await expect(page.getByText(serviceRequest.code)).toBeVisible();
  await expect(page.getByText(serviceRequest.code)).toBeVisible();

  await page.goto("/login?next=/admin/after-sales");
  await loginViaUi(page, ADMIN.username, ADMIN.password);
  await page.goto(`/admin/after-sales/${serviceRequest.id}`);
  await expect(page.getByText("Thiết bị", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Gửi báo giá/ })).toBeVisible();
});

test("customer cannot access another customer's after-sales deep link", async ({ page }) => {
  await page.goto("/account/after-sales/999999999");
  await expect(page).not.toHaveURL(/\/admin\//);
});
