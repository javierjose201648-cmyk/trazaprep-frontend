import EditionStrip from "../../components/EditionStrip/EditionStrip";
import Footnote from "../../components/Footnote/Footnote";
import Signature from "../../components/Signature/Signature";
import styles from "./Busqueda.module.css";

export default function Busqueda() {
  return (
    <>
      <EditionStrip label="Búsqueda por casilla" />

      <section className={styles.intro}>
        <h1 className={styles.headline}>
          Próximamente: <em>búsqueda</em> por casilla.
        </h1>
        <p className={styles.lead}>
          Esta vista permitirá ingresar la clave de una casilla (por ejemplo
          <span className={styles.mono}> CHI-001-0001</span>) y ver el recorrido
          completo de su acta como una línea de tiempo de cuatro eventos:
          captura, transmisión, validación y publicación.
        </p>
      </section>

      <div className={styles.placeholder}>
        <span className={styles.placeholderTag}>EN CONSTRUCCIÓN</span>
        <p>Próximo paso del prototipo · diseño de la línea de tiempo en curso.</p>
      </div>

      <Footnote>
        Los datos mostrados aquí no son resultados oficiales. La integridad
        técnica del PREP es complementaria a los procesos de validación del
        Instituto Estatal Electoral.
      </Footnote>

      <Signature />
    </>
  );
}
