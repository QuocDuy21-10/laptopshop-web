import type { ComponentProps, ReactNode } from "react";
import { Container } from "@/components/layout/Container/Container";
import { cx } from "@/lib/cx";
import { PageHeader } from "../PageHeader/PageHeader";
import styles from "./Page.module.scss";

type Props = Partial<ComponentProps<typeof PageHeader>> & {
  children: ReactNode;
  className?: string;
};

/**
 * Standard storefront page frame: container, top spacing under the sticky header, the page heading and a
 * consistent gap between sections. Leave `title` out when the content renders its own `h1`.
 */
export function Page({ title, description, actions, eyebrow, titleId, children, className }: Props) {
  return (
    <Container className={cx(styles.page, className)}>
      {title ? (
        <PageHeader title={title} description={description} actions={actions} eyebrow={eyebrow} titleId={titleId} />
      ) : null}
      {children}
    </Container>
  );
}
