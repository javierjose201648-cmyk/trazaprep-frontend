import EditionStrip from "../../components/EditionStrip/EditionStrip";
import Footnote from "../../components/Footnote/Footnote";
import Signature from "../../components/Signature/Signature";
import styles from "./Verificador.module.css";

export default function Verificador() {
  return (
    <>
      <EditionStrip label="Verificador de integridad" />

      <section className={styles.intro}>
        <h1 className={styles.headline}>
          Próximamente: <em>verificación</em> de actas.
        </h1>
        <p className={styles.lead}>
          Esta herramienta permitirá soltar el archivo de un acta para calcular
          su huella digital localmente y compararla, en segundos, con el
          registro inmutable. Si coinciden, el documento es auténtico. Si no,
          fue alterado entre captura y publicación.
        </p>
      </section>

      <div className={styles.placeholder}>
        <span className={styles.placeholderTag}>EN CONSTRUCCIÓN</span>
        <p>
          Próximo paso del prototipo · diseño del flujo de drag-and-drop con
          cálculo en cliente.
        </p>
      </div>

      <Footnote>
        El cálculo del hash sucede en tu navegador. El archivo del acta nunca
        sale de tu dispositivo — solo viaja su huella digital (un texto de 64
        caracteres) para compararla con el registro público.
      </Footnote>

      <Signature />
    </>
  );
}
