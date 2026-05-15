import { useEffect, useState } from "react";
import { timestampActual } from "../../utils/format";
import styles from "./EditionStrip.module.css";

interface Props {
  /** Texto del lado izquierdo (default: "Bitácora pública en tiempo real"). */
  label?: string;
}

export default function EditionStrip({
  label = "Bitácora pública en tiempo real",
}: Props) {
  const [ts, setTs] = useState(timestampActual());

  // Refresca el timestamp cada 30s para que el dashboard se sienta vivo
  useEffect(() => {
    const id = setInterval(() => setTs(timestampActual()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.strip}>
      <span className={styles.left}>
        <span className={styles.dot} aria-hidden="true" />
        {label}
      </span>
      <span className={styles.right}>Última actualización · {ts}</span>
    </div>
  );
}
