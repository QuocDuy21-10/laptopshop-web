import { expect, test, type APIRequestContext } from "@playwright/test";
import { API, assertApiUp, loginViaUi, PASSWORD, registerViaApi } from "./helpers";

// seeded by laptopshop-api (src/config/seed.ts); the password is ADMIN_PASSWORD, "123456" in development
const ADMIN = { username: "admin@gmail.com", password: process.env.E2E_ADMIN_PASSWORD ?? "123456" };

async function placeOrderViaApi(request: APIRequestContext) {
  const username = await registerViaApi(request, "admin-buyer");
  expect((await request.post(`${API}/api/v1/auth/login`, { data: { username, password: PASSWORD } })).ok()).toBeTruthy();
  const { data: products } = await (await request.get(`${API}/api/v1/products`)).json();
  const product = products.find((p: { quantity: number }) => p.quantity > 0);
  expect(product, "need one in-stock product").toBeTruthy();
  expect((await request.post(`${API}/api/v1/cart/items`, { data: { productId: product.id, quantity: 1 } })).ok()).toBeTruthy();
  const res = await request.post(`${API}/api/v1/orders`, {
    headers: { "Idempotency-Key": crypto.randomUUID() },
    data: { receiverName: "E2E Buyer", receiverPhone: "0900000000", receiverAddress: "1 Lê Lợi, Quận 1" },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).data.id as number;
}

test.beforeAll(async ({ request }) => {
  await assertApiUp(request);
});

test("non-admins get 403 on /admin", async ({ page, request }) => {
  const username = await registerViaApi(request, "not-admin");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
  await loginViaUi(page, username);
  await expect(page.getByText("Bạn không có quyền truy cập trang quản trị.")).toBeVisible();
});

test("admin creates a product and ships an order", async ({ page, request }) => {
  const orderId = await placeOrderViaApi(request);

  await page.goto("/login?next=/admin");
  await loginViaUi(page, ADMIN.username, ADMIN.password);
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();

  const name = `E2E Laptop ${Date.now()}`;
  await page.goto("/admin/products/new");
  await page.getByLabel("Tên sản phẩm").fill(name);
  await page.getByLabel("Giá (₫)").fill("15000000");
  await page.getByLabel("Số lượng").fill("5");
  await page.getByLabel("Hãng").click();
  await page.keyboard.press("Enter");
  await page.getByLabel("Nhu cầu").click();
  await page.keyboard.press("Enter");
  await page.getByLabel("Mô tả ngắn").fill("Máy kiểm thử");
  await page.getByLabel("Mô tả chi tiết").fill("Sản phẩm tạo bởi kiểm thử E2E.");
  await page.getByRole("button", { name: "Thêm sản phẩm" }).click();
  await expect(page.getByText("Đã thêm sản phẩm")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await page.getByPlaceholder("Tìm theo tên").fill(name);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("link", { name })).toBeVisible();

  await page.goto(`/admin/orders/${orderId}`);
  await page.getByRole("button", { name: "Giao hàng" }).click();
  await expect(page.getByText('Đã chuyển sang "Đang giao"')).toBeVisible();
  await expect(page.getByRole("button", { name: "Hoàn thành" })).toBeVisible();
});

test("admin hides a product and the storefront stops selling it", async ({ page }) => {
  await page.goto("/login?next=/admin");
  await loginViaUi(page, ADMIN.username, ADMIN.password);
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();

  // page.request shares the browser's cookies, so this call is made as the signed-in admin
  const name = `E2E Hidden ${Date.now()}`;
  const created = await page.request.post(`${API}/api/v1/admin/products`, {
    multipart: { name, price: "15000000", quantity: "3", shortDesc: "s", detailDesc: "d", factory: "ASUS", target: "GAMING" },
  });
  expect(created.status()).toBe(201);
  const { data: product } = await created.json();

  await page.goto(`/admin/products?q=${encodeURIComponent(name)}`);
  const toggle = page.getByRole("switch", { name: `Đang bán: ${name}` });
  await toggle.click();
  await expect(page.getByText("Đã ẩn sản phẩm")).toBeVisible();
  expect((await page.request.get(`${API}/api/v1/products/${product.id}`)).status()).toBe(404);

  await toggle.click();
  await expect(page.getByText("Đã mở bán lại")).toBeVisible();
  expect((await page.request.get(`${API}/api/v1/products/${product.id}`)).ok()).toBeTruthy();
});

test("admin restocks a product and the ledger records it", async ({ page }) => {
  await page.goto("/login?next=/admin");
  await loginViaUi(page, ADMIN.username, ADMIN.password);
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();

  const name = `E2E Stock ${Date.now()}`;
  const created = await page.request.post(`${API}/api/v1/admin/products`, {
    multipart: { name, price: "15000000", quantity: "3", shortDesc: "s", detailDesc: "d", factory: "ASUS", target: "GAMING" },
  });
  const { data: product } = await created.json();

  await page.goto(`/admin/products/${product.id}`);
  await page.getByRole("button", { name: "Điều chỉnh kho" }).click();
  await page.getByLabel("Số lượng thay đổi").fill("5");
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByText("Đã cập nhật tồn kho")).toBeVisible();

  await page.goto(`/admin/inventory?productId=${product.id}`);
  await expect(page.getByText("Nhập hàng").first()).toBeVisible();
  await expect(page.getByText("+5")).toBeVisible();
  await expect(page.getByText("Tồn ban đầu").first()).toBeVisible();
});

test("completing an order adds its total to today's revenue", async ({ page, request }) => {
  const orderId = await placeOrderViaApi(request);
  await page.goto("/login?next=/admin");
  await loginViaUi(page, ADMIN.username, ADMIN.password);
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  const sales = async () =>
    (await (await page.request.get(`${API}/api/v1/admin/dashboard/sales?from=${today}&to=${today}`)).json()).data.totals.revenue as number;
  const before = await sales();

  for (const status of ["SHIPPING", "COMPLETED"]) {
    const res = await page.request.patch(`${API}/api/v1/admin/orders/${orderId}/status`, { data: { status } });
    expect(res.ok()).toBeTruthy();
  }
  const order = (await (await page.request.get(`${API}/api/v1/admin/orders/${orderId}`)).json()).data;
  expect(await sales()).toBe(before + order.totalPrice);
  expect(order.history.map((h: { toStatus: string }) => h.toStatus)).toEqual(["PENDING", "SHIPPING", "COMPLETED"]);
});
