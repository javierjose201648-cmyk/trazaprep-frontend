import { useCallback, useRef, useState } from "react";
import EditionStrip from "../../components/EditionStrip/EditionStrip";
import Footnote from "../../components/Footnote/Footnote";
import Signature from "../../components/Signature/Signature";
import { verificarHash } from "../../services/mock";
import type { ResultadoVerificacion } from "../../types";
import { fechaLarga } from "../../utils/format";
import styles from "./Verificador.module.css";

// ── Tipos ──────────────────────────────────────────────────────────

type Fase =
  | { tipo: "idle" }
  | { tipo: "leyendo" }
  | { tipo: "listo"; hash: string; nombre: string; tamano: number }
  | { tipo: "verificando"; hash: string; nombre: string; tamano: number }
  | { tipo: "resultado"; hash: string; nombre: string; tamano: number; resultado: ResultadoVerificacion }
  | { tipo: "error"; mensaje: string };

// ── Helpers ────────────────────────────────────────────────────────

async function calcularSHA256(archivo: File): Promise<string> {
  const buffer = await archivo.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = Array.from(new Uint8Array(hashBuffer));
  // 64 chars hex sin prefijo "0x" — formato estándar para el backend
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Componente ─────────────────────────────────────────────────────

export default function Verificador() {
  const [clave, setClave] = useState("");
  const [fase, setFase] = useState<Fase>({ tipo: "idle" });
  const [dragActivo, setDragActivo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  // ── Leer archivo y calcular hash ──────────────────────────────

  const procesarArchivo = useCallback(async (archivo: File) => {
    setFase({ tipo: "leyendo" });
    setCopiado(false);
    try {
      const hash = await calcularSHA256(archivo);
      setFase({ tipo: "listo", hash, nombre: archivo.name, tamano: archivo.size });
    } catch {
      setFase({ tipo: "error", mensaje: "No se pudo leer el archivo. Intenta de nuevo." });
    }
  }, []);

  // ── Drag and drop ─────────────────────────────────────────────

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActivo(false);
      const archivo = e.dataTransfer.files[0];
      if (archivo) procesarArchivo(archivo);
    },
    [procesarArchivo],
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActivo(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    // Solo desactivar si el cursor salió del contenedor completo
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragActivo(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) procesarArchivo(archivo);
    e.target.value = ""; // permite re-seleccionar el mismo archivo
  };

  // ── Verificar ─────────────────────────────────────────────────

  const verificar = async () => {
    if (fase.tipo !== "listo") return;
    const { hash, nombre, tamano } = fase;
    setFase({ tipo: "verificando", hash, nombre, tamano });
    try {
      const resultado = await verificarHash(clave.trim().toUpperCase(), hash);
      setFase({ tipo: "resultado", hash, nombre, tamano, resultado });
    } catch {
      setFase({ tipo: "error", mensaje: "Error de red al consultar el registro. Intenta de nuevo." });
    }
  };

  const reiniciar = () => {
    setFase({ tipo: "idle" });
    setClave("");
    setCopiado(false);
  };

  const copiarHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // ── Estado derivado ───────────────────────────────────────────

  const claveValida = clave.trim().length >= 3;
  const tieneArchivo =
    fase.tipo === "listo" || fase.tipo === "verificando" || fase.tipo === "resultado";
  const zonaClickable =
    (fase.tipo === "idle" || fase.tipo === "listo") && !dragActivo;

  // ── Render ────────────────────────────────────────────────────

  return (
    <>
      <EditionStrip label="Verificador de integridad" />

      <section className={styles.intro}>
        <h1 className={styles.headline}>
          Verifica la <em>integridad</em> de un acta.
        </h1>
        <p className={styles.lead}>
          Suelto el archivo digital de un acta, su huella se calcula en tu
          navegador y se compara contra el registro inmutable. Si coinciden,
          el documento es auténtico. Si no, fue alterado entre captura y
          publicación.
        </p>
      </section>

      <div className={styles.formulario}>

        {/* ── Clave de casilla ─────────────────────────────────── */}
        <div className={styles.campoGrupo}>
          <label className={styles.campoLabel} htmlFor="clave-input">
            Clave de casilla
          </label>
          <div className={styles.campoFila}>
            <span className={styles.flecha} aria-hidden="true">→</span>
            <input
              id="clave-input"
              className={styles.claveInput}
              type="text"
              placeholder="Ej. CHI-001-0001"
              value={clave}
              onChange={(e) => setClave(e.target.value.toUpperCase())}
              disabled={fase.tipo === "verificando" || fase.tipo === "resultado"}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        {/* ── Zona drag-and-drop ───────────────────────────────── */}
        <div
          className={[
            styles.zona,
            dragActivo ? styles.zonaActiva : "",
            tieneArchivo ? styles.zonaCompleta : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => zonaClickable && inputFileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && zonaClickable) {
              inputFileRef.current?.click();
            }
          }}
          aria-label={
            tieneArchivo
              ? "Haz clic para reemplazar el archivo"
              : "Zona para soltar el archivo del acta"
          }
        >
          <input
            ref={inputFileRef}
            type="file"
            className={styles.inputOculto}
            onChange={onFileChange}
            tabIndex={-1}
          />

          {fase.tipo === "idle" && (
            <div className={styles.zonaTexto}>
              <span className={styles.zonaInstruccion}>
                Suelta el archivo del acta aquí
              </span>
              <span className={styles.zonaSecundario}>
                o haz clic para seleccionarlo
              </span>
            </div>
          )}

          {fase.tipo === "leyendo" && (
            <div className={styles.zonaTextoFila}>
              <span className={styles.loadingDot} />
              <span className={styles.zonaInstruccion}>
                Calculando huella digital…
              </span>
            </div>
          )}

          {tieneArchivo && (
            <div className={styles.archivoCargado}>
              <span className={styles.archivoNombre}>{fase.nombre}</span>
              <span className={styles.archivoTamano}>
                {formatearTamano(fase.tamano)}
              </span>
              {fase.tipo === "listo" && (
                <span className={styles.archivoAccion}>cambiar archivo</span>
              )}
            </div>
          )}
        </div>

        {/* ── Hash calculado ───────────────────────────────────── */}
        {tieneArchivo && (
          <div className={styles.hashBloque}>
            <span className={styles.hashEyebrow}>
              Huella digital calculada · SHA-256
            </span>
            <div className={styles.hashFila}>
              <code className={styles.hashValor}>{fase.hash}</code>
              <button
                className={styles.copiarBtn}
                onClick={() => copiarHash(fase.hash)}
                type="button"
              >
                {copiado ? "copiado" : "copiar"}
              </button>
            </div>
          </div>
        )}

        {/* ── Botón verificar ──────────────────────────────────── */}
        {(fase.tipo === "listo" || fase.tipo === "verificando") && (
          <div className={styles.accion}>
            <button
              className={styles.verificarBtn}
              onClick={verificar}
              disabled={fase.tipo !== "listo" || !claveValida}
              type="button"
            >
              {fase.tipo === "verificando" ? (
                <>
                  <span className={styles.loadingDot} />
                  Consultando el registro…
                </>
              ) : (
                "Verificar integridad"
              )}
            </button>
            {!claveValida && fase.tipo === "listo" && (
              <p className={styles.avisoFila}>
                Ingresa la clave de casilla para continuar.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Resultado ──────────────────────────────────────────── */}
      {fase.tipo === "resultado" && (
        <div
          className={
            fase.resultado.coincide
              ? styles.resultadoCoincide
              : styles.resultadoNoCoincide
          }
        >
          <div className={styles.resultadoEncabezado}>
            <span className={styles.resultadoEyebrow}>
              {fase.resultado.coincide
                ? "Verificación exitosa"
                : "Verificación fallida"}
            </span>
            <p className={styles.resultadoMensaje}>{fase.resultado.mensaje}</p>
            {fase.resultado.coincide && fase.resultado.timestamp && (
              <p className={styles.resultadoTimestamp}>
                Registrado el{" "}
                {fechaLarga(
                  Math.floor(
                    new Date(fase.resultado.timestamp).getTime() / 1000,
                  ),
                )}
              </p>
            )}
          </div>
          <button
            className={styles.reiniciarBtn}
            onClick={reiniciar}
            type="button"
          >
            Verificar otro archivo
          </button>
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────────── */}
      {fase.tipo === "error" && (
        <div className={styles.errorBloque}>
          <span className={styles.errorLabel}>Error</span>
          <p className={styles.errorMensaje}>{fase.mensaje}</p>
          <button
            className={styles.reiniciarBtn}
            onClick={reiniciar}
            type="button"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      <Footnote>
        El cálculo de la huella digital sucede en tu navegador. El archivo del
        acta nunca sale de tu dispositivo — solo viajan sus 64 caracteres
        hexadecimales para compararlos con el registro público. Nota: esta
        herramienta requiere el archivo digital canónico; una fotografía del
        acta no producirá la misma huella que el documento original.
      </Footnote>

      <Signature />
    </>
  );
}
