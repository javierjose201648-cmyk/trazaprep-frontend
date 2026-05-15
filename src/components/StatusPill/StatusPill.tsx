import type { EstadoCasilla } from "../../types";
import styles from "./StatusPill.module.css";

interface Props {
  estado: EstadoCasilla;
}

const LABELS: Record<EstadoCasilla, string> = {
  "completa":     "Completa",
  "en-proceso":   "En proceso",
  "sin-registro": "Sin registro",
};

const CLASSES: Record<EstadoCasilla, string> = {
  "completa":     styles.ok,
  "en-proceso":   styles.warn,
  "sin-registro": styles.err,
};

export default function StatusPill({ estado }: Props) {
  return (
    <span className={`${styles.pill} ${CLASSES[estado]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {LABELS[estado]}
    </span>
  );
}
