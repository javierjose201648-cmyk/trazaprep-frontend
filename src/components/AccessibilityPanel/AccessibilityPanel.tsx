import { useState } from "react";
import { useAccessibility } from "../../context/AccessibilityContext";
import styles from "./AccessibilityPanel.module.css";

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const { settings, toggle } = useAccessibility();

  const anyActive = settings.largeText || settings.daltonismo || settings.altoContraste;

  return (
    <div className={styles.container}>
      {open && (
        <div
          className={styles.panel}
          role="dialog"
          aria-label="Opciones de accesibilidad"
        >
          <div className={styles.header}>
            <span className={styles.title}>Accesibilidad</span>
            <button
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Cerrar panel"
            >
              ×
            </button>
          </div>

          <div className={styles.options}>
            <Option
              label="Texto grande"
              desc="Aumenta el tamaño de letra para mayor legibilidad"
              active={settings.largeText}
              onToggle={() => toggle("largeText")}
            />
            <Option
              label="Modo daltónico"
              desc="Paleta de colores apta para todas las visiones"
              active={settings.daltonismo}
              onToggle={() => toggle("daltonismo")}
            />
            <Option
              label="Alto contraste"
              desc="Mayor diferencia entre colores y fondos"
              active={settings.altoContraste}
              onToggle={() => toggle("altoContraste")}
            />
          </div>
        </div>
      )}

      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ""} ${anyActive ? styles.fabActive : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Opciones de accesibilidad"
        aria-expanded={open}
        title="Opciones de accesibilidad"
      >
        <span className={styles.fabLabel} aria-hidden="true">Aa</span>
        {anyActive && <span className={styles.badge} aria-hidden="true" />}
      </button>
    </div>
  );
}

interface OptionProps {
  label: string;
  desc: string;
  active: boolean;
  onToggle: () => void;
}

function Option({ label, desc, active, onToggle }: OptionProps) {
  return (
    <button
      className={`${styles.option} ${active ? styles.optionActive : ""}`}
      onClick={onToggle}
      role="switch"
      aria-checked={active}
    >
      <div className={styles.optionText}>
        <span className={styles.optionLabel}>{label}</span>
        <span className={styles.optionDesc}>{desc}</span>
      </div>
      <div className={`${styles.toggle} ${active ? styles.toggleOn : ""}`}>
        <div className={styles.thumb} />
      </div>
    </button>
  );
}
