"use client";

import { Button, Drawer, Grid, Layout, Menu } from "antd";
import {
  BellRing,
  Banknote,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  MessageSquareQuote,
  Package,
  ShoppingBag,
  Store,
  Tag as TagIcon,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useMe } from "@/features/account/useMe";
import { useLogout } from "@/features/auth/hooks";
import styles from "./AdminShell.module.scss";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/inventory", label: "Kho hàng", icon: Warehouse },
  { href: "/admin/promotions", label: "Khuyến mãi", icon: TagIcon },
  { href: "/admin/payments", label: "Đối soát thanh toán", icon: Banknote },
  { href: "/admin/reviews", label: "Đánh giá", icon: MessageSquareQuote },
  { href: "/admin/notifications", label: "Thông báo", icon: BellRing },
  { href: "/admin/users", label: "Người dùng", icon: Users },
];

const activeKey = (pathname: string) =>
  NAV.slice(1).find((n) => pathname.startsWith(n.href))?.href ?? "/admin";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // before the first measurement (SSR) lg is undefined: render the desktop layout
  const desktop = Grid.useBreakpoint().lg !== false;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: me } = useMe();
  const logout = useLogout();

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[activeKey(pathname)]}
      onClick={() => setDrawerOpen(false)}
      items={NAV.map(({ href, label, icon: Icon }) => ({
        key: href,
        icon: <Icon size={18} aria-hidden="true" />,
        label: <Link href={href}>{label}</Link>,
      }))}
    />
  );

  return (
    <Layout className={styles.shell}>
      {desktop && (
        <Layout.Sider collapsible theme="light" width={232} className={styles.sider}>
          <div className={styles.brand}>LaptopShop</div>
          {menu}
        </Layout.Sider>
      )}
      <Layout>
        <Layout.Header className={styles.header}>
          {!desktop && (
            <Button
              type="text"
              aria-label="Mở menu"
              icon={<MenuIcon size={20} aria-hidden="true" />}
              onClick={() => setDrawerOpen(true)}
            />
          )}
          <span className={styles.spacer} />
          <Link href="/" className={styles.headerLink}>
            <Store size={18} aria-hidden="true" /> Cửa hàng
          </Link>
          <span className={styles.user}>{me?.fullName ?? me?.username}</span>
          <Button
            icon={<LogOut size={16} aria-hidden="true" />}
            loading={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSettled: () => {
                  router.replace("/");
                  router.refresh();
                },
              })
            }
          >
            Đăng xuất
          </Button>
        </Layout.Header>
        {/* antd renders Content as <main>; id is the skip-link target */}
        <Layout.Content id="main" className={styles.content}>
          {children}
        </Layout.Content>
      </Layout>
      <Drawer
        open={!desktop && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="left"
        title="LaptopShop"
      >
        {menu}
      </Drawer>
    </Layout>
  );
}
