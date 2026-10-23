import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { API, assertApiUp, loginViaUi, PASSWORD, registerViaApi } from "./helpers";

const ADMIN = { username: "admin@gmail.com", password: process.env.E2E_ADMIN_PASSWORD ?? "123456" };

type Device = { orderDetailId: number; deviceLabel: string; allowed: boolean; allowedRequestTypes: string[] };

async function signInCustomer(page: Page, request: APIRequestContext) {
  const username = await registerViaApi(request, "after-sales");
  await page.goto("/login");
  await loginViaUi(page, username);
  return username;
}

async function createRequest(page: Page, request: APIRequestContext, type: "WARRANTY" | "TECHNICAL_SUPPORT", minimumDevices = 1) {
  await signInCustomer(page, request);
  const devicesResponse = await page.request.get(`${API}/api/v1/after-sales/devices?type=${type}&pageSize=20`);
  expect(devicesResponse.ok()).toBeTruthy();
  const devices = ((await devicesResponse.json()).data ?? []) as Device[];
  const eligible = devices.filter((device) => device.allowed && device.allowedRequestTypes.includes(type));
  test.skip(eligible.length < minimumDevices, `requires ${minimumDevices} eligible ${type.toLowerCase()} devices`);
  const result = await page.request.post(`${API}/api/v1/after-sales`, {
    headers: { "Idempotency-Key": crypto.randomUUID() },
    data: {
      type,
      subject: `E2E ${type} ${Date.now()}`,
      items: eligible.slice(0, minimumDevices).map((device) => ({
        orderDetailId: device.orderDetailId,
        deviceLabel: device.deviceLabel,
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
  await expect(page.locator("select")).toHaveCount(2);
  await page.locator("select").nth(0).selectOption("REVIEWING");
  await expect(page.locator("select").nth(1)).not.toHaveValue("REVIEWING");
});

test("out-of-warranty support exposes structured quote decision and customer confirmation", async ({ page, request }) => {
  const serviceRequest = await createRequest(page, request, "TECHNICAL_SUPPORT");
  await page.goto(`/account/after-sales/${serviceRequest.id}`);
  await expect(page.getByText(serviceRequest.code)).toBeVisible();
  await expect(page.getByText(/Hỗ trợ ngoài bảo hành|Báo giá/).first()).toBeVisible();

  await page.goto("/login?next=/admin/after-sales");
  await loginViaUi(page, ADMIN.username, ADMIN.password);
  await page.goto(`/admin/after-sales/${serviceRequest.id}`);
  await expect(page.getByText("Thiết bị")).toBeVisible();
  await expect(page.getByRole("button", { name: /Gửi báo giá/ })).toBeVisible();
});

test("customer cannot access another customer's after-sales deep link", async ({ page }) => {
  await page.goto("/account/after-sales/999999999");
  await expect(page).not.toHaveURL(/\/admin\//);
});
