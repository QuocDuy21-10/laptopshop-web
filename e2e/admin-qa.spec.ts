import fs from "node:fs";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { API, assertApiUp, loginViaUi } from "./helpers";

// QA session 2026-10-26: Admin Portal black-box checks. Local only, not committed.
test.skip(
  !process.env.E2E_ADMIN_PASSWORD || !process.env.E2E_USER_PASSWORD,
  "E2E_ADMIN_PASSWORD and E2E_USER_PASSWORD are required for admin portal QA",
);
const ADMIN = { username: process.env.E2E_ADMIN_USERNAME ?? "admin@gmail.com", password: process.env.E2E_ADMIN_PASSWORD! };
const USER = { username: process.env.E2E_USER_USERNAME ?? "a@gmail.com", password: process.env.E2E_USER_PASSWORD! };
const EVIDENCE = "/Users/dinhduy/Workspace/nodejs/laptopshop-api/docs-local/test/reports/evidence/admin-portal-2026-10-26";
const RUN = `QA_ADMIN_E2E_${Date.now().toString(36).toUpperCase()}`;
const ROUTES = ["/admin", "/admin/products", "/admin/orders", "/admin/inventory", "/admin/promotions", "/admin/payments", "/admin/reviews", "/admin/after-sales", "/admin/notifications", "/admin/users"];

let adminState: Awaited<ReturnType<BrowserContext["storageState"]>>;
let userState: Awaited<ReturnType<BrowserContext["storageState"]>>;

// collects console errors and failed/4xx/5xx API calls for the evidence log
function watch(page: Page) {
  const log = { consoleErrors: [] as string[], badResponses: [] as string[], failedRequests: [] as string[] };
  page.on("console", (m) => m.type() === "error" && log.consoleErrors.push(m.text().slice(0, 300)));
  page.on("response", (r) => r.url().includes("/api/v1/") && r.status() >= 400 && log.badResponses.push(`${r.status()} ${r.request().method()} ${new URL(r.url()).pathname}`));
  page.on("requestfailed", (r) => log.failedRequests.push(`${r.method()} ${new URL(r.url()).pathname} ${r.failure()?.errorText}`));
  return log;
}
function saveLog(name: string, log: object) {
  fs.mkdirSync(EVIDENCE, { recursive: true });
  fs.appendFileSync(`${EVIDENCE}/e2e-network-console.jsonl`, JSON.stringify({ test: name, ...log }) + "\n");
}

const STATE_DIR = "/private/tmp/claude-501/-Users-dinhduy-Workspace-nodejs-laptopshop-api/fba6373c-99eb-4e09-8202-52cc3a1ac5b6/scratchpad/qa";
// a failing test restarts the worker and re-runs beforeAll; reusing a saved session keeps that from burning the 10-logins-per-15-minutes limiter
async function stateFor(browser: import("@playwright/test").Browser, who: "admin" | "user", creds: { username: string; password: string }) {
  const file = `${STATE_DIR}/e2e-state-${who}.json`;
  if (fs.existsSync(file) && Date.now() - fs.statSync(file).mtimeMs < 10 * 60_000) return JSON.parse(fs.readFileSync(file, "utf8"));
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/login");
  await loginViaUi(page, creds.username, creds.password);
  await expect(page).not.toHaveURL(/\/login/);
  const state = await ctx.storageState();
  fs.writeFileSync(file, JSON.stringify(state), { mode: 0o600 });
  await ctx.close();
  return state;
}

test.beforeAll(async ({ browser, request }) => {
  await expect.poll(async () => (await request.get(`${API}/healthz`).catch(() => null))?.ok(), { timeout: 90_000 }).toBeTruthy();
  adminState = await stateFor(browser, "admin", ADMIN);
  userState = await stateFor(browser, "user", USER);
});

test("E2E-AUTH-01 anonymous deep link to nested admin route redirects to login with next", async ({ page }) => {
  await page.goto("/admin/orders/1");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Forders%2F1/);
  await expect(page.getByLabel("Email")).toBeVisible();
});

test("E2E-AUTH-02 wrong password shows an error and stays on login", async ({ page }) => {
  await page.goto("/login");
  await loginViaUi(page, ADMIN.username, "definitely-wrong");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("alert").or(page.locator(".ant-message-error, .ant-alert-error")).first()).toBeVisible();
});

test("E2E-AUTH-03 normal user gets 403 on every admin route and never receives admin data", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: userState });
  const page = await ctx.newPage();
  const adminResponses: string[] = [];
  page.on("response", (r) => r.url().includes("/api/v1/admin/") && adminResponses.push(`${r.status()} ${new URL(r.url()).pathname}`));
  for (const route of ["/admin", "/admin/users", "/admin/products", "/admin/payments"]) {
    await page.goto(route);
    await expect(page.getByText("Bạn không có quyền truy cập trang quản trị.")).toBeVisible();
  }
  expect(adminResponses.filter((r) => r.startsWith("200"))).toEqual([]);
  expect((await ctx.request.get(`${API}/api/v1/admin/users`)).status()).toBe(403);
  saveLog("E2E-AUTH-03", { adminResponses });
  await ctx.close();
});

test("E2E-AUTH-04 admin: dashboard, refresh and deep link keep the session", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: adminState });
  const page = await ctx.newPage();
  const log = watch(page);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
  await page.goto("/admin/orders");
  await page.reload();
  await expect(page).toHaveURL(/\/admin\/orders$/);
  await page.goto("/admin/promotions/new");
  await expect(page).toHaveURL(/\/admin\/promotions\/new$/);
  expect(log.badResponses).toEqual([]);
  saveLog("E2E-AUTH-04", log);
  await ctx.close();
});

test("E2E-NAV-01 every sidebar entry loads without console errors or failed API calls", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: adminState, viewport: { width: 1366, height: 800 } });
  const page = await ctx.newPage();
  const log = watch(page);
  await page.goto("/admin");
  for (const label of ["Sản phẩm", "Đơn hàng", "Kho hàng", "Khuyến mãi", "Đối soát thanh toán", "Đánh giá", "Bảo hành & Hậu mãi", "Thông báo", "Người dùng", "Tổng quan"]) {
    await page.getByRole("menuitem", { name: label }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main, .ant-layout-content").first()).toBeVisible();
  }
  saveLog("E2E-NAV-01", log);
  expect.soft(log.badResponses, "API 4xx/5xx while navigating").toEqual([]);
  expect.soft(log.consoleErrors, "console errors").toEqual([]);
  await ctx.close();
});

test("E2E-AUTH-05 logout invalidates the session; Back button does not reveal admin data", async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/login?next=/admin");
  await loginViaUi(page, ADMIN.username, ADMIN.password);
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
  await page.goto("/admin/users");
  await page.getByRole("button", { name: "Đăng xuất" }).click();
  await page.waitForURL("**/");
  await page.goBack();
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toContain("admin@gmail.com");
  expect((await ctx.request.get(`${API}/api/v1/admin/dashboard`)).status()).toBe(401);
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/login/);
  await ctx.close();
});

test("E2E-FORM-01 product form blocks empty and invalid submissions", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: adminState });
  const page = await ctx.newPage();
  const created: string[] = [];
  page.on("request", (r) => r.method() === "POST" && r.url().includes("/admin/products") && created.push(r.url()));
  await page.goto("/admin/products/new");
  await page.getByRole("button", { name: "Thêm sản phẩm" }).click();
  await expect(page.getByText("Nhập tên sản phẩm")).toBeVisible();
  await expect(page.getByText("Nhập giá")).toBeVisible();
  await page.getByLabel("Giá (₫)").fill("-5");
  await page.getByLabel("Số lượng").fill("-1");
  await page.getByRole("button", { name: "Thêm sản phẩm" }).click();
  const errors = await page.locator(".ant-form-item-explain-error").allInnerTexts();
  saveLog("E2E-FORM-01", { priceValue: await page.getByLabel("Giá (₫)").inputValue(), qtyValue: await page.getByLabel("Số lượng").inputValue(), errors });
  // the numeric inputs clamp -5 / -1 to their minimum instead of showing the validation message (see UX findings)
  expect(errors).toEqual(expect.arrayContaining(["Nhập tên sản phẩm", "Chọn hãng", "Chọn nhu cầu"]));
  expect(created).toEqual([]);
  await ctx.close();
});

test("E2E-FORM-02 double-click on submit creates exactly one product", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: adminState });
  const page = await ctx.newPage();
  const name = `${RUN}_dbl`;
  await page.goto("/admin/products/new");
  await page.getByLabel("Tên sản phẩm").fill(name);
  await page.getByLabel("Giá (₫)").fill("15000000");
  await page.getByLabel("Số lượng").fill("5");
  await page.locator("#factory").click(); await page.keyboard.press("Enter");
  await page.locator("#target").click(); await page.keyboard.press("Enter");
  await page.getByLabel("Mô tả ngắn").fill("QA");
  await page.getByLabel("Mô tả chi tiết").fill("QA");
  await page.getByRole("button", { name: "Thêm sản phẩm" }).dblclick();
  await expect(page.getByText("Đã thêm sản phẩm")).toBeVisible();
  const res = await ctx.request.get(`${API}/api/v1/admin/products?q=${encodeURIComponent(name)}`);
  expect((await res.json()).meta.total).toBe(1);
  await ctx.close();
});

test("E2E-XSS-01 HTML in product name is rendered as text, never executed", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: adminState });
  const page = await ctx.newPage();
  let dialog = false;
  page.on("dialog", async (d) => { dialog = true; await d.dismiss(); });
  const name = `${RUN}_xss <img src=x onerror="window.__xss=1"> <script>window.__xss=2</script>`;
  const created = await ctx.request.post(`${API}/api/v1/admin/products`, { multipart: { name, price: "1000000", quantity: "1", shortDesc: "<b>s</b>", detailDesc: "<img src=x onerror=window.__xss=3>", factory: "ASUS", target: "GAMING" } });
  expect(created.status()).toBe(201);
  const { data } = await created.json();
  await page.goto(`/admin/products?q=${encodeURIComponent(`${RUN}_xss`)}`);
  await expect(page.getByText(`${RUN}_xss`).first()).toBeVisible();
  await page.goto(`/products/${data.id}`);
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  expect(dialog).toBe(false);
  await ctx.close();
});

test("E2E-ORDER-01 admin cancels a pending order through the confirm dialog; stock returns", async ({ browser }) => {
  const userCtx = await browser.newContext({ storageState: userState });
  const adminCtx = await browser.newContext({ storageState: adminState });
  const mk = await adminCtx.request.post(`${API}/api/v1/admin/products`, { multipart: { name: `${RUN}_cancel`, price: "2000000", quantity: "4", shortDesc: "s", detailDesc: "d", factory: "ASUS", target: "GAMING" } });
  const product = (await mk.json()).data;
  await userCtx.request.delete(`${API}/api/v1/cart`).catch(() => null);
  expect((await userCtx.request.post(`${API}/api/v1/cart/items`, { data: { productId: product.id, quantity: 2 } })).ok()).toBeTruthy();
  const quote = await userCtx.request.post(`${API}/api/v1/orders/quote`, { data: {} });
  const fp = (await quote.json()).data.pricingFingerprint;
  const order = await userCtx.request.post(`${API}/api/v1/orders`, { headers: { "Idempotency-Key": crypto.randomUUID() }, data: { receiverName: "QA", receiverAddress: "QA", receiverPhone: "0900000000", paymentMethod: "COD", pricingFingerprint: fp } });
  expect(order.status()).toBe(201);
  const orderId = (await order.json()).data.id;
  const page = await adminCtx.newPage();
  await page.goto(`/admin/orders/${orderId}`);
  await page.getByRole("button", { name: /Hu(ỷ|y|ỷ)\s*đơn|Huỷ|Hủy/ }).first().click();
  await expect(page.getByText("Huỷ đơn hàng này?")).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận huỷ" }).click();
  await expect(page.getByText('Đã chuyển sang "Đã huỷ"').or(page.getByText(/Đã chuyển sang/))).toBeVisible();
  const after = (await (await adminCtx.request.get(`${API}/api/v1/admin/products/${product.id}`)).json()).data;
  expect(after.quantity).toBe(4);
  await expect(page.getByRole("button", { name: "Giao hàng" })).toHaveCount(0);
  await userCtx.close(); await adminCtx.close();
});

for (const vp of [{ name: "mobile-375", width: 375, height: 812 }, { name: "tablet-768", width: 768, height: 1024 }]) {
  test(`E2E-RESP-${vp.name} admin pages have no page-level horizontal overflow`, async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: adminState, viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const overflowing: string[] = [];
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 1) overflowing.push(`${route} (+${over}px)`);
      await page.screenshot({ path: `${EVIDENCE}/resp-${vp.name}-${route.replace(/\W+/g, "_") || "root"}.png`, fullPage: false });
    }
    saveLog(`E2E-RESP-${vp.name}`, { overflowing });
    expect(overflowing, "pages with horizontal page scroll").toEqual([]);
    await ctx.close();
  });
}

test("E2E-A11Y-01 admin pages: unnamed buttons/links and inputs without labels", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: adminState });
  const page = await ctx.newPage();
  const issues: string[] = [];
  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const found = await page.evaluate(() => {
      const name = (el: Element) => (el.getAttribute("aria-label") || el.getAttribute("title") || (el as HTMLElement).innerText || el.getAttribute("aria-labelledby") || "").trim();
      const buttons = [...document.querySelectorAll("button, a[href], [role=button]")].filter((el) => !name(el)).length;
      const inputs = [...document.querySelectorAll("input:not([type=hidden]), select, textarea")].filter((el) => {
        const i = el as HTMLInputElement;
        return !(i.getAttribute("aria-label") || i.getAttribute("aria-labelledby") || i.labels?.length || i.getAttribute("title") || i.getAttribute("placeholder"));
      }).length;
      const imgs = [...document.querySelectorAll("img")].filter((el) => !el.hasAttribute("alt")).length;
      return { buttons, inputs, imgs, h1: document.querySelectorAll("h1").length, h2: document.querySelectorAll("h2").length, path: location.pathname, headings: [...document.querySelectorAll("h1,h2,h3")].map((h) => (h as HTMLElement).innerText.slice(0, 30)).slice(0, 3), lang: document.documentElement.lang };
    });
    if (found.path !== route) issues.push(`${route}: REDIRECTED to ${found.path}`);
    if (found.buttons || found.inputs || found.imgs || found.h1 !== 1) issues.push(`${route}: ${JSON.stringify(found)}`);
  }
  saveLog("E2E-A11Y-01", { issues });
  expect.soft(issues, "basic a11y findings").toEqual([]);
  await ctx.close();
});

test("E2E-KBD-01 login form is operable by keyboard only", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").focus();
  await page.keyboard.type(ADMIN.username);
  await page.keyboard.press("Tab");
  await page.keyboard.type("wrong-pass-kbd");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/login/);
});

// ---- replacements for the three admin.spec.ts scenarios that fail on the current API contract / catalog size ----
async function adminProduct(adminCtx: BrowserContext, tag: string, quantity = 5) {
  const r = await adminCtx.request.post(`${API}/api/v1/admin/products`, { multipart: { name: `${RUN}_${tag}`, price: "3000000", quantity: String(quantity), shortDesc: "s", detailDesc: "d", factory: "ASUS", target: "GAMING" } });
  expect(r.status()).toBe(201);
  return (await r.json()).data as { id: number; name: string };
}
async function placeCodOrder(userCtx: BrowserContext, productId: number, quantity = 1) {
  expect((await userCtx.request.post(`${API}/api/v1/cart/items`, { data: { productId, quantity } })).ok()).toBeTruthy();
  const quote = await userCtx.request.post(`${API}/api/v1/orders/quote`, { data: {} });
  const fp = (await quote.json()).data.pricingFingerprint;
  const order = await userCtx.request.post(`${API}/api/v1/orders`, { headers: { "Idempotency-Key": crypto.randomUUID() }, data: { receiverName: "QA", receiverAddress: "QA", receiverPhone: "0900000000", paymentMethod: "COD", pricingFingerprint: fp } });
  expect(order.status()).toBe(201);
  return (await order.json()).data.id as number;
}

test("E2E-ORDER-02 admin ships then completes an order in the UI; revenue and history update", async ({ browser }) => {
  const userCtx = await browser.newContext({ storageState: userState });
  const adminCtx = await browser.newContext({ storageState: adminState });
  const product = await adminProduct(adminCtx, "ship");
  const orderId = await placeCodOrder(userCtx, product.id);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  const revenue = async () => (await (await adminCtx.request.get(`${API}/api/v1/admin/dashboard/sales?from=${today}&to=${today}`)).json()).data.totals.revenue as number;
  const before = await revenue();
  const page = await adminCtx.newPage();
  await page.goto(`/admin/orders/${orderId}`);
  await page.getByRole("button", { name: "Giao hàng" }).click();
  await expect(page.getByText('Đã chuyển sang "Đang giao"')).toBeVisible();
  await page.getByRole("button", { name: "Hoàn thành" }).click();
  await expect(page.getByText(/Đã chuyển sang/).last()).toBeVisible();
  const order = (await (await adminCtx.request.get(`${API}/api/v1/admin/orders/${orderId}`)).json()).data;
  expect(order.status).toBe("COMPLETED");
  expect(order.history.map((h: { toStatus: string }) => h.toStatus)).toEqual(["PENDING", "SHIPPING", "COMPLETED"]);
  expect(await revenue()).toBe(before + order.totalPrice);
  await expect(page.getByRole("button", { name: "Giao hàng" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Hu(ỷ|y)\s*đơn/ })).toHaveCount(0);
  await userCtx.close(); await adminCtx.close();
});

test("E2E-INV-01 receipt: pick product by searching, save draft, confirm once, stock +N exactly once", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: adminState });
  const page = await ctx.newPage();
  const product = await adminProduct(ctx, "receipt", 0);
  await page.goto("/admin/inventory/receipts/new");
  await page.getByLabel("Nhà cung cấp").fill(`${RUN} supplier`);
  await page.getByLabel("Sản phẩm 1").fill(product.name);
  await page.getByText(product.name, { exact: true }).click();
  await page.getByLabel("Số lượng 1").fill("3");
  await page.getByLabel("Giá nhập 1").fill("2000000");
  await page.getByRole("button", { name: "Lưu bản nháp" }).click();
  await expect(page.getByText("Đã lưu phiếu nhập")).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận nhập kho" }).click();
  await page.getByRole("button", { name: "Xác nhận nhập kho" }).last().dblclick();
  await expect(page.getByText("Đã xác nhận nhập kho")).toBeVisible();
  const after = (await (await ctx.request.get(`${API}/api/v1/admin/products/${product.id}`)).json()).data;
  expect(after.quantity).toBe(3);
  const mv = (await (await ctx.request.get(`${API}/api/v1/admin/inventory/movements?productId=${product.id}`)).json()).data;
  expect(mv.filter((m: { delta: number }) => m.delta === 3)).toHaveLength(1);
  await ctx.close();
});

test("E2E-INV-02 stock adjustment dialog rejects 0 and over-withdrawal with a visible error", async ({ browser }) => {
  const ctx = await browser.newContext({ storageState: adminState });
  const page = await ctx.newPage();
  const product = await adminProduct(ctx, "adjust", 2);
  await page.goto(`/admin/products/${product.id}`);
  await page.getByRole("button", { name: "Điều chỉnh kho" }).click();
  await page.getByText("Điều chỉnh kiểm kê").click();
  await page.getByLabel("Số lượng thay đổi").fill("-9");
  await page.getByLabel("Ghi chú").fill("QA over-withdrawal");
  await page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(page.getByText(/không đủ|hết hàng|OUT_OF_STOCK|tồn kho/i).first()).toBeVisible();
  const after = (await (await ctx.request.get(`${API}/api/v1/admin/products/${product.id}`)).json()).data;
  expect(after.quantity).toBe(2);
  await ctx.close();
});
