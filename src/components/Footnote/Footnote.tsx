import type { ReactNode } from "react";
import styles from "./Footnote.module.css";

interface Props {
  children: ReactNode;
}

export default function Footnote({ children }: Props) {
  return (
    <aside className={styles.footnote}>
      <div className={styles.marker} aria-hidden="true">§</div>
      <p>{children}</p>
    </aside>
  );
}
