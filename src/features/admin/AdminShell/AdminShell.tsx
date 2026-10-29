"use client";

import { Button, Drawer, Grid, Layout, Menu, type MenuProps } from "antd";
import {
  BellRing,
  Banknote,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  MessageSquareQuote,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingBag,
  Tag as TagIcon,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo/BrandLogo";
import { useMe } from "@/features/account/useMe";
import { useLogout } from "@/features/auth/hooks";
import styles from "./AdminShell.module.scss";

type NavItem = { href: string; label: string; icon: typeof Package };

// grouped by job; routes are unchanged
const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: "", items: [{ href: "/admin", label: "Tổng quan", icon: LayoutDashboard }] },
  {
    title: "Bán hàng",
    items: [
      { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
      { href: "/admin/payments", label: "Đối soát thanh toán", icon: Banknote },
      { href: "/admin/promotions", label: "Khuyến mãi", icon: TagIcon },
    ],
  },
  {
    title: "Danh mục",
    items: [
      { href: "/admin/products", label: "Sản phẩm", icon: Package },
      { href: "/admin/inventory", label: "Kho hàng", icon: Warehouse },
    ],
  },
  {
    title: "Khách hàng",
    items: [
      { href: "/admin/users", label: "Người dùng", icon: Users },
      { href: "/admin/reviews", label: "Đánh giá", icon: MessageSquareQuote },
      { href: "/admin/after-sales", label: "Bảo hành & Hậu mãi", icon: Wrench },
    ],
  },
  { title: "Hệ thống", items: [{ href: "/admin/notifications", label: "Thông báo", icon: BellRing }] },
];

const NAV = NAV_GROUPS.flatMap((group) => group.items);

const activeKey = (pathname: string) =>
  NAV.filter((n) => n.href !== "/admin").find((n) => pathname.startsWith(n.href))?.href ?? "/admin";

const toItem = ({ href, label, icon: Icon }: NavItem) => ({
  key: href,
  icon: <Icon size={18} aria-hidden="true" />,
  label: <Link href={href}>{label}</Link>,
});

const MENU_ITEMS: MenuProps["items"] = NAV_GROUPS.map((group) =>
  group.title
    ? { type: "group" as const, key: group.title, label: group.title, children: group.items.map(toItem) }
    : toItem(group.items[0]),
);

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link href="/admin" className={styles.brand} aria-label="LaptopShop quản trị">
      <BrandLogo compact={compact} />
      {!compact && <span className={styles.brandLabel}>Quản trị</span>}
    </Link>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // before the first measurement (SSR) lg is undefined: render the desktop layout
  const desktop = Grid.useBreakpoint().lg !== false;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data: me } = useMe();
  const logout = useLogout();

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[activeKey(pathname)]}
      onClick={() => setDrawerOpen(false)}
      items={MENU_ITEMS}
      className={styles.menu}
    />
  );

  return (
    <Layout className={styles.shell}>
      {desktop && (
        <Layout.Sider
          width={240}
          collapsedWidth={72}
          collapsed={collapsed}
          trigger={null}
          className={styles.sider}
          aria-label="Điều hướng quản trị"
        >
          <div className={styles.siderTop}>
            <Brand compact={collapsed} />
          </div>
          <nav aria-label="Điều hướng quản trị" className={styles.siderNav}>
            {menu}
          </nav>
        </Layout.Sider>
      )}
      <Layout className={styles.body}>
        <Layout.Header className={styles.header}>
          {desktop ? (
            <Button
              type="text"
              aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
              aria-expanded={!collapsed}
              icon={collapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
              onClick={() => setCollapsed((value) => !value)}
            />
          ) : (
            <>
              <Button
                type="text"
                aria-label="Mở menu"
                icon={<MenuIcon size={20} aria-hidden="true" />}
                onClick={() => setDrawerOpen(true)}
              />
              <Brand />
            </>
          )}
          <span className={styles.spacer} />
          <Link href="/" className={styles.headerLink}>
            <ExternalLink size={16} aria-hidden="true" />
            <span>Xem cửa hàng</span>
          </Link>
          {me ? <span className={styles.user}>{me.fullName ?? me.username}</span> : null}
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
        size={280}
        title={<Brand />}
        styles={{ body: { padding: 8 } }}
      >
        <nav aria-label="Điều hướng quản trị">{menu}</nav>
      </Drawer>
    </Layout>
  );
}
