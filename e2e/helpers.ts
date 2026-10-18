import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const API = "http://localhost:8080";
export const PASSWORD = "password123";

export const uniqueEmail = (tag: string) => `e2e-${tag}-${Date.now()}@test.local`;

export async function assertApiUp(request: APIRequestContext) {
  const res = await request.get(`${API}/healthz`).catch(() => null);
  expect(res?.ok(), "laptopshop-api must run on :8080 (see README › E2E)").toBeTruthy();
}

export async function registerViaApi(request: APIRequestContext, tag: string) {
  const username = uniqueEmail(tag);
  const res = await request.post(`${API}/api/v1/auth/register`, {
    data: { fullName: "E2E Tester", username, password: PASSWORD, confirmPassword: PASSWORD },
  });
  expect(res.status()).toBe(201);
  return username;
}

export async function loginViaUi(page: Page, username: string) {
  await page.getByLabel("Email").fill(username);
  await page.getByLabel("Mật khẩu").fill(PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}
