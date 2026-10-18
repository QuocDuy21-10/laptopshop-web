import styles from "./Spinner.module.scss";

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className={styles.spinner} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" strokeWidth="3" />
    </svg>
  );
}
