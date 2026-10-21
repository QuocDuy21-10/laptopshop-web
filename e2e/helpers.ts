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

export async function loginViaUi(page: Page, username: string, password = PASSWORD) {
  await page.getByLabel("Email").fill(username);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

export async function createCompletedReviewOrder(request: APIRequestContext): Promise<{ api: string; username: string; orderId: number; productId: number; productName: string }> {
  const username = await registerViaApi(request, "review-buyer");
  const login = await request.post(`${API}/api/v1/auth/login`, { data: { username, password: PASSWORD } });
  expect(login.ok()).toBeTruthy();
  const products = (await (await request.get(`${API}/api/v1/products`)).json()).data as Array<{ id: number; name: string; quantity: number }>;
  const product = products.find((item) => item.quantity > 0);
  expect(product, "need one in-stock product").toBeTruthy();
  expect((await request.post(`${API}/api/v1/cart/items`, { data: { productId: product!.id, quantity: 1 } })).ok()).toBeTruthy();
  const order = await request.post(`${API}/api/v1/orders`, { headers: { "Idempotency-Key": crypto.randomUUID() }, data: { receiverName: "E2E Buyer", receiverPhone: "0900000000", receiverAddress: "1 Lê Lợi, Quận 1" } });
  expect(order.ok()).toBeTruthy();
  return { api: API, username, orderId: (await order.json()).data.id, productId: product!.id, productName: product!.name };
}
