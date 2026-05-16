import { NavLink } from "react-router-dom";
import styles from "./Masthead.module.css";

export default function Masthead() {
  return (
    <header className={styles.masthead}>
      <div>
        <NavLink to="/" className={styles.wordmark}>
          <span className={styles.traza}>Traza</span>
          <span className={styles.prep}>PREP</span>
        </NavLink>
        <p className={styles.tagline}>
          Auditoría ciudadana del PREP
        </p>
      </div>
      <nav className={styles.nav} aria-label="Navegación principal">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          Inicio
        </NavLink>
        <NavLink
          to="/busqueda"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          Búsqueda
        </NavLink>
        <NavLink
          to="/verificador"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          Verificador
        </NavLink>
      </nav>
    </header>
  );
}
