import { expect, test } from "@playwright/test";
import { assertApiUp, loginViaUi, registerViaApi } from "./helpers";

test.beforeAll(async ({ request }) => {
  await assertApiUp(request);
});

test("keeps a guest wishlist intent through login and isolates accounts", async ({ page, request }) => {
  const usernameA = await registerViaApi(request, "wishlist-a");
  await page.goto("/products");
  const first = page.getByRole("article").filter({ hasText: "Còn hàng" }).first();
  const productLink = await first.getByRole("link").first().getAttribute("href");
  const productName = await first.getByRole("link").first().innerText();
  await first.getByRole("button", { name: new RegExp(`Thêm ${productName} vào Wishlist`) }).click();
  await expect(page).toHaveURL(/\/login\?next=/);
  await loginViaUi(page, usernameA);
  await page.goto("/wishlist");
  await expect(page.getByText(productName)).toBeVisible();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole("button", { name: /E2E Tester/ }).click();
  await page.getByRole("menuitem", { name: "Đăng xuất" }).click();
  const usernameB = await registerViaApi(request, "wishlist-b");
  await page.goto("/login?next=/wishlist");
  await loginViaUi(page, usernameB);
  await expect(page).toHaveURL(/\/wishlist$/);
  await expect(page.getByText("Wishlist đang trống")).toBeVisible();
  await page.goto(productLink!);
  await expect(page.getByRole("button", { name: new RegExp(`Thêm ${productName} vào Wishlist`) })).toHaveAttribute("aria-pressed", "false");
});

test("creates one automatic price alert notification", async ({ page, request, browser }) => {
  test.skip(process.env.E2E_PRICE_ALERTS !== "true" || !process.env.E2E_ADMIN_PASSWORD, "E2E_PRICE_ALERTS=true, admin credentials and a running price-alert worker are required");
  const username = await registerViaApi(request, "wishlist-price-alert");
  await page.goto("/login?next=/products");
  await loginViaUi(page, username);
  await page.goto("/products");
  const product = page.getByRole("article").filter({ hasText: "Còn hàng" }).first();
  const productId = Number((await product.getByRole("link").first().getAttribute("href"))?.split("/").pop());
  await product.getByRole("button", { name: /Thêm .*Wishlist/ }).click();
  await page.goto("/wishlist");
  await page.getByRole("button", { name: "Theo dõi giá" }).click();
  await page.getByRole("button", { name: "Lưu cảnh báo" }).click();

  const adminContext = await browser.newContext();
  const admin = adminContext.request;
  await admin.post("http://localhost:8080/api/v1/auth/login", { data: { username: "admin@gmail.com", password: process.env.E2E_ADMIN_PASSWORD } });
  const endsAt = new Date(Date.now() + 10 * 60_000).toISOString();
  const startsAt = new Date(Date.now() - 60_000).toISOString();
  const promotion = await admin.post("http://localhost:8080/api/v1/admin/promotions", { data: { kind: "AUTOMATIC", name: `E2E Wishlist ${Date.now()}`, discountKind: "PERCENT", discountValue: 10, startsAt, endsAt, automatic: { priority: 10, stackableWithCoupon: false, targetProductIds: [productId] } } });
  expect(promotion.ok()).toBeTruthy();
  const promotionId = (await promotion.json()).data.id;
  const activated = await admin.patch(`http://localhost:8080/api/v1/admin/promotions/${promotionId}/state`, { data: { action: "ACTIVATE" } });
  expect(activated.ok()).toBeTruthy();
  await page.goto("/account/notifications");
  await expect(page.getByText(/vừa giảm giá|đạt giá mục tiêu/)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/vừa giảm giá|đạt giá mục tiêu/)).toHaveCount(1);
  await page.reload();
  await expect(page.getByText(/vừa giảm giá|đạt giá mục tiêu/)).toHaveCount(1);
  await adminContext.close();
});
