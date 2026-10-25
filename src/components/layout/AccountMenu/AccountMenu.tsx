"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import { Bell, ChevronDown, Heart, LayoutDashboard, LogOut, Package, User, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { useMe } from "@/features/account/useMe";
import { useLogout } from "@/features/auth/hooks";
import { loginHref } from "@/lib/safe-next";
import styles from "./AccountMenu.module.scss";

export function AccountMenu() {
  const { data: me, isPending } = useMe();
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  if (isPending) return <Skeleton className={styles.skeleton} />;
  if (!me) {
    return (
      <Link href={loginHref(pathname)} className={styles.trigger}>
        <User size={20} aria-hidden="true" />
        <span>Đăng nhập</span>
      </Link>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger className={styles.trigger}>
        <User size={20} aria-hidden="true" />
        <span className={styles.name}>{me.fullName ?? me.username}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" sideOffset={8} className={styles.content}>
          <Menu.Item asChild className={styles.item}>
            <Link href="/account">
              <User size={18} aria-hidden="true" /> Hồ sơ
            </Link>
          </Menu.Item>
          <Menu.Item asChild className={styles.item}>
            <Link href="/account/orders">
              <Package size={18} aria-hidden="true" /> Đơn hàng
            </Link>
          </Menu.Item>
          <Menu.Item asChild className={styles.item}>
            <Link href="/account/after-sales"><Wrench size={18} aria-hidden="true" /> Bảo hành & Hậu mãi</Link>
          </Menu.Item>
          <Menu.Item asChild className={styles.item}>
            <Link href="/wishlist"><Heart size={18} aria-hidden="true" /> Sản phẩm yêu thích</Link>
          </Menu.Item>
          <Menu.Item asChild className={styles.item}>
            <Link href="/account/notifications"><Bell size={18} aria-hidden="true" /> Thông báo</Link>
          </Menu.Item>
          {me.role === "ADMIN" && (
            <Menu.Item asChild className={styles.item}>
              <Link href="/admin">
                <LayoutDashboard size={18} aria-hidden="true" /> Trang quản trị
              </Link>
            </Menu.Item>
          )}
          <Menu.Separator className={styles.separator} />
          <Menu.Item
            className={styles.item}
            onSelect={() =>
              logout.mutate(undefined, {
                onSettled: () => {
                  router.replace("/");
                  router.refresh();
                },
              })
            }
          >
            <LogOut size={18} aria-hidden="true" /> Đăng xuất
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
